from typing import Dict, Any, Tuple

def calculate_opportunity_score(
    novelty: float,
    gap: float,
    feasibility: float,
    impact: float,
    weight_novelty: float = 0.30,
    weight_gap: float = 0.30,
    weight_feasibility: float = 0.20,
    weight_impact: float = 0.20
) -> Tuple[float, int, str]:
    """
    Calculate transparent opportunity score based on weighted factors:
    Score = Novelty * 0.30 + Evidence Gap * 0.30 + Feasibility * 0.20 + Potential Impact * 0.20

    Tiers:
    0 - 39: Low opportunity
    40 - 59: Moderate
    60 - 79: Strong
    80 - 100: High opportunity
    """
    raw_score = (
        (novelty * weight_novelty) +
        (gap * weight_gap) +
        (feasibility * weight_feasibility) +
        (impact * weight_impact)
    )
    
    score_1dec = round(raw_score, 1)
    rounded_score = int(round(score_1dec))
    
    if rounded_score >= 80:
        tier = "High opportunity"
    elif rounded_score >= 60:
        tier = "Strong"
    elif rounded_score >= 40:
        tier = "Moderate"
    else:
        tier = "Low opportunity"
        
    return score_1dec, rounded_score, tier


def get_score_breakdown(
    novelty: float,
    gap: float,
    feasibility: float,
    impact: float
) -> Dict[str, Any]:
    score_1dec, rounded_score, tier = calculate_opportunity_score(novelty, gap, feasibility, impact)
    return {
        "novelty_score": novelty,
        "gap_score": gap,
        "feasibility_score": feasibility,
        "impact_score": impact,
        "raw_score": score_1dec,
        "overall_score": rounded_score,
        "tier": tier,
        "weights": {
            "novelty": "30%",
            "gap": "30%",
            "feasibility": "20%",
            "impact": "20%"
        },
        "formula_display": f"({novelty} × 0.30) + ({gap} × 0.30) + ({feasibility} × 0.20) + ({impact} × 0.20) = {score_1dec} ≈ {rounded_score} / 100"
    }
