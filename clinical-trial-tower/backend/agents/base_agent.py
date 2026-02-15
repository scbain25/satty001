"""
Base Agent class for the Clinical Trial Control Tower.
All specialist agents inherit from this base.
Implements the 6-tier task taxonomy: Descriptive, Predictive, Simulative, Optimization, Generative, Agentic.
"""

from abc import ABC, abstractmethod
from datetime import datetime
from typing import Dict, List, Any, Optional
import hashlib
import random

from ..models import (
    Study, AgentAction, AgentResponse, AgentType, TaskType, Severity
)


class BaseAgent(ABC):
    """
    Abstract base class for all Control Tower agents.

    Each agent can perform 6 types of tasks:
    - Descriptive: Summarize what has happened (KPIs, status reports)
    - Predictive: Forecast what will happen (risk scores, timeline predictions)
    - Simulative: Explore what could happen (Monte Carlo, scenario analysis)
    - Optimization: Determine what should be done (resource allocation, scheduling)
    - Generative: Create artifacts (documents, reports, materials)
    - Agentic: Take autonomous actions (trigger workflows, escalate, coordinate)
    """

    def __init__(self, agent_type: AgentType, name: str, description: str):
        self.agent_type = agent_type
        self.name = name
        self.description = description
        self.rng = random.Random(42)
        self._action_counter = 0

    def _uid(self, prefix: str = "ACT") -> str:
        self._action_counter += 1
        raw = f"{prefix}-{self.agent_type}-{self._action_counter}-{datetime.now().isoformat()}"
        return f"{prefix}-{hashlib.md5(raw.encode()).hexdigest()[:8].upper()}"

    def _create_action(
        self,
        task_type: TaskType,
        title: str,
        description: str,
        severity: Severity = Severity.INFO,
        data: Dict[str, Any] = None,
        human_required: bool = False,
        confidence: float = 0.85,
    ) -> AgentAction:
        return AgentAction(
            id=self._uid(),
            timestamp=datetime.now(),
            agent_type=self.agent_type,
            agent_name=self.name,
            task_type=task_type,
            title=title,
            description=description,
            severity=severity,
            data=data or {},
            human_action_required=human_required,
            confidence=confidence,
        )

    @abstractmethod
    def describe(self, study: Study) -> AgentResponse:
        """Descriptive analytics: What happened?"""
        pass

    @abstractmethod
    def predict(self, study: Study) -> AgentResponse:
        """Predictive analytics: What will happen?"""
        pass

    @abstractmethod
    def simulate(self, study: Study, parameters: Dict[str, Any] = None) -> AgentResponse:
        """Simulation: What could happen under different scenarios?"""
        pass

    @abstractmethod
    def optimize(self, study: Study) -> AgentResponse:
        """Optimization: What should we do?"""
        pass

    @abstractmethod
    def generate(self, study: Study, request: str = "") -> AgentResponse:
        """Generative: Create documents, reports, materials."""
        pass

    @abstractmethod
    def act(self, study: Study, trigger: str = "") -> AgentResponse:
        """Agentic: Take autonomous actions."""
        pass

    def process_query(self, study: Study, query: str) -> AgentResponse:
        """
        Process a natural language query and route to the appropriate task type.
        Uses keyword matching for the prototype; would use NLU in production.
        """
        q = query.lower()

        if any(w in q for w in ["status", "summary", "report", "what happened", "dashboard", "kpi"]):
            return self.describe(study)
        elif any(w in q for w in ["predict", "forecast", "expect", "will", "probability", "likely"]):
            return self.predict(study)
        elif any(w in q for w in ["simulate", "scenario", "what if", "monte carlo", "model"]):
            return self.simulate(study)
        elif any(w in q for w in ["optimize", "best", "recommend", "should", "allocate", "improve"]):
            return self.optimize(study)
        elif any(w in q for w in ["generate", "create", "draft", "write", "produce", "build"]):
            return self.generate(study, query)
        elif any(w in q for w in ["act", "execute", "trigger", "do", "automate", "initiate"]):
            return self.act(study, query)
        else:
            # Default to descriptive
            return self.describe(study)

    def _make_response(
        self,
        response_text: str,
        actions: List[AgentAction] = None,
        recommendations: List[str] = None,
        data: Dict[str, Any] = None,
        confidence: float = 0.85,
    ) -> AgentResponse:
        return AgentResponse(
            agent_type=self.agent_type,
            agent_name=self.name,
            response=response_text,
            actions_taken=actions or [],
            recommendations=recommendations or [],
            data=data or {},
            confidence=confidence,
        )
