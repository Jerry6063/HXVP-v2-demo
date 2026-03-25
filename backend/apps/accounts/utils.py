import logging
import os

import requests as http_requests
from django.core import signing

logger = logging.getLogger(__name__)

# hCaptcha test secret (0x0000…) always passes in dev/test.
# Set HCAPTCHA_SECRET_KEY env var on Render for production.
HCAPTCHA_SECRET = os.environ.get(
    "HCAPTCHA_SECRET_KEY",
    "0x0000000000000000000000000000000000000000",
)


def verify_hcaptcha(token: str) -> bool:
    """Verify an hCaptcha response token against the hCaptcha API."""
    if not token:
        return False
    try:
        resp = http_requests.post(
            "https://hcaptcha.com/siteverify",
            data={"secret": HCAPTCHA_SECRET, "response": token},
            timeout=5,
        )
        return resp.json().get("success", False)
    except Exception as exc:
        logger.warning("hCaptcha verification error: %s", exc)
        return False


def make_reset_token(user_id: int, portal: str) -> str:
    """Create a URL-safe signed token containing user_id and portal."""
    return signing.dumps({"uid": user_id, "portal": portal}, salt="password-reset")


def read_reset_token(token: str, max_age: int = 3600):
    """
    Decode a reset token produced by make_reset_token.
    Returns (user_id, portal) on success, or (None, None) if invalid/expired.
    max_age is in seconds (default 1 hour).
    """
    try:
        data = signing.loads(token, salt="password-reset", max_age=max_age)
        return data["uid"], data["portal"]
    except Exception:
        return None, None
