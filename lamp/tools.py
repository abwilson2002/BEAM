"""Web-search tools the model can call (OpenAI Responses API built-in tool)."""

from typing import Any

# General research, used to source and verify the list of companies.
WEB_SEARCH_TOOL: dict[str, Any] = {"type": "web_search"}

# Restricted to LinkedIn, used to find alumni and open job postings.
LINKEDIN_SEARCH_TOOL: dict[str, Any] = {
    "type": "web_search",
    "filters": {"allowed_domains": ["linkedin.com"]},
}
