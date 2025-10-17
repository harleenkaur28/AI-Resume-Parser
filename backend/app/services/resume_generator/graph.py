from __future__ import annotations
from __future__ import annotations

from typing import Optional, List

from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage
from langgraph.graph import StateGraph, START, END, MessagesState
from langchain_core.prompts import ChatPromptTemplate
from langgraph.prebuilt import ToolNode, tools_condition
from langchain_tavily import TavilySearch

import requests
import json
import re

# from app.core.llm import llm
from app.core.llm import MODEL_NAME


def return_markdown(url: str) -> str:
    """Fetch markdown content for a URL using the Jina AI text service.

    This is best-effort and will return an error string on failure.
    """
    if not url:
        return ""
    jina_url = "https://r.jina.ai/" + url
    try:
        res = requests.get(jina_url, timeout=10)
        return res.text
    except Exception as e:
        return f"Error fetching content from {url}: {str(e)}"


class GraphBuilder:
    def __init__(
        self,
        system_prompt_messages: List,
        tools: List,
        model_name: str = MODEL_NAME,
    ) -> None:
        """Create a GraphBuilder that will run the state graph with a chat LLM bound to tools.

        Args:
            system_prompt_messages: list of Message objects returned from prompt.format_messages(...)
            tools: list of tool instances to expose to the model
            model_name: model identifier for ChatGoogleGenerativeAI
        """
        self.llm = ChatGoogleGenerativeAI(model=model_name)
        self.tools = tools or []
        self.llm_with_tools = self.llm.bind_tools(tools=self.tools)
        self.graph = None
        self.system_prompt = system_prompt_messages

    def agent_function(self, state: MessagesState):
        user_question = state["messages"]
        input_question = [*self.system_prompt] + user_question
        response = self.llm_with_tools.invoke(input_question)
        return {"messages": [response]}

    def build_graph(self):
        graph_builder = StateGraph(MessagesState)
        graph_builder.add_node("agent", self.agent_function)
        graph_builder.add_node("tools", ToolNode(tools=self.tools))
        graph_builder.add_edge(START, "agent")
        graph_builder.add_conditional_edges("agent", tools_condition)
        graph_builder.add_edge("tools", "agent")
        graph_builder.add_edge("agent", END)
        self.graph = graph_builder.compile()
        return self.graph

    def __call__(self):
        return self.build_graph()


def run_resume_pipeline(
    resume: str,
    job: str,
    company_name: Optional[str] = None,
    company_website: Optional[str] = None,
    jd: Optional[str] = None,
    max_tool_results: int = 3,
    model_name: str = MODEL_NAME,
) -> str:
    """Run the end-to-end resume tailoring pipeline and return a JSON string result.

    The function centralizes all side-effects and avoids executing work at import time.
    """
    # load environment (if needed for credentials)
    load_dotenv()

    # Fetch company website content if provided
    company_website_content = (
        return_markdown(company_website) if company_website else ""
    )

    # Build prompt template with partial values
    prompt = ChatPromptTemplate.from_template(
        """
        You are a resume expert. The ML model predicted the job of {job} at {company_name}.
        Given the resume below, the company's website content, and the job description, highlight and improve the resume's impact and tailor it for this role.
        Use the given tools to search for relevant details and to align the resume with the company's products, tech stack, and values.

        Company: {company_name}

        Company website content:
        {company_website_content}

        Job description:
        {jd}

        Resume:
        {resume}

        just give the new generated resume without any explanation or additional information.
        """,
    ).partial(
        company_name=company_name or "",
        company_website_content=company_website_content,
        jd=jd or "",
    )

    # Prepare tools
    tavily_search_tool = TavilySearch(max_results=max_tool_results, topic="general")
    tools = [tavily_search_tool]

    # Instantiate graph builder with formatted system prompt messages
    system_prompt_messages = prompt.format_messages(
        resume=resume,
        job=job,
    )
    builder = GraphBuilder(
        system_prompt_messages=system_prompt_messages,
        tools=tools,
        model_name=model_name,
    )
    graph = builder()

    # Instruction asking model to return a strict JSON matching the expected schema
    json_instruction = (
        "Return only a single valid JSON object (no extra text). "
        "The JSON must match the ComprehensiveAnalysisData Pydantic model defined in app/models/schemas.py. "
        "Specifically include the following top-level keys (use these exact names):\n"
        "- skills_analysis: array of objects with keys 'skill_name' (string) and 'percentage' (int)\n"
        "- recommended_roles: array of strings\n"
        "- languages: array of objects with key 'language' (string)\n"
        "- education: array of objects with key 'education_detail' (string)\n"
        "- work_experience: array of objects each with 'role' (string), 'company_and_duration' (string), and 'bullet_points' (array of strings)\n"
        "- projects: array of objects with 'title' (string), 'technologies_used' (array of strings), and 'description' (string)\n"
        "- publications: array of objects matching UIPublicationEntry (title, authors, journal_conference, year, doi, url)\n"
        "- positions_of_responsibility: array of objects matching UIPositionOfResponsibilityEntry (title, organization, duration, description)\n"
        "- certifications: array of objects matching UICertificationEntry (name, issuing_organization, issue_date, expiry_date, credential_id, url)\n"
        "- achievements: array of objects matching UIAchievementEntry (title, description, year, category)\n"
        "- name: string or null\n"
        "- email: string or null\n"
        "- contact: string or null\n"
        "- predicted_field: string or null\n"
        "Only include these keys. If a field is empty, return an empty array or null for optional strings. Ensure all strings are properly quoted and the output is strictly valid JSON."
    )

    response = graph.invoke(
        {
            "messages": [
                HumanMessage(
                    content=json_instruction,
                )
            ]
        }
    )
    text = response["messages"][-1].content.strip()

    # Try to extract JSON substring
    start = text.find("{")
    end = text.rfind("}")
    json_text = text[start : end + 1] if start != -1 and end != -1 else text

    # Attempt to parse; try simple fixes if necessary
    try:
        parsed = json.loads(json_text)
        return json.dumps(
            parsed,
            indent=2,
        )

    except Exception:
        # Try naive fixes: convert single quotes to double quotes and add quotes to keys if missing
        try:
            fixed = json_text.replace("'", '"')
            # add quotes around unquoted keys (basic)
            fixed = re.sub(
                r"(?<=[\\{\\s,])([A-Za-z0-9_+-]+)\\s*:\\s", r'"\\1": ', fixed
            )
            parsed = json.loads(fixed)
            return json.dumps(
                parsed,
                indent=2,
            )

        except Exception:
            return json.dumps(
                {
                    "error": "failed to parse model output as JSON",
                    "raw": text,
                },
                indent=2,
            )


__all__ = [
    "run_resume_pipeline",
]
