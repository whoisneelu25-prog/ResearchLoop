import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database.session import SessionLocal
from app.models.entities import ResearchProject, Paper, Contradiction, ResearchGap, ResearchDirection
from app.seed.topic_dataset_generator import TOPIC_METADATA
from app.services.topic_matcher import topic_matcher

client = TestClient(app)

def test_all_15_predefined_topics_seeded():
    db = SessionLocal()
    try:
        for topic in TOPIC_METADATA:
            proj = db.query(ResearchProject).filter(ResearchProject.id == topic["id"]).first()
            assert proj is not None, f"Topic {topic['id']} not found in database"
            assert proj.title == topic["title"]
            assert proj.is_demo is True

            # Verify associated entities
            papers_count = db.query(Paper).filter(Paper.project_id == topic["id"]).count()
            assert papers_count > 0, f"Topic {topic['id']} has 0 papers"

            gap_count = db.query(ResearchGap).filter(ResearchGap.project_id == topic["id"]).count()
            assert gap_count > 0, f"Topic {topic['id']} has 0 gaps"

            dir_count = db.query(ResearchDirection).filter(ResearchDirection.project_id == topic["id"]).count()
            assert dir_count > 0, f"Topic {topic['id']} has 0 directions"
    finally:
        db.close()

def test_get_predefined_topics_api():
    response = client.get("/api/research/topics")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 15
    for item in data:
        assert "id" in item
        assert "title" in item
        assert "paper_count" in item
        assert item["paper_count"] > 0
        assert "contradiction_count" in item
        assert "gap_count" in item
        assert "direction_count" in item

def test_semantic_topic_matching_and_confidence():
    test_cases = [
        ("immunotherapy resistance in cancer", "Cancer Immunotherapy Resistance", True, 90.0),
        ("why does cancer immunotherapy stop working", "Cancer Immunotherapy Resistance", True, 90.0),
        ("antimicrobial resistance", "Antibiotic Resistance", True, 90.0),
        ("drug resistant TB", "Tuberculosis Drug Resistance", True, 90.0),
        ("drug resistance in tuberculosis", "Tuberculosis Drug Resistance", True, 90.0),
        ("Alzheimer biomarkers", "Alzheimer's Disease Biomarkers", True, 90.0),
        ("precision oncology", "Personalized Cancer Treatment", True, 90.0),
        ("CAR T treatment", "CAR-T Cell Therapy", True, 90.0),
        ("gene editing treatment", "CRISPR Gene Therapy", True, 90.0),
    ]

    for query, expected_topic, expected_auto, min_conf in test_cases:
        res = topic_matcher.match(query)
        assert res["matched_topic"] is not None, f"Query '{query}' failed to match any topic"
        assert res["matched_topic"]["title"] == expected_topic, f"Query '{query}' matched '{res['matched_topic']['title']}' instead of '{expected_topic}'"
        assert res["confidence_score"] >= min_conf, f"Query '{query}' confidence {res['confidence_score']} < {min_conf}"
        assert res["is_auto_match"] is expected_auto

def test_disease_specificity_tb_vs_antibiotic():
    # "drug resistance in tuberculosis" must prioritize Tuberculosis Drug Resistance over general Antibiotic Resistance
    res = topic_matcher.match("drug resistance in tuberculosis")
    assert res["matched_topic"]["title"] == "Tuberculosis Drug Resistance"
    assert res["matched_topic"]["title"] != "Antibiotic Resistance"
    assert res["confidence_score"] >= 90.0

def test_topic_matching_api_endpoint():
    resp = client.post("/api/research/match-topic", json={"query": "precision oncology"})
    assert resp.status_code == 200
    data = resp.json()
    assert data["matched_topic"] is not None
    assert data["matched_topic"]["title"] == "Personalized Cancer Treatment"
    assert data["confidence_score"] >= 90.0
    assert data["is_auto_match"] is True
    assert data["matched_topic"]["paper_count"] > 0
