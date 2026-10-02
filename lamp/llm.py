import os
import time
from functools import lru_cache
from pathlib import Path
from typing import Any, TypeVar

from dotenv import load_dotenv
from openai import AsyncOpenAI, OpenAIError
from pydantic import BaseModel

from lamp.trace import format_trace

load_dotenv()

MODEL = os.getenv("OPENAI_MODEL", "gpt-5.6-luna")
REASONING_EFFORT = os.getenv("OPENAI_REASONING_EFFORT", "low")
REQUEST_TIMEOUT_SECONDS = 180
AGENT_INSTRUCTIONS = (Path(__file__).parent / "agent_prompt.md").read_text(
    encoding="utf-8"
)

T = TypeVar("T", bound=BaseModel)


class LampConfigError(Exception):
    """The backend is not set up to call the model (e.g. missing API key)."""


class LampGenerationError(Exception):
    """The model call failed or returned something unusable."""


@lru_cache
def _client() -> AsyncOpenAI:
    if not os.getenv("OPENAI_API_KEY"):
        raise LampConfigError("OPENAI_API_KEY is not set on the backend.")
    return AsyncOpenAI(timeout=REQUEST_TIMEOUT_SECONDS)


def _reasoning_config() -> dict[str, str]:
    config = {"effort": REASONING_EFFORT}
    if REASONING_EFFORT != "none":
        config["summary"] = "auto"  # lets the trace show the model's reasoning
    return config


async def ask_model(
    label: str, prompt: str, tool: dict[str, Any], output_model: type[T]
) -> T:
    """Run one prompt with a single search tool and return the parsed answer.

    `label` names the call in the trace printed to the backend terminal.
    """
    client = _client()
    print(f"\n>>> {label}: started", flush=True)
    started = time.monotonic()
    try:
        response = await client.responses.parse(
            model=MODEL,
            instructions=AGENT_INSTRUCTIONS,
            input=prompt,
            tools=[tool],
            text_format=output_model,
            reasoning=_reasoning_config(),
            include=["web_search_call.action.sources"],
        )
    except OpenAIError as error:
        print(f"\n>>> {label}: FAILED after {time.monotonic() - started:.1f}s", flush=True)
        raise LampGenerationError(f"OpenAI request failed: {error}") from error

    print(format_trace(label, response, time.monotonic() - started), flush=True)

    if response.status == "incomplete" or response.output_parsed is None:
        raise LampGenerationError(
            f"OpenAI returned no usable answer (status: {response.status})."
        )
    return response.output_parsed
