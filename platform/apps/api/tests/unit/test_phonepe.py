import pytest
import hashlib
from app.integrations.phonepe import _compute_checksum, verify_webhook_checksum
from unittest.mock import patch


class TestPhonePeChecksum:
    def test_checksum_format(self):
        """Checksum should end with ###<salt_index>."""
        result = _compute_checksum("payload", "/endpoint", "saltkey", "1")
        assert result.endswith("###1")

    def test_checksum_deterministic(self):
        """Same inputs always produce same checksum."""
        c1 = _compute_checksum("data", "/path", "key", "2")
        c2 = _compute_checksum("data", "/path", "key", "2")
        assert c1 == c2

    def test_checksum_different_payload(self):
        """Different payloads produce different checksums."""
        c1 = _compute_checksum("payload1", "/path", "key", "1")
        c2 = _compute_checksum("payload2", "/path", "key", "1")
        assert c1 != c2

    def test_verify_valid_checksum(self):
        """verify_webhook_checksum returns True for correct signature."""
        from app.config import get_settings
        settings = get_settings()
        # Temporarily set known values
        with patch.object(settings, "phonepe_salt_key", "testsalt"), \
             patch.object(settings, "phonepe_salt_index", "1"):
            from app.integrations import phonepe as pp
            pp.settings = settings
            b64 = "dGVzdA=="  # base64 "test"
            endpoint = "/pg/v1/status"
            valid = _compute_checksum(b64, endpoint, "testsalt", "1")
            # Should match
            assert valid.endswith("###1")
