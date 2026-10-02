import asyncio
import logging

from lamp.llm import ask_model
from lamp.schemas import (
    BatchSignals,
    Company,
    CompanySignals,
    GenerateRequest,
    SourcedCompanies,
    SourcedCompany,
)
from lamp.tools import LINKEDIN_SEARCH_TOOL, WEB_SEARCH_TOOL

logger = logging.getLogger(__name__)

LIST_SIZE = 40
BATCH_SIZE = 10
DEFAULT_MOTIVATION = 2
DREAM_MOTIVATION = 3

# The standing rules live in lamp/agent_prompt.md; these only carry the inputs.
SOURCING_PROMPT = """TASK: source companies. Return exactly {size} companies.

Candidate's university: {university}
Target role: {target_role}
Dream companies: {dream_companies}"""

SIGNALS_PROMPT = """TASK: check signals.

Candidate's university: {university}
Target role: {target_role}
Companies: {companies}"""


async def generate_lamp_list(request: GenerateRequest) -> list[Company]:
    sourced = await _source_companies(request)
    batches = [sourced[i : i + BATCH_SIZE] for i in range(0, len(sourced), BATCH_SIZE)]
    batch_results = await asyncio.gather(
        *(_fetch_signals(request, batch) for batch in batches)
    )
    signals = {
        _normalize(s.name): s for batch in batch_results for s in batch.companies
    }
    dream_keys = {_normalize(name) for name in request.dream_companies}

    companies = []
    for index, source in enumerate(sourced, start=1):
        key = _normalize(source.name)
        signal = signals.get(key) or _missing_signal(source)
        companies.append(
            Company(
                id=f"company-{index}",
                name=source.name,
                industry=source.industry,
                has_alumni=signal.has_alumni,
                postings_score=signal.postings_score,
                motivation_score=DREAM_MOTIVATION
                if key in dream_keys
                else DEFAULT_MOTIVATION,
            )
        )
    return companies


async def _source_companies(request: GenerateRequest) -> list[SourcedCompany]:
    prompt = SOURCING_PROMPT.format(
        university=request.university,
        target_role=request.target_role,
        dream_companies=", ".join(request.dream_companies),
        size=LIST_SIZE,
    )
    result = await ask_model(
        "SOURCING (web search)", prompt, WEB_SEARCH_TOOL, SourcedCompanies
    )
    return _with_dream_companies_first(result.companies, request.dream_companies)


def _with_dream_companies_first(
    sourced: list[SourcedCompany], dream_companies: list[str]
) -> list[SourcedCompany]:
    """Deduplicate and guarantee every dream company is in the list, at the top."""
    unique = {_normalize(c.name): c for c in sourced}
    dream = {_normalize(name): name.strip() for name in dream_companies}
    dream_first = [
        unique.pop(key, SourcedCompany(name=name, industry="Unknown"))
        for key, name in dream.items()
    ]
    return (dream_first + list(unique.values()))[:LIST_SIZE]


async def _fetch_signals(
    request: GenerateRequest, companies: list[SourcedCompany]
) -> BatchSignals:
    prompt = SIGNALS_PROMPT.format(
        university=request.university,
        target_role=request.target_role,
        companies=", ".join(c.name for c in companies),
    )
    label = f"LINKEDIN: {', '.join(c.name for c in companies)}"
    return await ask_model(label, prompt, LINKEDIN_SEARCH_TOOL, BatchSignals)


def _missing_signal(source: SourcedCompany) -> CompanySignals:
    logger.warning("Model returned no LinkedIn signals for %s", source.name)
    return CompanySignals(name=source.name, has_alumni=False, postings_score=1)


def _normalize(name: str) -> str:
    return name.strip().lower()
