import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_and_root():
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json()["status"] == "healthy"

    res_root = client.get("/")
    assert res_root.status_code == 200
    assert "ResearchLoop" in res_root.json()["name"]

def test_demo_login_and_auth_flow():
    # 1. Demo login
    res = client.post("/api/auth/demo-login")
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert data["user"]["is_demo"] is True
    assert data["user"]["email"] == "researcher@biomed.org"

    token = data["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Get /api/auth/me
    res_me = client.get("/api/auth/me", headers=headers)
    assert res_me.status_code == 200
    assert res_me.json()["email"] == "researcher@biomed.org"

def test_custom_registration_and_login():
    email = "oncologist_test@hospital.org"
    password = "SecurePassword123!"

    # Register
    res_reg = client.post("/api/auth/register", json={
        "email": email,
        "password": password,
        "full_name": "Dr. Sarah Connor",
        "institution": "Johns Hopkins University",
        "research_field": "Oncology"
    })
    if res_reg.status_code != 200:
        # If already registered from previous run
        assert res_reg.status_code == 400

    # Login
    res_login = client.post("/api/auth/login", json={
        "email": email,
        "password": password
    })
    assert res_login.status_code == 200
    assert "access_token" in res_login.json()

def test_research_endpoints():
    # Demo login
    login_res = client.post("/api/auth/demo-login")
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # List projects
    res = client.get("/api/research", headers=headers)
    assert res.status_code == 200
    projects = res.json()
    assert len(projects) > 0
    demo_proj = projects[0]
    project_id = demo_proj["id"]

    # Get project detail
    res_det = client.get(f"/api/research/{project_id}", headers=headers)
    assert res_det.status_code == 200
    det = res_det.json()
    assert det["paper_count"] > 0
    assert det["negative_count"] > 0
    assert det["contradiction_count"] > 0
    assert det["gap_count"] > 0
    assert det["direction_count"] > 0

    # Get Papers
    res_papers = client.get(f"/api/research/{project_id}/papers", headers=headers)
    assert res_papers.status_code == 200
    assert len(res_papers.json()) > 0

    # Get Evidence
    res_ev = client.get(f"/api/research/{project_id}/evidence", headers=headers)
    assert res_ev.status_code == 200
    assert len(res_ev.json()) > 0

    # Get Failures
    res_fail = client.get(f"/api/research/{project_id}/failures", headers=headers)
    assert res_fail.status_code == 200
    assert len(res_fail.json()) > 0

    # Get Contradictions
    res_contra = client.get(f"/api/research/{project_id}/contradictions", headers=headers)
    assert res_contra.status_code == 200
    assert len(res_contra.json()) > 0
    c0 = res_contra.json()[0]
    assert "possible_explanation" in c0

    # Get Research Gaps
    res_gaps = client.get(f"/api/research/{project_id}/gaps", headers=headers)
    assert res_gaps.status_code == 200
    assert len(res_gaps.json()) > 0
    g0 = res_gaps.json()[0]
    assert "known_evidence" in g0
    assert "missing_evidence" in g0

    # Get Hypotheses / Directions
    res_hyp = client.get(f"/api/research/{project_id}/hypotheses", headers=headers)
    assert res_hyp.status_code == 200
    assert len(res_hyp.json()) > 0
    h0 = res_hyp.json()[0]
    assert h0["overall_score"] > 0

    # What-If Simulation
    res_whatif = client.post(f"/api/research/{project_id}/what-if", headers=headers, json={
        "biomarker": "Biomarker X-",
        "population": "All",
        "intervention": "Drug A",
        "study_type": "All",
        "outcome": "Progression-free survival"
    })
    assert res_whatif.status_code == 200
    whatif_data = res_whatif.json()
    assert "coverage_status" in whatif_data
    assert "total_matching_studies" in whatif_data

    # Knowledge Graph
    res_graph = client.get(f"/api/research/{project_id}/graph", headers=headers)
    assert res_graph.status_code == 200
    graph_data = res_graph.json()
    assert len(graph_data["nodes"]) > 0
    assert len(graph_data["edges"]) > 0

    # System Status
    res_sys = client.get("/api/system/status")
    assert res_sys.status_code == 200
    sys_data = res_sys.json()
    assert sys_data["overall_healthy"] is True
    assert "Connected" in sys_data["database"]
