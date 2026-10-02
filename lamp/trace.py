"""Human-readable trace of what the model did during one call, printed to the backend terminal."""

import sys
from typing import Any

# The Windows console defaults to cp1252, which garbles characters like apostrophes.
sys.stdout.reconfigure(encoding="utf-8")


def format_trace(label: str, response: Any, elapsed_seconds: float) -> str:
    lines = [f"\n=== {label} | {elapsed_seconds:.1f}s | model={response.model} ==="]
    for item in response.output:
        if item.type == "reasoning":
            for part in item.summary:
                lines.append(f"REASONING: {part.text}")
        elif item.type == "web_search_call":
            lines.append(f"TOOL web_search: {_describe_search(item.action)}")
        elif item.type == "function_call":
            lines.append(f"TOOL {item.name}: {item.arguments}")

    cited = _cited_urls(response)
    if cited:
        lines.append("SOURCES CITED:")
        lines.extend(f"  - {url}" for url in cited)

    lines.append(f"ANSWER: {response.output_text}")
    lines.append(f"USAGE: {_describe_usage(response.usage)}")
    return "\n".join(lines)


def _describe_search(action: Any) -> str:
    if action is None:
        return "(no details)"
    kind = getattr(action, "type", "search")
    detail = (
        getattr(action, "query", None)
        or getattr(action, "url", None)
        or getattr(action, "pattern", None)
        or ""
    )
    sources = [s.url for s in getattr(action, "sources", None) or []]
    text = f"[{kind}] {detail}".strip()
    if sources:
        text += "\n" + "\n".join(f"    -> {url}" for url in sources)
    return text


def _cited_urls(response: Any) -> list[str]:
    urls: dict[str, None] = {}
    for item in response.output:
        if item.type != "message":
            continue
        for part in item.content:
            for annotation in getattr(part, "annotations", None) or []:
                if annotation.type == "url_citation":
                    urls[annotation.url] = None
    return list(urls)


def _describe_usage(usage: Any) -> str:
    if usage is None:
        return "n/a"
    reasoning_tokens = getattr(usage.output_tokens_details, "reasoning_tokens", 0)
    return (
        f"input={usage.input_tokens} output={usage.output_tokens} "
        f"(reasoning={reasoning_tokens})"
    )
