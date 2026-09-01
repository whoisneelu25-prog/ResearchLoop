import re
from typing import Dict, Any, List, Optional, Tuple
from app.seed.topic_dataset_generator import TOPIC_METADATA

class TopicMatcher:
    def __init__(self):
        self.topics = TOPIC_METADATA

    def match(self, query: str) -> Dict[str, Any]:
        """
        Evaluate query against all 15 predefined topics using exact, alias,
        disease context, and token overlap scoring.
        """
        if not query or not query.strip():
            return {
                "matched_topic": None,
                "confidence_score": 0.0,
                "is_auto_match": False,
                "alternatives": []
            }

        q_clean = query.strip().lower()
        q_tokens = set(re.findall(r'\b[a-z0-9-]+\b', q_clean))

        scores: List[Tuple[Dict[str, Any], float]] = []

        for topic in self.topics:
            title_lower = topic["title"].lower()
            aliases = [a.lower() for a in topic.get("aliases", [])]
            disease_lower = topic.get("disease", "").lower()
            query_canonical = topic.get("query", "").lower()

            score = 0.0

            # Tier 1: Exact Title or Alias Match
            if q_clean == title_lower or q_clean in aliases:
                score = 100.0
            elif any(alias in q_clean or q_clean in alias for alias in aliases if len(alias) > 5):
                score = 95.0
            else:
                # Tier 2: Token Overlap & Specificity Scoring
                title_tokens = set(re.findall(r'\b[a-z0-9-]+\b', title_lower))
                canonical_tokens = set(re.findall(r'\b[a-z0-9-]+\b', query_canonical))

                # Disease context weighting
                if "tuberculosis" in q_clean or "tb" in q_tokens:
                    if "tuberculosis" in title_lower:
                        score += 55.0
                    elif "antibiotic" in title_lower:
                        score -= 20.0  # Penalize generic antibiotic when specific TB is requested

                if "immunotherapy" in q_clean or "checkpoint" in q_clean or "pd-1" in q_clean:
                    if "immunotherapy" in title_lower:
                        score += 50.0

                if "car-t" in q_clean or "car t" in q_clean or "cart" in q_tokens:
                    if "car-t" in title_lower:
                        score += 65.0

                if "crispr" in q_clean or "cas9" in q_clean or "gene editing" in q_clean:
                    if "crispr" in title_lower:
                        score += 65.0

                if "alzheimer" in q_clean:
                    if "alzheimer" in title_lower:
                        score += 55.0

                if "parkinson" in q_clean:
                    if "parkinson" in title_lower:
                        score += 55.0

                if "heart failure" in q_clean or "hfref" in q_clean or "hfpef" in q_clean:
                    if "heart failure" in title_lower:
                        score += 55.0

                if "breast cancer" in q_clean:
                    if "breast cancer" in title_lower:
                        score += 55.0

                if "nanoparticle" in q_clean or "nanomedicine" in q_clean:
                    if "nanoparticle" in title_lower:
                        score += 55.0

                if "autoimmune" in q_clean:
                    if "autoimmune" in title_lower:
                        score += 55.0

                if "vaccine" in q_clean or "vaccination" in q_clean:
                    if "vaccine" in title_lower:
                        score += 55.0

                if "diabetes" in q_clean or "glp-1" in q_clean:
                    if "diabetes" in title_lower:
                        score += 55.0

                if "repurpos" in q_clean:
                    if "repurposing" in title_lower:
                        score += 55.0

                if "personalized" in q_clean or "precision oncology" in q_clean or "molecular profiling" in q_clean:
                    if "personalized" in title_lower:
                        score += 55.0

                # Token overlap ratio
                overlap = len(q_tokens.intersection(title_tokens))
                if len(title_tokens) > 0:
                    overlap_ratio = overlap / len(title_tokens)
                    score += overlap_ratio * 40.0

            # Clamp score between 0 and 100
            final_score = min(100.0, max(0.0, score))
            scores.append((topic, final_score))

        # Sort descending by score
        scores.sort(key=lambda x: x[1], reverse=True)

        top_topic, top_score = scores[0]

        # Alternative suggestions for >= 50% match
        alternatives = [
            {
                "topic_id": t["id"],
                "title": t["title"],
                "confidence": round(s, 1)
            }
            for t, s in scores[1:4]
            if s >= 50.0
        ]

        is_auto_match = top_score >= 90.0

        return {
            "matched_topic": {
                "id": top_topic["id"],
                "title": top_topic["title"],
                "disease": top_topic.get("disease"),
                "intervention": top_topic.get("intervention"),
                "biomarker": top_topic.get("biomarker"),
                "summary": top_topic.get("summary"),
            } if top_score >= 70.0 else None,
            "confidence_score": round(top_score, 1),
            "is_auto_match": is_auto_match,
            "alternatives": alternatives
        }

topic_matcher = TopicMatcher()
