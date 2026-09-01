import logging
import certifi
import httpx
import xml.etree.ElementTree as ET
from typing import List, Dict, Any, Optional

logger = logging.getLogger(__name__)

NCBI_BASE_URL = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils"

class PubMedService:
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key
        # Use verify=certifi.where() for SSL robustness on all platforms
        self.client = httpx.Client(timeout=15.0, verify=certifi.where())

    def search_articles(self, query: str, max_results: int = 15) -> List[str]:
        """Search PubMed articles and return list of PMIDs."""
        try:
            params = {
                "db": "pubmed",
                "term": query,
                "retmode": "json",
                "retmax": max_results,
                "sort": "relevance"
            }
            if self.api_key:
                params["api_key"] = self.api_key

            response = self.client.get(f"{NCBI_BASE_URL}/esearch.fcgi", params=params)
            response.raise_for_status()
            data = response.json()
            id_list = data.get("esearchresult", {}).get("idlist", [])
            return id_list
        except Exception as e:
            logger.warning(f"PubMed search failed: {e}")
            return []

    def fetch_article_details(self, pmids: List[str]) -> List[Dict[str, Any]]:
        """Fetch article metadata and abstracts for given PMIDs."""
        if not pmids:
            return []
        
        try:
            params = {
                "db": "pubmed",
                "id": ",".join(pmids),
                "retmode": "xml"
            }
            if self.api_key:
                params["api_key"] = self.api_key

            response = self.client.get(f"{NCBI_BASE_URL}/efetch.fcgi", params=params)
            response.raise_for_status()
            
            return self._parse_pubmed_xml(response.text)
        except Exception as e:
            logger.warning(f"PubMed details fetch failed: {e}")
            return []

    def _parse_pubmed_xml(self, xml_text: str) -> List[Dict[str, Any]]:
        papers = []
        try:
            root = ET.fromstring(xml_text)
            for article in root.findall(".//PubmedArticle"):
                try:
                    medline = article.find("MedlineCitation")
                    if medline is None:
                        continue
                    
                    pmid_el = medline.find("PMID")
                    pmid = pmid_el.text if pmid_el is not None else ""
                    
                    art = medline.find("Article")
                    if art is None:
                        continue
                    
                    title_el = art.find("ArticleTitle")
                    title = title_el.text if title_el is not None and title_el.text else "Untitled Study"
                    
                    # Extract Abstract
                    abstract_texts = []
                    abstract_el = art.find("Abstract")
                    if abstract_el is not None:
                        for text_el in abstract_el.findall("AbstractText"):
                            label = text_el.get("Label")
                            txt = text_el.text or ""
                            if label:
                                abstract_texts.append(f"{label}: {txt}")
                            else:
                                abstract_texts.append(txt)
                    abstract = " ".join(abstract_texts) if abstract_texts else "Abstract not available."
                    
                    # Authors
                    authors_list = []
                    author_list_el = art.find("AuthorList")
                    if author_list_el is not None:
                        for a in author_list_el.findall("Author"):
                            last_name = a.find("LastName")
                            initials = a.find("Initials")
                            if last_name is not None and last_name.text:
                                auth_str = last_name.text
                                if initials is not None and initials.text:
                                    auth_str += f" {initials.text}"
                                authors_list.append(auth_str)
                    
                    authors_str = ", ".join(authors_list[:5]) + (" et al." if len(authors_list) > 5 else "") if authors_list else "Unknown Authors"
                    
                    # Journal & Year
                    journal_el = art.find(".//Journal/Title")
                    journal = journal_el.text if journal_el is not None else "Medical Journal"
                    
                    year = None
                    pub_date = art.find(".//JournalIssue/PubDate/Year")
                    if pub_date is not None and pub_date.text:
                        try:
                            year = int(pub_date.text)
                        except ValueError:
                            pass
                    if not year:
                        medline_date = art.find(".//JournalIssue/PubDate/MedlineDate")
                        if medline_date is not None and medline_date.text:
                            try:
                                year = int(medline_date.text[:4])
                            except ValueError:
                                year = 2023

                    # DOI
                    doi = None
                    for el in article.findall(".//ArticleIdList/ArticleId"):
                        if el.get("IdType") == "doi":
                            doi = el.text

                    papers.append({
                        "source": "PubMed",
                        "external_id": f"PMID:{pmid}" if pmid else None,
                        "doi": doi,
                        "title": title,
                        "abstract": abstract,
                        "authors": authors_str,
                        "journal": journal,
                        "publication_year": year or 2024,
                        "url": f"https://pubmed.ncbi.nlm.nih.gov/{pmid}/" if pmid else None,
                        "study_type": "Clinical Study"
                    })
                except Exception as ex:
                    logger.debug(f"Error parsing single pubmed article: {ex}")
                    continue
        except Exception as e:
            logger.warning(f"Error parsing PubMed XML: {e}")
            
        return papers

pubmed_service = PubMedService()
