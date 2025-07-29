from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage, SystemMessage
from langgraph.graph import StateGraph, START, END, MessagesState
from langgraph.prebuilt import ToolNode, tools_condition
from langchain_tavily import TavilySearch
from dotenv import load_dotenv

load_dotenv()

system_message=SystemMessage(
        content=   "You are a hiring manager. Given the resume of a candidate, refine it to remove buzzwords, highlight skills and impact."
    )

tavily_search_tool = TavilySearch(
    max_results=3,
    topic="general",
)

class GraphBuilder():
    def __init__(self):
        self.llm = ChatGoogleGenerativeAI(model="gemini-2.0-flash")
        
        self.tools = [tavily_search_tool]
        
        self.llm_with_tools = self.llm.bind_tools(tools=self.tools)
        
        self.graph = None

        self.system_prompt= system_message

    def  agent_function(self, state:MessagesState):
        """Agent Function"""
        user_question= state["messages"]
        input_question= [self.system_prompt] + user_question
        response= self.llm_with_tools.invoke(input_question)
        return {"messages":[response]}

    def build_graph(self):
        graph_builder= StateGraph(MessagesState)
        graph_builder.add_node("agent", self.agent_function)
        graph_builder.add_node("tools", ToolNode(tools=self.tools))
        graph_builder.add_edge(START,"agent")
        graph_builder.add_conditional_edges("agent",tools_condition)
        graph_builder.add_edge("tools","agent")
        graph_builder.add_edge("agent",END)
        self.graph = graph_builder.compile()
        return self.graph

    def __call__(self):
        return self.build_graph() 