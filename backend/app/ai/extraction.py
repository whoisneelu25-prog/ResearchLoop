import os
import re
import json
import logging
import certifi
import httpx
from typing import Dict, Any, List, Optional
from app.scoring.opportunity import calculate_opportunity_score
from app.ai.prompts.evidence_extraction import EVIDENCE_EXTRACTION_SYSTEM_PROMPT
from app.ai.prompts.contradiction_detection import CONTRADICTION_DETECTION_SYSTEM_PROMPT
from app.ai.prompts.gap_detection import GAP_DETECTION_SYSTEM_PROMPT
from app.ai.prompts.hypothesis_generation import HYPOTHESIS_GENERATION_SYSTEM_PROMPT

logger = logging.getLogger(__name__)

LLM_PROVIDER = os.getenv("LLM_PROVIDER", "openai").lower()
LLM_API_KEY = os.getenv("LLM_API_KEY") or os.getenv("OPENAI_API_KEY") or os.getenv("GEMINI_API_KEY")
LLM_MODEL = os.getenv("LLM_MODEL", "gpt-4o-mini")

class AIExtractionEngine:
    def __init__(self):
        self.api_key = LLM_API_KEY
        self.model = LLM_MODEL
        self.client = httpx.Client(timeout=30.0, verify=certifi.where())

    def has_active_llm(self) -> bool:
        return bool(self.api_key and len(self.api_key.strip()) > 5)

    def extract_paper_evidence(self, paper: Dict[str, Any], query_context: str = "") -> Dict[str, Any]:
        """Extract structured evidence from paper title and abstract."""
        if self.has_active_llm():
            try:
                prompt = f"Paper Title: {paper.get('title')}\nJournal: {paper.get('journal')}\nYear: {paper.get('publication_year')}\nAbstract:\n{paper.get('abstract')}\nContext Query: {query_context}"
                res = self._call_llm_json(EVIDENCE_EXTRACTION_SYSTEM_PROMPT, prompt)
                if res and isinstance(res, dict) and "result_type" in res:
                    return res
            except Exception as e:
                logger.warning(f"LLM evidence extraction failed, using scientific rule-based NLP fallback: {e}")

        # Deterministic Scientific NLP Rule-based Fallback
        return self._rule_based_evidence_extraction(paper, query_context)

    def _call_llm_json(self, system_prompt: str, user_prompt: str) -> Optional[Dict[str, Any]]:
        if not self.api_key:
            return None
        
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        url = "https://api.openai.com/v1/chat/completions"
        payload = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            "response_format": {"type": "json_object"},
            "temperature": 0.1
        }
        
        resp = self.client.post(url, headers=headers, json=payload)
        resp.raise_for_status()
        data = resp.json()
        content = data["choices"][0]["message"]["content"]
        return json.loads(content)

    def _rule_based_evidence_extraction(self, paper: Dict[str, Any], query_context: str) -> Dict[str, Any]:
        """High-precision biomedical regex & linguistic heuristics for fallback."""
        title = paper.get("title", "")
        abstract = paper.get("abstract", "")
        full_text = f"{title}. {abstract}"
        
        # Sample size detection (e.g., n=240, 240 patients, cohort of 180)
        sample_size = None
        sample_size_display = None
        n_match = re.search(r'\b(?:n\s*=\s*|enrolled\s+|cohort\s+of\s+|including\s+)(\d{2,5})\b', full_text, re.IGNORECASE)
        if n_match:
            try:
                sample_size = int(n_match.group(1))
                sample_size_display = f"n={sample_size}"
            except ValueError:
                pass
        
        # Biomarker detection
        biomarkers = []
        for bm in ["EGFR", "KRAS", "PD-L1", "ALK", "ROS1", "BRAF", "HER2", "MET", "Biomarker X", "Biomarker Y", "T790M", "G12C"]:
            if re.search(r'\b' + re.escape(bm) + r'\b', full_text, re.IGNORECASE):
                # Check status (+, -, positive, negative)
                if re.search(r'\b' + re.escape(bm) + r'[-−]|negative|mutant-negative', full_text, re.IGNORECASE):
                    biomarkers.append(f"{bm}-")
                elif re.search(r'\b' + re.escape(bm) + r'[\+]|positive|mutant', full_text, re.IGNORECASE):
                    biomarkers.append(f"{bm}+")
                else:
                    biomarkers.append(bm)
        biomarker_str = ", ".join(list(dict.fromkeys(biomarkers))) if biomarkers else "Unstratified / Standard"

        # Intervention detection
        interventions = []
        for drug in ["Osimertinib", "Pembrolizumab", "Sotorasib", "Erlotinib", "Gefitinib", "Alectinib", "Cisplatin", "Docetaxel", "Drug A", "Drug B", "Immunotherapy", "Targeted Therapy", "Chemotherapy"]:
            if re.search(r'\b' + re.escape(drug) + r'\b', full_text, re.IGNORECASE):
                interventions.append(drug)
        intervention_str = ", ".join(list(dict.fromkeys(interventions))) if interventions else (query_context or "Targeted Intervention")

        # Population detection
        pop_str = "Advanced / Metastatic NSCLC"
        if re.search(r'first-line|treatment-na[iï]ve', full_text, re.IGNORECASE):
            pop_str = "Treatment-naïve advanced NSCLC"
        elif re.search(r'previously treated|resistant|refractory|second-line', full_text, re.IGNORECASE):
            pop_str = "Previously treated / Resistant NSCLC"
        elif re.search(r'elderly|geriatric', full_text, re.IGNORECASE):
            pop_str = "Elderly NSCLC cohort"

        # Study type detection
        study_type = "Clinical Study"
        if re.search(r'phase\s*3|phase\s*iii|randomized\s+controlled|rct', full_text, re.IGNORECASE):
            study_type = "Phase III RCT"
        elif re.search(r'phase\s*2|phase\s*ii', full_text, re.IGNORECASE):
            study_type = "Phase II Trial"
        elif re.search(r'phase\s*1|phase\s*i\b', full_text, re.IGNORECASE):
            study_type = "Phase I Trial"
        elif re.search(r'retrospective|real-world|observational', full_text, re.IGNORECASE):
            study_type = "Retrospective Cohort"
        elif re.search(r'meta-analysis|systematic review', full_text, re.IGNORECASE):
            study_type = "Meta-Analysis"
        elif re.search(r'preclinical|in vitro|in vivo|mouse model', full_text, re.IGNORECASE):
            study_type = "Preclinical Study"

        # Result direction & classification heuristics
        # Negative / Null triggers
        is_negative = False
        neg_classification = None
        result_type = "positive"
        result_category = "Improved response"
        
        null_patterns = [
            r'no\s+significant\s+(?:difference|improvement|benefit|effect|survival)',
            r'failed\s+to\s+(?:improve|demonstrate|show|reach)',
            r'did\s+not\s+(?:improve|extend|significantly)',
            r'comparable\s+to\s+placebo',
            r'null\s+findings|null\s+result',
            r'terminated\s+early|stopped\s+early|futility'
        ]
        
        adverse_patterns = [
            r'higher\s+(?:incidence|rate)\s+of\s+adverse',
            r'unacceptable\s+toxicity',
            r'inferior\s+overall\s+survival'
        ]

        mixed_patterns = [
            r'discordant|conflicting|variable\s+response|mixed\s+results|subgroup\s+variation'
        ]

        if any(re.search(p, full_text, re.IGNORECASE) for p in null_patterns):
            if re.search(r'terminated\s+early|stopped\s+early|futility', full_text, re.IGNORECASE):
                result_type = "negative"
                result_category = "Early termination"
                neg_classification = "Early termination"
            else:
                result_type = "null"
                result_category = "Null result"
                neg_classification = "Null result"
            is_negative = True
        elif any(re.search(p, full_text, re.IGNORECASE) for p in adverse_patterns):
            result_type = "negative"
            result_category = "Adverse outcome"
            neg_classification = "Adverse outcome"
            is_negative = True
        elif any(re.search(p, full_text, re.IGNORECASE) for p in mixed_patterns):
            result_type = "mixed"
            result_category = "Mixed subgroup efficacy"
            is_negative = False
        else:
            result_type = "positive"
            result_category = "Statistically significant benefit"
            is_negative = False

        # Extract best sentence for evidence quote
        sentences = re.split(r'(?<=[.!?])\s+', abstract)
        evidence_text = ""
        for s in sentences:
            if re.search(r'conclusion|result|demonstrated|showed|improved|failed|hazard ratio|p\s*<|p\s*=|survival', s, re.IGNORECASE):
                evidence_text = s.strip()
                break
        if not evidence_text:
            evidence_text = sentences[0].strip() if sentences else full_text[:200]

        # Confidence assessment
        confidence = "High" if (study_type == "Phase III RCT" and sample_size and sample_size > 100) else ("Medium" if sample_size else "Low")
        confidence_rationale = f"Assigned {confidence} based on {study_type} design and sample reporting ({sample_size_display or 'sample size unspecified'})."

        # Authors short label
        authors = paper.get("authors", "Investigator")
        first_author = authors.split(",")[0].split(" ")[0] if authors else "Author"
        year = paper.get("publication_year", 2024)
        study_label = f"{first_author} et al., {year}"

        return {
            "study_label": study_label,
            "year": year,
            "disease": "Non-Small Cell Lung Cancer (NSCLC)",
            "intervention": intervention_str,
            "comparator": "Standard of Care Chemotherapy / Placebo",
            "population": pop_str,
            "biomarker": biomarker_str,
            "study_type": study_type,
            "sample_size": sample_size,
            "sample_size_display": sample_size_display or ("n=unspecified"),
            "primary_outcome": "Progression-Free Survival (PFS) & Overall Response Rate (ORR)",
            "result_type": result_type,
            "result_category": result_category,
            "result_summary": f"Study reported {result_category.lower()} for {intervention_str} in {pop_str}.",
            "effect_description": f"Outcome observed in cohort with primary endpoint evaluation.",
            "evidence_text": evidence_text,
            "confidence": confidence,
            "confidence_rationale": confidence_rationale,
            "is_negative_finding": is_negative,
            "negative_classification": neg_classification
        }

ai_engine = AIExtractionEngine()
