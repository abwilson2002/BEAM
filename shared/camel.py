from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel


class CamelModel(BaseModel):
    """API models speak camelCase to match the TypeScript types in the frontend."""

    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)
