from __future__ import annotations

from fastapi import status


def test_register_login_and_profile(client):
    register_payload = {
        "email": "test@example.com",
        "password": "supersecret",
        "full_name": "Test User",
        "roles": ["user"],
    }
    response = client.post("/api/v1/auth/register", json=register_payload)
    assert response.status_code == status.HTTP_201_CREATED

    login_response = client.post(
        "/api/v1/auth/token",
        data={"username": register_payload["email"], "password": register_payload["password"]},
        headers={"content-type": "application/x-www-form-urlencoded"},
    )
    assert login_response.status_code == status.HTTP_200_OK
    token = login_response.json()["access_token"]

    me_response = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_response.status_code == status.HTTP_200_OK
    data = me_response.json()
    assert data["email"] == register_payload["email"].lower()
    assert data["is_active"] is True
