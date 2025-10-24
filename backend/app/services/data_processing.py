"""Data ingestion and analysis helpers."""

from __future__ import annotations

import json
from typing import Dict

import pandas as pd

from app.schemas.data import DataAnalysisRequest, DataAnalysisResponse, DataIngestRequest
from app.services.cache import RedisCache


class DataProcessor:
    """Encapsulate data ingestion, pre-processing, and analysis."""

    def __init__(self, cache: RedisCache | None = None) -> None:
        self._cache = cache

    async def ingest(self, payload: DataIngestRequest) -> Dict[str, object]:
        # In a real system this would persist to a data lake or message queue.
        return {"status": "accepted", "source": payload.source, "count": len(payload.datapoints)}

    async def analyze(self, payload: DataAnalysisRequest) -> DataAnalysisResponse:
        cache_key = f"analysis:{payload.dataset_name}"
        if payload.use_cache and self._cache is not None:
            cached_value = await self._cache.get(cache_key)
            if cached_value:
                data = json.loads(cached_value)
                data["cached"] = True
                return DataAnalysisResponse(**data)

        df = pd.DataFrame([point.model_dump() for point in payload.datapoints])
        if df.empty:
            return DataAnalysisResponse(
                dataset_name=payload.dataset_name,
                count=0,
                mean=0.0,
                median=0.0,
                std=0.0,
                min=0.0,
                max=0.0,
                cached=False,
                metadata={"message": "No datapoints provided"},
            )

        series = df["value"].astype(float)
        analysis = DataAnalysisResponse(
            dataset_name=payload.dataset_name,
            count=int(series.count()),
            mean=float(series.mean()),
            median=float(series.median()),
            std=float(series.std(ddof=0) if series.count() > 1 else 0.0),
            min=float(series.min()),
            max=float(series.max()),
            cached=False,
            metadata={"timestamp_range": [df["timestamp"].min(), df["timestamp"].max()]},
        )

        if payload.use_cache and self._cache is not None:
            cache_payload = analysis.model_dump()
            cache_payload["cached"] = False
            await self._cache.set(cache_key, json.dumps(cache_payload), expire_seconds=300)

        return analysis
