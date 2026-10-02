import logging

from fastapi import APIRouter, HTTPException

from lamp.llm import LampConfigError, LampGenerationError
from lamp.schemas import Company, GenerateRequest
from lamp.service import generate_lamp_list

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/lamp", tags=["lamp"])


@router.post("/generate", response_model=list[Company])
async def generate(request: GenerateRequest):
    try:
        return await generate_lamp_list(request)
    except LampConfigError as error:
        raise HTTPException(status_code=503, detail=str(error)) from error
    except LampGenerationError as error:
        logger.exception("LAMP generation failed")
        raise HTTPException(status_code=502, detail=str(error)) from error
