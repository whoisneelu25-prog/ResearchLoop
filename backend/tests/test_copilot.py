import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_copilot_unauthorized():
    # Attempt chat without token
    res = client.post("/api/copilot/chat", json={
        "project_id": "dummy-id",
        "message": "Why are these studies contradictory?"
    })
    assert res.status_code == 401

def test_copilot_demo_chat_flow():
    # 1. Login as demo user
    login_res = client.post("/api/auth/demo-login")
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Get demo project
    projects_res = client.get("/api/research", headers=headers)
    assert projects_res.status_code == 200
    projects = projects_res.json()
    assert len(projects) > 0
    project_id = projects[0]["id"]

    # 3. Chat: Contradictions inquiry
    chat_res = client.post("/api/copilot/chat", headers=headers, json={
        "project_id": project_id,
        "message": "Why are these studies contradictory?"
    })
    assert chat_res.status_code == 200
    data = chat_res.json()
    assert "answer" in data
    assert len(data["answer"]) > 50
    assert "sources" in data
    assert len(data["sources"]) > 0
    assert data["confidence"] in ["High", "Medium", "Low"]
    assert "conversation_id" in data
    conv_id = data["conversation_id"]

    # 4. Chat: Follow-up question in same conversation
    followup_res = client.post("/api/copilot/chat", headers=headers, json={
        "project_id": project_id,
        "message": "What were the main negative findings?",
        "conversation_id": conv_id
    })
    assert followup_res.status_code == 200
    f_data = followup_res.json()
    assert f_data["conversation_id"] == conv_id
    assert "negative" in f_data["answer"].lower() or "null" in f_data["answer"].lower()

    # 5. List conversations
    convs_res = client.get(f"/api/copilot/conversations/{project_id}", headers=headers)
    assert convs_res.status_code == 200
    conv_list = convs_res.json()
    assert len(conv_list) >= 1
    assert any(c["id"] == conv_id for c in conv_list)

    # 6. Retrieve single conversation with messages
    single_conv_res = client.get(f"/api/copilot/conversations/{project_id}/{conv_id}", headers=headers)
    assert single_conv_res.status_code == 200
    conv_detail = single_conv_res.json()
    assert len(conv_detail["messages"]) >= 4  # 2 user msgs + 2 assistant msgs
