from datetime import datetime, timezone
from typing import Any

from supabase import Client

TABLE = "events"


class EventRepository:
    """The only place that knows events live in the Supabase `events` table."""

    def __init__(self, supabase: Client):
        self._supabase = supabase

    def insert(self, row: dict[str, Any]) -> dict[str, Any]:
        response = self._supabase.table(TABLE).insert(row).execute()
        return response.data[0]

    def list_upcoming(self) -> list[dict[str, Any]]:
        now = datetime.now(timezone.utc).isoformat()
        response = (
            self._supabase.table(TABLE)
            .select("*")
            .gte("starts_at", now)
            .order("starts_at")
            .execute()
        )
        return response.data
