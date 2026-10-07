"""
Bayanihan Hub — Real Gemini-powered Community AI Assistant.

Uses the official Google Gen AI SDK (google-genai) with multi-turn conversation
history, real-time MySQL live database statistics grounded in the system instruction,
and automatic model fallback (gemini-2.5-flash -> gemini-2.0-flash -> gemini-1.5-flash).
"""

from typing import Optional, List, Dict, Any
import app.config as config
from app.services.terminal_logger import terminal_logger

_client = None


def is_ai_enabled() -> bool:
    """Check if a Gemini API key is configured."""
    return bool(config.GEMINI_API_KEY and config.GEMINI_API_KEY.strip())


def _get_client():
    """Lazily instantiate the Google Gen AI client."""
    global _client
    if _client is None:
        from google import genai

        _client = genai.Client(api_key=config.GEMINI_API_KEY.strip())
    return _client


def build_system_instruction(stats: dict, user_name: Optional[str] = None) -> str:
    """
    Construct the grounding prompt with live MySQL community metrics and guidelines.
    """
    greeting_target = f"The user is identified as {user_name}." if user_name else "The user may be an anonymous neighbor or guest."
    return f"""You are the Bayanihan Hub Community AI Assistant, a warm, helpful, and knowledgeable AI guide for Bayanihan Hub —
a Philippine community mutual-aid and cashless barter platform where verified neighbors donate goods, exchange/barter items,
and post essential assistance requests. {greeting_target}

## Scope & Core Guidelines
- Only answer queries related to Bayanihan Hub: item donations, cashless barter/exchanges, community help requests, identity verification,
  safety measures, navigating the platform, and community statistics.
- Politely decline non-community queries (e.g. coding assignments, homework, general trivia, cryptocurrency, external trading) and redirect back to what you can help with.
- Never invent fictitious listings, users, or statistics. Strictly use the real-time MySQL database statistics provided below. If you don't have certain specific listing details, invite the user to search in the "Browse Items" section.
- Never ask for or expose passwords, OTPs, full government ID numbers, or private financial details.
- Cash sales are strictly prohibited on the platform. All listings are either 100% free Donations or cashless Barter Exchanges.

## Platform Capabilities & Workflows
1. **Posting an Item**: Click **Post Item** in the navigation bar. Choose **Donation** (free surplus for neighbors) or **Exchange** (cashless barter — state what you want in trade). Upload photos, set condition, category, and select the Barangay location (or use GPS).
2. **Exchanges (Barter)**: Browse the **Exchanges** tab. Click **Propose Exchange** on an item. Select one of your own posted items to trade + write a friendly message. When the owner accepts, coordinate handover at a safe public spot (e.g. Barangay Hall, public plaza). Once exchanged, mark as complete and leave a rating/review.
3. **Donations**: Browse the **Donations** tab. Click **Request Donation** to message the donor and arrange pickup/meetup.
4. **Community Requests**: Neighbors facing urgent shortages, disaster calamity, or school needs can post under **Requests**. Specify urgency (Critical, High, Medium, Low). Neighbors can click **Offer Help / Fulfill**.
5. **Identity Verification**: To prevent fraud, all accounts must submit verification to become active. Accepted Philippine IDs include: PhilSys National ID, LTO Driver's License, Philippine Passport, UMID, Postal ID, PRC License, Senior Citizen ID, PWD ID, Voter's ID, SSS, GSIS, TIN, PhilHealth, Pag-IBIG, and Student/School ID. Users submit their ID photo + live selfie. An admin reviews the submission, and the user receives an email update upon approval or rejection.
6. **Safety Guidelines**: Always meet during daytime in public locations (Barangay Halls, malls, public plazas). Inspect items before confirming trades. Report suspicious accounts or illicit listings using **Report**.

## Real-Time Bayanihan Hub MySQL Database Metrics (Live Right Now):
- Active Posted Listings: {stats.get('totalItems', 0)} ({stats.get('totalDonations', 0)} free donations, {stats.get('totalExchangesPosted', 0)} barter offers)
- Completed Barter Exchanges: {stats.get('completedExchanges', 0)}
- Active Exchanges in Coordination: {stats.get('activeExchanges', 0)}
- Community Help Requests: {stats.get('totalRequests', 0)} ({stats.get('fulfilledRequests', 0)} successfully fulfilled)
- Verified Community Neighbors: {stats.get('verifiedNeighbors', 0)}
- Represented Barangays: {stats.get('activeBarangays', 0)}
- Moderation Reports Handled: {stats.get('totalReports', 0)}

## Communication Tone
- Warm, polite, encouraging, and community-minded (Bayanihan spirit).
- Feel free to use friendly Filipino/Taglish greetings (e.g. "Kumusta!", "Mabuhay!", "Salamat!") when appropriate.
- Be concise (usually 2-4 short paragraphs or bullet points). Use **bold** for key UI actions.
"""


