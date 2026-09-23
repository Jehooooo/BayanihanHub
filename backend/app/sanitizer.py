import re
from typing import Optional, Any


# Regular expressions for identifying dangerous HTML elements and script injection vectors
SCRIPT_TAG_REGEX = re.compile(r"<\s*script[^>]*>.*?<\s*/\s*script\s*>", re.IGNORECASE | re.DOTALL)
DANGEROUS_TAGS_REGEX = re.compile(r"<\s*(iframe|object|embed|applet|meta|link|style)[^>]*>.*?<\s*/\s*\1\s*>", re.IGNORECASE | re.DOTALL)
UNCLOSED_DANGEROUS_TAGS_REGEX = re.compile(r"<\s*(script|iframe|object|embed|applet|meta|link|style)[^>]*>", re.IGNORECASE)
EVENT_HANDLER_REGEX = re.compile(r"\s+on\w+\s*=\s*(?:'[^']*'|\"[^\"]*\"|[^\s>]+)", re.IGNORECASE)
JAVASCRIPT_URL_REGEX = re.compile(r"(javascript|vbscript|data\s*:\s*text\/html)\s*:", re.IGNORECASE)


def sanitize_text(value: Optional[str]) -> Optional[str]:
    """
    Sanitize user-provided text to neutralize XSS payloads.
    Strips script blocks, iframes, inline event handlers, and javascript pseudoprotocols.
    """
    if value is None:
        return None
    if not isinstance(value, str):
        return value

    cleaned = value
    # 1. Strip full script and dangerous blocks
    cleaned = SCRIPT_TAG_REGEX.sub("", cleaned)
    cleaned = DANGEROUS_TAGS_REGEX.sub("", cleaned)
    cleaned = UNCLOSED_DANGEROUS_TAGS_REGEX.sub("", cleaned)

    # 2. Strip event handlers (e.g., onerror=, onload=, onclick=)
    cleaned = EVENT_HANDLER_REGEX.sub("", cleaned)

    # 3. Strip javascript: URLs
    cleaned = JAVASCRIPT_URL_REGEX.sub("", cleaned)

    return cleaned.strip()


def sanitize_dict_fields(data: dict, fields: list[str]) -> dict:
    """Sanitize specific string fields in a dictionary."""
    for field in fields:
        if field in data and isinstance(data[field], str):
            data[field] = sanitize_text(data[field])
    return data
