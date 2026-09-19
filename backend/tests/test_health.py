from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check_returns_200():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"

def test_dalias_aggregate_mock_returns_200():
    response = client.get("/api/v1/dalias/aggregate")
    assert response.status_code == 200
    assert response.json()["status"] == "success"
