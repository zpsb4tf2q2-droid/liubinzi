"""Data processing schemas."""

from __future__ import annotations

from typing import Any, Dict, List

from pydantic import BaseModel, Field


class DataPoint(BaseModel):
    timestamp: float
    value: float


class DataIngestRequest(BaseModel):
    source: str
    datapoints: List[DataPoint]


class DataAnalysisRequest(BaseModel):
    dataset_name: str
    datapoints: List[DataPoint]
    use_cache: bool = True


class DataAnalysisResponse(BaseModel):
    dataset_name: str
    count: int
    mean: float
    median: float
    std: float
    min: float
    max: float
    cached: bool = False
    metadata: Dict[str, Any] = Field(default_factory=dict)
