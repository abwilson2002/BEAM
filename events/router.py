import logging
from typing import Annotated

from fastapi import APIRouter, HTTPException, Query
from postgrest.exceptions import APIError
from supabase import Client

from events.repository import EventRepository
from events.schemas import (
    ZIP_PATTERN,
    CareerEvent,
    CreateEventRequest,
    NearbyEvent,
)
from shared.geo import (
    GeocodingUnavailableError,
    ZipNotFoundError,
    distance_miles,
    geocode_zip,
)

logger = logging.getLogger(__name__)


def create_events_router(supabase: Client) -> APIRouter:
    repository = EventRepository(supabase)
    router = APIRouter(prefix="/api/events", tags=["events"])

    @router.post("", response_model=CareerEvent, status_code=201)
    def create_event(request: CreateEventRequest):
        lat, lng = _geocode_or_http_error(request.zip)
        row = {
            "title": request.title,
            "event_type": request.event_type,
            "organizer": request.organizer,
            "description": request.description,
            "starts_at": request.starts_at.isoformat(),
            "venue": request.venue,
            "zip": request.zip,
            "lat": lat,
            "lng": lng,
        }
        try:
            return CareerEvent.model_validate(repository.insert(row))
        except APIError as error:
            raise _database_error(error) from error

    @router.get("", response_model=list[CareerEvent])
    def list_events():
        return _load_upcoming_events(repository)

    @router.get("/nearby", response_model=list[NearbyEvent])
    def list_nearby_events(zip: Annotated[str, Query(pattern=ZIP_PATTERN)]):
        """Upcoming events, closest to the given ZIP code first."""
        lat, lng = _geocode_or_http_error(zip)
        nearby = [
            NearbyEvent(
                **event.model_dump(),
                distance_miles=round(distance_miles(lat, lng, event.lat, event.lng), 1),
            )
            for event in _load_upcoming_events(repository)
        ]
        return sorted(nearby, key=lambda event: event.distance_miles)

    return router


def _load_upcoming_events(repository: EventRepository) -> list[CareerEvent]:
    try:
        return [CareerEvent.model_validate(row) for row in repository.list_upcoming()]
    except APIError as error:
        raise _database_error(error) from error


def _geocode_or_http_error(zip_code: str) -> tuple[float, float]:
    try:
        return geocode_zip(zip_code)
    except ZipNotFoundError as error:
        raise HTTPException(status_code=422, detail=str(error)) from error
    except GeocodingUnavailableError as error:
        logger.exception("ZIP lookup failed")
        raise HTTPException(status_code=502, detail=str(error)) from error


def _database_error(error: APIError) -> HTTPException:
    logger.exception("Supabase request failed")
    return HTTPException(
        status_code=502,
        detail=f"Database error: {error.message} (does the `events` table exist? see supabase/events.sql)",
    )
