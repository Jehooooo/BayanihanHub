"""
Centralized Rate Limiter configuration for BayanihanHub using slowapi.
Provides keying by client IP address to prevent brute-force and DDoS attacks.
"""
from slowapi import Limiter
from slowapi.util import get_remote_address

# Initialize rate limiter with IP-based keying
limiter = Limiter(key_func=get_remote_address, default_limits=["120/minute"])
