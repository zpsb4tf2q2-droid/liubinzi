"""Service discovery and inter-service communication endpoints."""

from __future__ import annotations

from urllib.parse import urljoin

from fastapi import APIRouter, Depends, HTTPException, status
import httpx

from app.api.deps import get_http_client, get_service_registry
from app.schemas.service import ServiceInfo, ServiceProxyRequest, ServiceRegistrationRequest
from app.security.api_key import validate_service_api_key
from app.services.http_client import HTTPClient
from app.services.service_registry import ServiceRegistry

router = APIRouter()


@router.get("/", response_model=dict)
async def list_services(registry: ServiceRegistry = Depends(get_service_registry)) -> dict:
    services = await registry.list()
    return services


@router.post("/register", response_model=ServiceInfo, status_code=status.HTTP_201_CREATED)
async def register_service(
    payload: ServiceRegistrationRequest,
    registry: ServiceRegistry = Depends(get_service_registry),
    _: str = Depends(validate_service_api_key),
) -> ServiceInfo:
    await registry.register(payload.name, str(payload.url))
    return ServiceInfo(name=payload.name, url=payload.url)


@router.delete("/{name}", status_code=status.HTTP_204_NO_CONTENT)
async def deregister_service(
    name: str,
    registry: ServiceRegistry = Depends(get_service_registry),
    _: str = Depends(validate_service_api_key),
) -> None:
    await registry.deregister(name)


@router.get("/{name}", response_model=ServiceInfo)
async def get_service(name: str, registry: ServiceRegistry = Depends(get_service_registry)) -> ServiceInfo:
    url = await registry.get(name)
    if not url:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Service not registered")
    return ServiceInfo(name=name, url=url)


@router.post("/{name}/proxy")
async def proxy_request(
    name: str,
    payload: ServiceProxyRequest,
    registry: ServiceRegistry = Depends(get_service_registry),
    client: HTTPClient = Depends(get_http_client),
) -> dict:
    base_url = await registry.get(name)
    if not base_url:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Service not registered")
    target_url = urljoin(base_url.rstrip("/") + "/", payload.path.lstrip("/"))
    try:
        response = await client.request(
            payload.method.upper(),
            target_url,
            headers=payload.headers,
            params=payload.query,
            json=payload.payload,
        )
    except httpx.HTTPStatusError as exc:
        raise HTTPException(status_code=exc.response.status_code, detail=exc.response.text) from exc
    except httpx.HTTPError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc

    content_type = response.headers.get("content-type", "").lower()
    data = response.json() if "application/json" in content_type and response.text else response.text
    return {"status_code": response.status_code, "data": data}
