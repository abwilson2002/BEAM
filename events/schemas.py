from datetime import datetime, timezone
from typing import Literal

from pydantic import Field, field_validator

from shared.camel import CamelModel

EventType = Literal[
    "hackathon", "info_session", "career_fair", "workshop", "networking", "other"
]

ZIP_PATTERN = r"^\d{5}$"


class CreateEventRequest(CamelModel):
    title: str = Field(min_length=1, max_length=120)
    event_type: EventType
    organizer: str = Field(min_length=1, max_length=120)
    description: str = Field(default="", max_length=2000)
    starts_at: datetime
    venue: str = Field(min_length=1, max_length=160)
    zip: str = Field(pattern=ZIP_PATTERN)

    @field_validator("starts_at")
    @classmethod
    def must_be_future(cls, value: datetime) -> datetime:
        if value.tzinfo is None:
            raise ValueError("starts_at must include a timezone")
        if value <= datetime.now(timezone.utc):
            raise ValueError("The event must start in the future")
        return value


class CareerEvent(CamelModel):
    id: str
    title: str
    event_type: EventType
    organizer: str
    description: str
    starts_at: datetime
    venue: str
    zip: str
    lat: float
    lng: float


class NearbyEvent(CareerEvent):
    distance_miles: float
