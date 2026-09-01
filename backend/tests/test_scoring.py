import pytest
from app.scoring.opportunity import calculate_opportunity_score, get_score_breakdown

def test_opportunity_score_standard_case():
    """
    Test Opportunity Score weighted calculation:
    Given:
    Novelty = 88
    Evidence Gap = 91
    Feasibility = 68
    Impact = 79

    Calculate:
    88 * 0.30 + 91 * 0.30 + 68 * 0.20 + 79 * 0.20
    26.4 + 27.3 + 13.6 + 15.8 = 83.1 -> 83 / 100
    """
    score_1dec, rounded_score, tier = calculate_opportunity_score(
        novelty=88.0,
        gap=91.0,
        feasibility=68.0,
        impact=79.0
    )
    
    assert score_1dec == 83.1
    assert rounded_score == 83
    assert tier == "High opportunity"

def test_opportunity_score_breakdown():
    breakdown = get_score_breakdown(
        novelty=88.0,
        gap=91.0,
        feasibility=68.0,
        impact=79.0
    )
    assert breakdown["overall_score"] == 83
    assert breakdown["tier"] == "High opportunity"
    assert "88.0 × 0.30" in breakdown["formula_display"] or "88 × 0.30" in breakdown["formula_display"]

def test_opportunity_score_tiers():
    _, s_high, tier_high = calculate_opportunity_score(90, 90, 80, 80)
    assert s_high >= 80
    assert tier_high == "High opportunity"

    _, s_strong, tier_strong = calculate_opportunity_score(70, 70, 60, 60)
    assert 60 <= s_strong < 80
    assert tier_strong == "Strong"

    _, s_mod, tier_mod = calculate_opportunity_score(50, 50, 45, 45)
    assert 40 <= s_mod < 60
    assert tier_mod == "Moderate"

    _, s_low, tier_low = calculate_opportunity_score(20, 30, 20, 20)
    assert s_low < 40
    assert tier_low == "Low opportunity"
