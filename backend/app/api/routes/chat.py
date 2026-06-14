from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, List
from app.agents.multi_agent import run_multi_agent

router = APIRouter()


class ChatMessage(BaseModel):
    role: str  # "user" | "assistant"
    content: str


class ChatRequest(BaseModel):
    message: str
    plant_id: Optional[str] = "ALL"
    history: Optional[List[ChatMessage]] = []


class ChatResponse(BaseModel):
    agent: str
    response: str
    confidence: float
    reasoning: str
    impact: str
    routing_scores: dict


SUGGESTED_QUERIES = [
    "Why is Plant A at risk of downtime?",
    "What are the top safety hazards this week?",
    "How can we reduce energy consumption by 15%?",
    "Which units need maintenance in the next 48 hours?",
    "Generate an executive summary for the board meeting",
    "What is causing the production shortfall in Plant B?",
    "Identify the highest CO₂ emitting units",
    "What is our current safety score and how to improve it?",
]


@router.post("/message", response_model=ChatResponse)
async def send_chat_message(request: ChatRequest):
    """Process a chat message through the multi-agent system."""
    # Build context-aware query
    query = request.message
    if request.plant_id and request.plant_id != "ALL":
        if request.plant_id.lower() not in query.lower():
            query = f"{query} [Context: {request.plant_id}]"

    result = run_multi_agent(query=query, plant_id=request.plant_id)

    return ChatResponse(
        agent=result["agent"],
        response=result["response"],
        confidence=result["confidence"],
        reasoning=result["reasoning"],
        impact=result["impact"],
        routing_scores=result["routing_scores"],
    )


@router.get("/suggestions")
async def get_suggested_queries():
    """Return suggested queries for the chat interface."""
    return {"suggestions": SUGGESTED_QUERIES}


@router.get("/agents")
async def get_agent_descriptions():
    """Return information about available agents."""
    return {
        "agents": [
            {
                "id": "SUPERVISOR",
                "name": "Supervisor Agent",
                "description": "Orchestrates all sub-agents and routes queries intelligently",
                "color": "#6366f1",
            },
            {
                "id": "MAINTENANCE",
                "name": "Maintenance Agent",
                "description": "Predictive failure analysis and maintenance scheduling",
                "color": "#f59e0b",
            },
            {
                "id": "SAFETY",
                "name": "Safety Agent",
                "description": "Incident monitoring, risk scoring, and preventive actions",
                "color": "#ef4444",
            },
            {
                "id": "ENERGY",
                "name": "Energy Agent",
                "description": "Consumption analysis and optimisation recommendations",
                "color": "#10b981",
            },
            {
                "id": "PRODUCTION",
                "name": "Production Agent",
                "description": "Scheduling optimisation and KPI attainment analysis",
                "color": "#3b82f6",
            },
            {
                "id": "REPORTING",
                "name": "Reporting Agent",
                "description": "Executive summaries and comprehensive reports",
                "color": "#8b5cf6",
            },
        ]
    }
