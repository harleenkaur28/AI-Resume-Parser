from __future__ import annotations

import json
import os
import typing as t
from dataclasses import dataclass

import requests
from dotenv import load_dotenv
from langchain_core.messages import HumanMessage
from langchain_core.prompts import ChatPromptTemplate
from langchain_google_genai import ChatGoogleGenerativeAI
from langgraph.graph import MessagesState, START, END, StateGraph
from langgraph.prebuilt import ToolNode, tools_condition

try:
    from app.core.llm import llm as default_llm

except Exception:
    default_llm = None


from app.core.llm import MODEL_NAME

load_dotenv()


from app.agents.web_content_agent import return_markdown


from app.data.ai.jd_evaluator import jd_evaluator_prompt_template as ATS_PROMPT


def _try_init_tavily() -> list:
    try:
        from langchain_tavily import TavilySearch

        return [
            TavilySearch(
                max_results=3,
                topic="general",
            )
        ]

    except Exception:
        return []


@dataclass
class GraphConfig:
    model: str = MODEL_NAME
    temperature: float = 0.1


class ATSEvaluatorGraph:
    def __init__(
        self,
        resume_text: str,
        jd_text: str,
        company_name: str | None = None,
        company_website: str | None = None,
        llm: ChatGoogleGenerativeAI | None = None,
        config: GraphConfig | None = None,
    ) -> None:
        self.config = config or GraphConfig()
        # Prefer shared LLM

        if llm is not None:
            self.llm = llm

        elif default_llm is not None:
            self.llm = default_llm

        else:
            self.llm = ChatGoogleGenerativeAI(
                model=self.config.model,
                temperature=self.config.temperature,
            )

        self.tools = _try_init_tavily()
        self.llm_with_tools = (
            self.llm.bind_tools(
                tools=self.tools,
            )
            if self.tools
            else self.llm
        )

        site_md = return_markdown(company_website) if company_website else ""

        self.system_prompt = ATS_PROMPT.format_messages(
            resume=resume_text.strip(),
            jd=(jd_text or "").strip(),
            company_name=(company_name or "the company"),
            company_website_content=site_md,
        )
        self.graph = None

    def agent(self, state: MessagesState):
        msgs = state["messages"]
        inp = [*self.system_prompt] + msgs
        response = self.llm_with_tools.invoke(inp)
        return {"messages": [response]}

    def build(self):
        g = StateGraph(MessagesState)

        g.add_node("agent", self.agent)

        if self.tools:
            g.add_node("tools", ToolNode(tools=self.tools))

        g.add_edge(START, "agent")

        if self.tools:
            g.add_conditional_edges("agent", tools_condition)
            g.add_edge("tools", "agent")

        g.add_edge("agent", END)

        self.graph = g.compile()

        return self.graph

    def __call__(self):
        return self.build()


def evaluate_ats(
    resume_text: str,
    jd_text: str,
    company_name: str | None = None,
    company_website: str | None = None,
) -> tuple[dict, str]:
    """Run ATS evaluation and return (structured_json, narrative_text).

    The model is prompted to return JSON first and then a narrative. We parse the JSON
    from the top of the response and return both components.
    """
    graph = ATSEvaluatorGraph(
        resume_text=resume_text,
        jd_text=jd_text,
        company_name=company_name,
        company_website=company_website,
    )()

    resp = graph.invoke(
        {
            "messages": [
                HumanMessage(
                    content=(
                        "Return JSON first (no preamble), then a blank line, then the narrative titled 'Analysis Narrative'."
                    )
                )
            ]
        }
    )
    content = resp.get("messages", [])[-1].content if resp else ""
    if not isinstance(content, str):
        content = str(content)

    # Try to parse top-level JSON
    content_str = content.strip()
    json_obj: dict = {}
    narrative = ""
    try:
        # If content starts with JSON, parse until the matching brace
        if content_str.startswith("{"):
            # naive brace matching
            brace = 0
            end_idx = -1
            for i, ch in enumerate(content_str):
                if ch == "{":
                    brace += 1
                elif ch == "}":
                    brace -= 1
                    if brace == 0:
                        end_idx = i
                        break

            if end_idx != -1:
                json_part = content_str[: end_idx + 1]
                json_obj = json.loads(json_part)
                narrative = content_str[end_idx + 1 :].lstrip("\n\r ")

    except Exception:
        # Fallback: try to find JSON region
        start = content_str.find("{")
        end = content_str.rfind("}")

        if start != -1 and end != -1 and end > start:
            try:
                json_obj = json.loads(content_str[start : end + 1])
                narrative = content_str[end + 1 :].lstrip("\n\r ")

            except Exception:
                json_obj = {}
                narrative = content_str

        else:
            json_obj = {}
            narrative = content_str

    return json_obj, narrative


__all__ = [
    "ATSEvaluatorGraph",
    "evaluate_ats",
]
