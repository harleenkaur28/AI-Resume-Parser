from __future__ import annotations

import json
import re
from dataclasses import dataclass
from dotenv import load_dotenv
from fastapi import HTTPException
from langchain_core.messages import HumanMessage
from langchain_google_genai import ChatGoogleGenerativeAI
from langgraph.graph import MessagesState, START, END, StateGraph
from langgraph.prebuilt import ToolNode, tools_condition

from app.agents.web_content_agent import return_markdown
from app.data.ai.jd_evaluator import jd_evaluator_prompt_template as ATS_PROMPT
from app.core.llm import MODEL_NAME

try:
    from app.core.llm import llm as default_llm

except Exception:
    default_llm = None


load_dotenv()


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
) -> dict:
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
                    content=("Return JSON first (no preamble)."),
                )
            ]
        }
    )
    content = resp.get("messages", [])[-1].content if resp else ""
    if not isinstance(content, str):
        content = str(content)

    code_fence_pattern = re.compile(r"^```(json)?\n", re.IGNORECASE)

    content_str = content.strip()
    content_str = code_fence_pattern.sub("", content_str)

    if content_str.endswith("```"):
        content_str = content_str[: content_str.rfind("```")]

    content_str = content_str.strip()

    if content_str.startswith("{"):
        try:
            json_obj = json.loads(content_str)

        except json.JSONDecodeError:
            end_pos = content_str.rfind("}")
            try:
                if end_pos == -1:
                    raise json.JSONDecodeError(
                        "Closing brace not found",
                        content_str,
                        0,
                    )
                json_obj = json.loads(content_str[: end_pos + 1])

            except json.JSONDecodeError:
                json_obj = {}
                raise HTTPException(
                    status_code=500,
                    detail="Failed to parse ATS evaluation JSON output.",
                )
    else:
        start = content_str.find("{")
        end_pos = content_str.rfind("}")

        if start == -1 or end_pos == -1 or end_pos < start:
            raise HTTPException(
                status_code=500,
                detail="Failed to parse ATS evaluation JSON output.",
            )

        end = end_pos + 1
        try:
            json_slice = content_str[start:end] if end > start else content_str[start:]
            json_obj = json.loads(json_slice)

        except json.JSONDecodeError:
            json_obj = {}
            raise HTTPException(
                status_code=500,
                detail="Failed to parse ATS evaluation JSON output.",
            )

    return json_obj


__all__ = [
    "ATSEvaluatorGraph",
    "evaluate_ats",
]