def generate_ai_reply(
    message: str,
    stats: dict,
    history: Optional[List[Dict[str, Any]]] = None,
    user_name: Optional[str] = None,
) -> dict:
    """
    Send chat turn with multi-turn conversation history to Google Gemini.
    Returns: {"reply": str, "model": str, "isRealAi": True}
    """
    if not is_ai_enabled():
        raise ValueError("GEMINI_API_KEY is not configured in backend environment.")

    from google.genai import types

    client = _get_client()

    # Build multi-turn contents list
    contents = []
    if history:
        for turn in history[-8:]:  # Keep last 8 turns for context window efficiency
            sender = turn.get("sender") or turn.get("role")
            text = (turn.get("text") or turn.get("content") or "").strip()
            if not text:
                continue
            role = "user" if sender == "user" else "model"
            contents.append(
                types.Content(
                    role=role,
                    parts=[types.Part.from_text(text=text)],
                )
            )

    # Append current user prompt
    contents.append(
        types.Content(
            role="user",
            parts=[types.Part.from_text(text=message.strip())],
        )
    )

    system_instruction = build_system_instruction(stats, user_name)

    candidate_models = [
        config.GEMINI_MODEL,
        "gemini-3.5-flash-lite",
        "gemini-flash-lite-latest",
        "gemini-flash-latest",
        "gemini-3.8-flash",
    ]

    # Deduplicate while preserving order
    models_to_try = []
    for m in candidate_models:
        if m and m not in models_to_try:
            models_to_try.append(m)

    last_error = None
    for model_name in models_to_try:
        try:
            # Build fast generation config: minimal thinking level for 3.x models to avoid long reasoning delays
            cfg_kwargs: Dict[str, Any] = {
                "system_instruction": system_instruction,
                "temperature": 0.7,
                "max_output_tokens": 600,
            }
            if "3." in model_name:
                cfg_kwargs["thinking_config"] = types.ThinkingConfig(thinking_level="minimal")

            generation_config = types.GenerateContentConfig(**cfg_kwargs)

            response = client.models.generate_content(
                model=model_name,
                contents=contents,
                config=generation_config,
            )
            reply = (response.text or "").strip()
            if reply:
                terminal_logger.integration(
                    "Backend",
                    "Gemini AI",
                    f"Generated reply with model '{model_name}' ({len(reply)} chars)",
                    status="SUCCESS",
                )
                return {
                    "reply": reply,
                    "model": model_name,
                    "isRealAi": True,
                }
        except Exception as exc:
            # If thinking_config failed, retry once without thinking_config for this model
            if "thinking" in str(exc).lower() or "invalid_argument" in str(exc).lower():
                try:
                    fallback_cfg = types.GenerateContentConfig(
                        system_instruction=system_instruction,
                        temperature=0.7,
                        max_output_tokens=600,
                    )
                    response = client.models.generate_content(
                        model=model_name,
                        contents=contents,
                        config=fallback_cfg,
                    )
                    reply = (response.text or "").strip()
                    if reply:
                        return {
                            "reply": reply,
                            "model": model_name,
                            "isRealAi": True,
                        }
                except Exception as inner_exc:
                    exc = inner_exc

            last_error = exc
            terminal_logger.integration(
                "Backend",
                "Gemini AI",
                f"Model '{model_name}' failed: {exc}. Trying next candidate...",
                status="WARNING",
            )

    raise RuntimeError(f"All Gemini models failed. Last error: {last_error}")

