"""Application settings loaded from environment variables."""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Central configuration loaded from .env file or environment."""

    # Database
    database_url: str = "sqlite:///./data/ctf_panel.db"

    # Game defaults (can be overridden via UI config)
    default_team_id: int = 2
    default_game_tick_seconds: int = 120

    # CORS
    cors_origins: list[str] = ["http://localhost:5173", "http://localhost:3000", "http://localhost"]

    # Flag ID API
    flag_id_api_url: str = "http://10.10.0.1:8081/flagIds"
    game_info_api_url: str = "http://10.10.0.1:8081/"

    # Flag Submission
    flag_submit_url: str = "http://10.10.0.1:8080/flags"

    # Scoreboard — overridable via SCOREBOARD_URL env var
    scoreboard_url: str = "http://10.10.0.1"

    # Auth — override JWT_SECRET in .env for production
    jwt_secret: str = "ctf-command-center-change-me-in-production"
    jwt_expire_hours: int = 12

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()
