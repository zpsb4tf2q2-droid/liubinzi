from __future__ import annotations

from fastapi import status

SERVICE_HEADERS = {"X-API-Key": "test-service-key"}


def test_service_registration_flow(client):
    payload = {"name": "analytics", "url": "http://analytics.local"}
    register_response = client.post("/api/v1/services/register", json=payload, headers=SERVICE_HEADERS)
    assert register_response.status_code == status.HTTP_201_CREATED

    list_response = client.get("/api/v1/services/")
    assert list_response.status_code == status.HTTP_200_OK
    services = list_response.json()
    assert services.get(payload["name"]) == payload["url"]

    detail_response = client.get(f"/api/v1/services/{payload['name']}")
    assert detail_response.status_code == status.HTTP_200_OK
    assert detail_response.json()["url"] == payload["url"]

    delete_response = client.delete(f"/api/v1/services/{payload['name']}", headers=SERVICE_HEADERS)
    assert delete_response.status_code == status.HTTP_204_NO_CONTENT
