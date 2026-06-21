from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator, model_validator
from functools import lru_cache
from typing import Any


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # App
    app_name: str = "Temptations Cafe API"
    app_version: str = "1.0.0"
    debug: bool = False
    secret_key: str = "change-me-in-production"
    cors_origins: list[str] = ["http://localhost:3000", "http://localhost:3001"]
    environment: str = "development"  # development | staging | production

    # Database
    database_url: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/temptations"

    # Redis
    redis_url: str = "redis://localhost:6379/0"

    # Firebase
    firebase_project_id: str = ""
    firebase_private_key: str = ""
    firebase_client_email: str = ""

    # PhonePe
    phonepe_merchant_id: str = ""
    phonepe_salt_key: str = ""
    phonepe_salt_index: str = "1"
    phonepe_env: str = "UAT"  # UAT | PRODUCTION
    phonepe_base_url: str = "https://api-preprod.phonepe.com/apis/pg-sandbox"

    # WhatsApp Business API
    whatsapp_api_url: str = "https://graph.facebook.com/v19.0"
    whatsapp_token: str = ""
    whatsapp_phone_number_id: str = ""

    # FCM
    fcm_server_key: str = ""

    # Supabase
    supabase_url: str = ""
    supabase_service_key: str = ""
    supabase_storage_bucket: str = "temptations"

    # Rate limiting
    rate_limit_authenticated: int = 100  # per minute
    rate_limit_public: int = 20  # per minute
    trusted_proxy_ips: list[str] = []

    # Loyalty
    points_per_rupee: float = 0.1
    points_redemption_rate: float = 0.1
    min_redemption_points: int = 100
    max_redemption_pct: float = 0.5
    reservation_checkin_points: int = 50
    birthday_bonus_points: int = 500
    anniversary_bonus_points: int = 300
    referral_bonus_points: int = 200

    # Reservation
    reservation_deposit_amount: float = 200.0
    reservation_expiry_minutes: int = 30
    reservation_no_show_grace_minutes: int = 30

    # Sentry
    sentry_dsn: str = ""

    # Request limits
    max_request_body_size: int = 10 * 1024 * 1024  # 10 MB

    @field_validator("secret_key")
    @classmethod
    def secret_key_must_be_changed(cls, v: str, info: Any) -> str:
        env = info.data.get("environment", "development")
        if env == "production" and v == "change-me-in-production":
            raise ValueError("SECRET_KEY must be set to a secure random value in production")
        return v

    @model_validator(mode="after")
    def validate_production_secrets(self) -> "Settings":
        if self.environment == "production":
            missing = []
            if not self.secret_key or self.secret_key == "change-me-in-production":
                missing.append("SECRET_KEY")
            if not self.firebase_project_id:
                missing.append("FIREBASE_PROJECT_ID")
            if not self.firebase_private_key:
                missing.append("FIREBASE_PRIVATE_KEY")
            if not self.firebase_client_email:
                missing.append("FIREBASE_CLIENT_EMAIL")
            if not self.phonepe_merchant_id:
                missing.append("PHONEPE_MERCHANT_ID")
            if not self.phonepe_salt_key:
                missing.append("PHONEPE_SALT_KEY")
            if not self.redis_url or "localhost" in self.redis_url:
                missing.append("REDIS_URL (must not point to localhost in production)")
            if not self.database_url or "localhost" in self.database_url:
                missing.append("DATABASE_URL (must not point to localhost in production)")
            if missing:
                raise ValueError(f"Missing required production environment variables: {', '.join(missing)}")
        return self

    @property
    def is_production(self) -> bool:
        return self.environment == "production"


@lru_cache
def get_settings() -> Settings:
    return Settings()
