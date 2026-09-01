import logging
import certifi
import httpx
from typing import List, Dict, Any, Optional

logger = logging.getLogger(__name__)

EUROPE_PMC_BASE_URL = "https://www.ebi.ac.uk/europepmc/webservices/rest"

class EuropePMCService:
    def __init__(self):
        self.client = httpx.Client(timeout=15.0, verify=certifi.where())

    def search_articles(self, query: str, page_size: int = 15) -> List[Dict[str, Any]]:
        """Search Europe PMC REST API and return structured paper metadata."""
        try:
            params = {
                "query": query,
                "format": "json",
                "pageSize": page_size,
                "resultType": "core"
            }
            response = self.client.get(f"{EUROPE_PMC_BASE_URL}/search", params=params)
            response.raise_for_status()
            data = response.json()
            results = data.get("resultList", {}).get("result", [])
            
            papers = []
            for item in results:
                title = item.get("title", "").strip().rstrip(".")
                abstract = item.get("abstractText", "Abstract not available.")
                if not title:
                    continue
                
                pub_year = None
                if item.get("pubYear"):
                    try:
                        pub_year = int(item.get("pubYear"))
                    except ValueError:
                        pub_year = 2024

                pmid = item.get("pmid")
                pmcid = item.get("pmcid")
                doi = item.get("doi")
                ext_id = f"PMID:{pmid}" if pmid else (f"PMCID:{pmcid}" if pmcid else item.get("id"))
                
                url = f"https://europepmc.org/article/{item.get('source', 'MED')}/{item.get('id')}" if item.get('id') else None
                if pmid:
                    url = f"https://pubmed.ncbi.nlm.nih.gov/{pmid}/"

                papers.append({
                    "source": "Europe PMC",
                    "external_id": ext_id,
                    "doi": doi,
                    "title": title,
                    "abstract": abstract,
                    "authors": item.get("authorString", "Unknown Authors"),
                    "journal": item.get("journalTitle", "Biomedical Journal"),
                    "publication_year": pub_year or 2024,
                    "url": url,
                    "study_type": item.get("pubType", "Research Article")
                })
                
            return papers
        except Exception as e:
            logger.warning(f"Europe PMC search failed: {e}")
            return []

europepmc_service = EuropePMCService()
