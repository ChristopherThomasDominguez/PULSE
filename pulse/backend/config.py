import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    # IBM Granite
    WATSONX_API_KEY = os.getenv("WATSONX_API_KEY", "")
    WATSONX_PROJECT_ID = os.getenv("WATSONX_PROJECT_ID", "")
    WATSONX_URL = os.getenv("WATSONX_URL", "https://us-south.ml.cloud.ibm.com")
    GRANITE_MODEL_ID = os.getenv("GRANITE_MODEL_ID", "ibm/granite-13b-chat-v2")

    # IBM watsonx Orchestrate
    ORCHESTRATE_URL = os.getenv("ORCHESTRATE_URL", "")
    ORCHESTRATE_API_KEY = os.getenv("ORCHESTRATE_API_KEY", "")
    ORCHESTRATE_INSTANCE_ID = os.getenv("ORCHESTRATE_INSTANCE_ID", "")

    # Feature flags
    USE_ORCHESTRATE = os.getenv("USE_ORCHESTRATE", "false").lower() == "true"

    def is_granite_configured(self):
        return bool(self.WATSONX_API_KEY and self.WATSONX_PROJECT_ID)

    def is_orchestrate_configured(self):
        return bool(self.ORCHESTRATE_URL and self.ORCHESTRATE_API_KEY)

cfg = Config()