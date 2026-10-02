from typing import Literal

from pydantic import BaseModel, Field

from shared.camel import CamelModel

Score = Literal[1, 2, 3]


class GenerateRequest(CamelModel):
    university: str = Field(min_length=1)
    target_role: str = Field(min_length=1)
    dream_companies: list[str] = Field(min_length=1, max_length=3)


class Company(CamelModel):
    id: str
    name: str
    industry: str
    has_alumni: bool
    postings_score: Score
    motivation_score: Score


# Shapes the model must answer with (kept free of Field constraints so they
# stay valid for OpenAI strict structured outputs).


class SourcedCompany(BaseModel):
    name: str
    industry: str


class SourcedCompanies(BaseModel):
    companies: list[SourcedCompany]


class CompanySignals(BaseModel):
    name: str
    has_alumni: bool
    postings_score: Score


class BatchSignals(BaseModel):
    companies: list[CompanySignals]
