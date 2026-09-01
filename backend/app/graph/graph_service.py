import os
import uuid
import logging
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from app.models.entities import GraphNode, GraphEdge, ResearchProject

logger = logging.getLogger(__name__)

NEO4J_URI = os.getenv("NEO4J_URI")
NEO4J_USERNAME = os.getenv("NEO4J_USERNAME", "neo4j")
NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD")

class GraphService:
    def __init__(self):
        self.has_neo4j = bool(NEO4J_URI and NEO4J_PASSWORD)
        self.driver = None
        if self.has_neo4j:
            try:
                from neo4j import GraphDatabase
                self.driver = GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USERNAME, NEO4J_PASSWORD))
                logger.info("Connected to Neo4j database")
            except Exception as e:
                logger.warning(f"Neo4j connection failed, falling back to Relational Graph Engine: {e}")
                self.has_neo4j = False

    def is_neo4j_active(self) -> bool:
        return self.has_neo4j and self.driver is not None

    def get_project_graph(self, db: Session, project_id: str) -> Dict[str, Any]:
        """Return formatted nodes and edges for React Flow knowledge graph visualization."""
        nodes = db.query(GraphNode).filter(GraphNode.project_id == project_id).all()
        edges = db.query(GraphEdge).filter(GraphEdge.project_id == project_id).all()

        nodes_data = []
        for n in nodes:
            nodes_data.append({
                "id": n.id,
                "label": n.label,
                "type": n.entity_type,
                "category": n.category,
                "properties": n.properties or {}
            })

        edges_data = []
        for e in edges:
            edges_data.append({
                "id": e.id,
                "source": e.source_id,
                "target": e.target_id,
                "relationship": e.relationship,
                "label": e.label or e.relationship,
                "properties": e.properties or {}
            })

        return {
            "nodes": nodes_data,
            "edges": edges_data
        }

    def populate_graph_from_entities(
        self,
        db: Session,
        project_id: str,
        papers: List[Any],
        evidence_list: List[Any],
        contradictions: List[Any],
        gaps: List[Any],
        hypotheses: List[Any]
    ):
        """Construct knowledge graph nodes and edges from analyzed entities."""
        # Clear existing graph for this project
        db.query(GraphEdge).filter(GraphEdge.project_id == project_id).delete()
        db.query(GraphNode).filter(GraphNode.project_id == project_id).delete()

        proj = db.query(ResearchProject).filter(ResearchProject.id == project_id).first()
        disease_name = (proj.disease if proj and proj.disease else "Target Disease")
        project_title = (proj.title if proj and proj.title else "Research Project")

        created_nodes = {}
        created_edges = {}

        def add_node(node_id: str, entity_type: str, label: str, category: str = "", props: dict = None):
            if node_id not in created_nodes:
                node = GraphNode(
                    id=node_id,
                    project_id=project_id,
                    entity_type=entity_type,
                    label=label,
                    category=category,
                    properties=props or {}
                )
                db.add(node)
                created_nodes[node_id] = node

        def add_edge(edge_id: str, source: str, target: str, rel: str, label: str = "", props: dict = None):
            if edge_id not in created_edges:
                edge = GraphEdge(
                    id=edge_id,
                    project_id=project_id,
                    source_id=source,
                    target_id=target,
                    relationship=rel,
                    label=label or rel,
                    properties=props or {}
                )
                db.add(edge)
                created_edges[edge_id] = edge

        # 1. Disease Node
        disease_id = f"disease-{project_id}"
        add_node(disease_id, "Disease", disease_name, "Condition", {"project": project_title})

        # 2. Drug & Biomarker Nodes from Evidence
        for ev in evidence_list:
            drug_id = None
            if ev.intervention:
                drug_slug = "".join(c if c.isalnum() else "_" for c in ev.intervention.lower())[:30]
                drug_id = f"drug-{drug_slug}-{project_id}"
                add_node(drug_id, "Drug", ev.intervention, "Intervention")
                add_edge(f"edge-{drug_id}-{disease_id}-targets", drug_id, disease_id, "TARGETS", "targets")

            # Biomarker nodes
            if ev.biomarker and ev.biomarker != "Unstratified / Standard":
                for bm in [b.strip() for b in ev.biomarker.split(",") if b.strip()]:
                    bm_slug = "".join(c if c.isalnum() else "_" for c in bm.lower())[:30]
                    bm_id = f"bm-{bm_slug}-{project_id}"
                    add_node(bm_id, "Biomarker", bm, "Genomic/Molecular")
                    add_edge(f"edge-{bm_id}-{disease_id}-stratified", bm_id, disease_id, "STRATIFIED_BY", "stratified in")

            # Study node
            study_id = f"study-{ev.id}"
            result_color = "#15803D" if ev.result_type == "positive" else ("#B91C1C" if ev.result_type in ["negative", "null"] else "#B45309")
            add_node(study_id, "Study", ev.study_label, "Evidence", {
                "year": ev.year,
                "result_type": ev.result_type,
                "confidence": ev.confidence,
                "sample_size": ev.sample_size_display,
                "result_color": result_color
            })

            if drug_id:
                add_edge(f"edge-{study_id}-{drug_id}-tests", study_id, drug_id, "TESTS", "evaluated")

            if ev.biomarker and ev.biomarker != "Unstratified / Standard":
                first_bm = ev.biomarker.split(",")[0].strip()
                bm_slug = "".join(c if c.isalnum() else "_" for c in first_bm.lower())[:30]
                first_bm_id = f"bm-{bm_slug}-{project_id}"
                add_edge(f"edge-{study_id}-{first_bm_id}-includes", study_id, first_bm_id, "INCLUDES", "tested in")

        # 3. Contradiction Edges
        for c in contradictions:
            edge_id = f"contradict-{c.id}"
            add_edge(edge_id, f"study-{c.evidence_a_id}", f"study-{c.evidence_b_id}", "CONTRADICTS", "conflicts with", {
                "topic": c.topic,
                "explanation": c.possible_explanation
            })

        # 4. Gap Nodes & Edges
        for g in gaps:
            gap_id = f"gap-{g.id}"
            add_node(gap_id, "Gap", g.title, "Evidence Gap", {
                "coverage": g.evidence_coverage,
                "why": g.why_it_matters
            })
            add_edge(f"edge-{disease_id}-{gap_id}-gap", disease_id, gap_id, "IDENTIFIES_GAP", "has research gap")

        # 5. Hypothesis Nodes & Edges
        for h in hypotheses:
            hyp_id = f"hyp-{h.id}"
            add_node(hyp_id, "Hypothesis", (h.research_question[:45] + "...") if len(h.research_question) > 45 else h.research_question, "Research Direction", {
                "overall_score": h.overall_score,
                "tier": h.tier,
                "novelty": h.novelty_score,
                "gap_score": h.gap_score
            })

            # Link gap to hypothesis
            for g in gaps:
                gap_id = f"gap-{g.id}"
                add_edge(f"edge-{gap_id}-{hyp_id}-suggests", gap_id, hyp_id, "SUGGESTS", "leads to direction")

        db.commit()
        logger.info(f"Populated knowledge graph for project {project_id}: {len(created_nodes)} nodes, {len(created_edges)} edges.")

graph_service = GraphService()
