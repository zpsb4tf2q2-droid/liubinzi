"""Data ingestion and analytics endpoints."""

from __future__ import annotations

from fastapi import APIRouter, Depends

from app.api.deps import get_data_processor
from app.schemas.data import DataAnalysisRequest, DataAnalysisResponse, DataIngestRequest
from app.services.data_processing import DataProcessor

router = APIRouter()


@router.post("/ingest", response_model=dict)
async def ingest_data(payload: DataIngestRequest, processor: DataProcessor = Depends(get_data_processor)) -> dict:
    return await processor.ingest(payload)


@router.post("/analyze", response_model=DataAnalysisResponse)
async def analyze_data(
    payload: DataAnalysisRequest,
    processor: DataProcessor = Depends(get_data_processor),
) -> DataAnalysisResponse:
    return await processor.analyze(payload)
