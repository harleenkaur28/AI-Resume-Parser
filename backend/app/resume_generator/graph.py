from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage
from langgraph.graph import StateGraph, START, END, MessagesState
from langchain_core.prompts import ChatPromptTemplate
from langgraph.prebuilt import ToolNode, tools_condition
from langchain_tavily import TavilySearch
from dotenv import load_dotenv

load_dotenv()

resume = """
John Doe
Experienced software developer with expertise in Python and JavaScript.
"""

job = "Software Engineer"

prompt = ChatPromptTemplate.from_template(
    """
    You are a resume expert. The ML model predicted the job of {job}.
    Given the resume below, quantify, highlight and improve its impact and tailor accordingly.
    Use the given tools to search for relevant details.

    Resume:
    {resume}
    """
)

tavily_search_tool = TavilySearch(
    max_results=3,
    topic="general",
)

class GraphBuilder():
    def __init__(self, resume_text, job_role):
        self.llm = ChatGoogleGenerativeAI(model="gemini-2.0-flash")
        self.tools = [tavily_search_tool]
        self.llm_with_tools = self.llm.bind_tools(tools=self.tools)
        self.graph = None
        self.system_prompt = prompt.format_messages(resume=resume_text, job=job_role)

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

def return_resume(resume, job):
    obj = GraphBuilder(resume_text=resume, job_role=job)
    graph = obj()

    response = graph.invoke({"messages": [HumanMessage(content="Please enhance this resume.")]})
    return response["messages"][-1].content
