import csv
import os
from typing import Dict, Any, List

TOPIC_METADATA = [
    {
        "id": "topic-cancer-immunotherapy",
        "title": "Cancer Immunotherapy Resistance",
        "query": "Cancer immunotherapy resistance immune checkpoints mechanisms",
        "disease": "Solid Tumors & Metastatic Melanoma / NSCLC",
        "intervention": "Anti-PD-1/PD-L1, Anti-CTLA-4, LAG-3 Inhibitors",
        "biomarker": "PD-L1 Expression (TPS), Tumor Mutational Burden (TMB), MSI-H",
        "population": "Checkpoint-Refractory Advanced Solid Tumors",
        "study_type": "Phase II/III Clinical Trials & Translational Biomarker Cohorts",
        "aliases": [
            "cancer immunotherapy resistance",
            "immunotherapy resistance in cancer",
            "why does cancer immunotherapy stop working",
            "immune checkpoint inhibitor resistance",
            "pd-1 resistance",
            "pd-l1 resistance",
            "checkpoint blockade failure"
        ],
        "summary": "Analysis of checkpoint inhibitor resistance in solid tumors reveals intrinsic and adaptive immune evasion pathways. While high TMB and PD-L1 expression correlate with initial response, secondary loss of beta-2-microglobulin and JAK1/2 inactivating mutations drive tumor recurrence.",
        "contradiction": {
            "topic": "Dual Checkpoint Blockade vs Sequential Monotherapy",
            "summary": "Nivolumab plus Ipilimumab demonstrated superior overall response rates compared to monotherapy, but trials in TMB-low cohorts showed null survival gains with prohibitive Grade 3/4 immune-related adverse events (irAEs).",
            "population_diff": "TMB-High vs TMB-Low / Unselected Cohorts",
            "biomarker_diff": "PD-L1 TPS >= 50% vs TPS < 1%",
            "dosage_diff": "1mg/kg + 3mg/kg vs Sequential 3mg/kg single agent",
            "endpoint_diff": "Overall Survival (OS) vs Progression-Free Survival (PFS)",
            "possible_explanation": "Dual checkpoint blockade requires baseline CD8+ T-cell infiltration. Cold, non-inflamed tumors lack pre-existing antigen presentation, leading to systemic toxicity without cytotoxic tumor clearance."
        },
        "gap": {
            "title": "Predictive Biomarkers for Adaptive Resistance and Second-Line Rescue",
            "description": "Lack of standardized liquid biopsy panels to detect emergent HLA loss or immunosuppressive myeloid infiltration before radiographic progression.",
            "known": "Primary resistance correlates with low tumor mutational burden and absent PD-L1 expression.",
            "uncertain": "Optimal timing for switching to alternative targets (LAG-3, TIGIT) upon early ctDNA escalation.",
            "missing": "Prospective randomized trials evaluating salvage multi-target combinations in verified JAK1/2-mutant relapse.",
            "why": "Prevents continuation of ineffective, toxic checkpoint therapy and directs patients to targeted epigenetic or myeloid-depleting regimens.",
            "coverage": 24.0
        },
        "direction": {
            "question": "Can vertical co-targeting of myeloid-derived suppressor cells (MDSCs) overcome adaptive checkpoint resistance in JAK1/2-deficient solid tumors?",
            "rationale": "JAK1/2 mutations abrogate interferon-gamma receptor signaling, rendering tumor cells invisible to cytotoxic T lymphocytes. Targeting immunosuppressive myeloid stroma restores innate immune surveillance.",
            "novelty": 89.0,
            "gap": 92.0,
            "feasibility": 72.0,
            "impact": 84.0
        }
    },
    {
        "id": "topic-antibiotic-resistance",
        "title": "Antibiotic Resistance",
        "query": "Antimicrobial resistance mechanisms and novel modes of action",
        "disease": "Gram-Negative Multidrug-Resistant Bacterial Infections",
        "intervention": "Novel Siderophore Cephalosporins, Beta-Lactamase Inhibitors",
        "biomarker": "blaKPC, blaNDM, blaOXA-48, mcr-1 Colistin Resistance",
        "population": "Hospitalized Patients with Sepsis / Complicated Infections",
        "study_type": "Systematic Reviews, Pharmacodynamic Trials, Global Surveillance",
        "aliases": [
            "antibiotic resistance",
            "antimicrobial resistance",
            "bacterial drug resistance",
            "superbugs",
            "carbapenem resistance",
            "mrsa",
            "multidrug resistant bacteria"
        ],
        "summary": "Global surveillance shows rapid dissemination of metallo-beta-lactamases and plasmid-mediated colistin resistance. New beta-lactamase inhibitor combinations restore susceptibility in KPC producers but exhibit reduced activity against NDM-1 metallo-enzymes.",
        "contradiction": {
            "topic": "Ceftazidime-Avibactam vs Polymyxin Monotherapy in Carbapenem-Resistant Enterobacteriaceae",
            "summary": "Ceftazidime-avibactam significantly reduced 30-day all-cause mortality compared to colistin-based regimens in KPC-producing Klebsiella pneumoniae, but failed to demonstrate superiority in cohorts co-infected with NDM-1 producers.",
            "population_diff": "KPC Serine Beta-Lactamase vs NDM Metallo-Beta-Lactamase Strains",
            "biomarker_diff": "blaKPC-2/3 Positive vs blaNDM-1 Positive",
            "dosage_diff": "2.5g IV q8h vs Weight-adjusted Colistin dosing",
            "endpoint_diff": "30-Day Clinical Cure vs Microbiological Eradication",
            "possible_explanation": "Avibactam actively inhibits class A, C, and some class D beta-lactamases but has zero inhibitory binding against class B zinc-dependent metallo-beta-lactamases (NDM)."
        },
        "gap": {
            "title": "Oral Transition Options for Extensively Drug-Resistant Uropathogens",
            "description": "Zero FDA-approved oral agents exist for outpatient step-down therapy of carbapenem-resistant Enterobacteriaceae.",
            "known": "Intravenous combinations (Ceftazidime-avibactam, Meropenem-vaborbactam) achieve high cure rates.",
            "uncertain": "Long-term recurrence rates after short-course intravenous therapy without oral step-down.",
            "missing": "Phase 3 clinical trials evaluating novel oral carbapenemase inhibitors.",
            "why": "Forces prolonged inpatient hospitalization and central venous catheterization with high secondary bloodstream infection risks.",
            "coverage": 18.0
        },
        "direction": {
            "question": "Does adjunctive bacteriophage therapy synergize with sub-inhibitory beta-lactam concentrations to reverse metallo-beta-lactamase resistance?",
            "rationale": "Phage-mediated bacterial outer membrane porin selective pressure forces evolutionary trade-offs that restore antibiotic susceptibility.",
            "novelty": 91.0,
            "gap": 88.0,
            "feasibility": 64.0,
            "impact": 86.0
        }
    },
    {
        "id": "topic-alzheimers-biomarkers",
        "title": "Alzheimer's Disease Biomarkers",
        "query": "Blood-based biomarkers in Alzheimer's disease p-tau amyloid",
        "disease": "Mild Cognitive Impairment & Early Alzheimer's Disease",
        "intervention": "Anti-Amyloid Monoclonal Antibodies (Lecanemab, Donanemab)",
        "biomarker": "Plasma p-tau217, p-tau181, Aβ42/Aβ40 Ratio, NfL, GFAP",
        "population": "Prodromal and Preclinical Alzheimer's Cohorts",
        "study_type": "Prospective Longitudinal Biomarker Cohorts & PET Validation Trials",
        "aliases": [
            "alzheimer's disease biomarkers",
            "alzheimer biomarkers",
            "blood biomarkers for alzheimer's",
            "p-tau217",
            "amyloid beta biomarkers",
            "early detection of alzheimer's"
        ],
        "summary": "Blood-based plasma p-tau217 demonstrates >90% diagnostic accuracy matching CSF and amyloid-PET imaging. However, discrepancies occur in patients with chronic kidney disease where clearance alterations elevate baseline plasma levels.",
        "contradiction": {
            "topic": "Plasma p-tau217 Diagnostic Specificity Across Renal Function Stratifications",
            "summary": "Plasma p-tau217 accurately differentiated Alzheimer's from other tauopathies in primary memory clinics, but showed high false-positive rates in cohorts with estimated GFR < 45 mL/min.",
            "population_diff": "Normal Renal Function vs Moderate/Severe Chronic Kidney Disease",
            "biomarker_diff": "Plasma p-tau217 % vs Absolute p-tau217 concentration",
            "dosage_diff": "Observational Diagnostic Assay",
            "endpoint_diff": "PET Amyloid-Positivity Centiloid Correlation",
            "possible_explanation": "Impaired glomerular filtration reduces peripheral clearance of phosphorylated tau fragments, elevating plasma concentrations independent of cerebral amyloid deposition."
        },
        "gap": {
            "title": "Longitudinal Cutoff Thresholds for Preclinical Treatment Initiation",
            "description": "Standardized longitudinal plasma p-tau217 escalation rates that predict cognitive decline prior to amyloid-PET saturation remain undefined.",
            "known": "Baseline p-tau217 detects brain amyloidosis with high sensitivity.",
            "uncertain": "The exact rate of annual biomarker rise that dictates therapeutic intervention window.",
            "missing": "Multi-ethnic community cohorts tracking plasma biomarkers over 10+ years.",
            "why": "Enables non-invasive population screening and timely initiation of disease-modifying therapies before irreversible synaptic loss.",
            "coverage": 32.0
        },
        "direction": {
            "question": "Can combined plasma p-tau217 and glial fibrillary acidic protein (GFAP) kinetics establish an algorithmic threshold for initiating anti-amyloid therapy in asymptomatic APOE ε4 carriers?",
            "rationale": "GFAP reflects reactive astrogliosis that peaks concurrently with early amyloid seeding, providing a dual-axis metric of molecular pathology and neuroinflammation.",
            "novelty": 86.0,
            "gap": 89.0,
            "feasibility": 78.0,
            "impact": 90.0
        }
    },
    {
        "id": "topic-drug-repurposing",
        "title": "Drug Repurposing for Cancer",
        "query": "Drug repurposing in oncology randomized clinical trials",
        "disease": "Refractory Glioblastoma, Pancreatic & Colorectal Cancers",
        "intervention": "Metformin, Disulfiram-Copper, Itraconazole, Statins",
        "biomarker": "LKB1/AMPK Activation, ALDH1A1 Expression, Hedgehog Pathway",
        "population": "Advanced / Pretreated Solid Tumor Patients",
        "study_type": "Phase II Randomized Controlled Trials & Real-World Observational Studies",
        "aliases": [
            "drug repurposing for cancer",
            "repurposed drugs in oncology",
            "non-oncology drugs for cancer",
            "metformin cancer",
            "disulfiram oncology"
        ],
        "summary": "Preclinical models demonstrate potent anti-neoplastic activity for metabolic and antifungal agents. However, phase 3 randomized trials have shown mixed results, primarily due to inability to achieve intratumoral therapeutic concentrations at standard non-oncology doses.",
        "contradiction": {
            "topic": "Metformin Adjuvant Efficacy in Non-Diabetic Breast Cancer",
            "summary": "Observational epidemiological studies reported a 30% reduction in cancer mortality among diabetic metformin users, but the randomized NCIC CTG MA.32 phase 3 trial in 3,649 non-diabetic women showed null disease-free survival benefit.",
            "population_diff": "Diabetic Hyperinsulinemic Patients vs Non-Diabetic Normoinsulinemic Cohort",
            "biomarker_diff": "Elevated HOMA-IR / High Insulin vs Normal Fasting Insulin",
            "dosage_diff": "Metformin 850mg BID vs Placebo",
            "endpoint_diff": "Invasive Disease-Free Survival (IDFS)",
            "possible_explanation": "Metformin's anti-tumor mechanism is primarily indirect via reduction of systemic circulating insulin and IGF-1 mitogenic signaling. In non-diabetic normoinsulinemic patients, direct cell-autonomous AMPK activation requires supra-physiological concentrations unachievable in vivo."
        },
        "gap": {
            "title": "Pharmacokinetic Formulation Optimization for Repurposed Compounds",
            "description": "Standard oral formulations of repurposed agents fail to achieve therapeutic steady-state concentrations in dense, desmoplastic tumor microenvironments.",
            "known": "Repurposed compounds exhibit targeted pathway inhibition in vitro.",
            "uncertain": "Whether nanoparticle encapsulation or local delivery can overcome dose-limiting systemic toxicity.",
            "missing": "Bioequivalence and intratumoral microdialysis pharmacodynamic studies in human tumor biopsies.",
            "why": "Unlocks low-cost, globally accessible therapeutic candidates with established safety profiles.",
            "coverage": 22.0
        },
        "direction": {
            "question": "Does tumor-targeted lipid nanoparticle formulation of Disulfiram-Copper achieve selective ALDH1+ cancer stem cell ablation in gemcitabine-resistant pancreatic ductal adenocarcinoma?",
            "rationale": "Targeted delivery bypasses rapid hepatic first-pass metabolism and copper chelation degradation, delivering cytotoxic reactive oxygen species directly to stem cell niches.",
            "novelty": 85.0,
            "gap": 86.0,
            "feasibility": 74.0,
            "impact": 82.0
        }
    },
    {
        "id": "topic-crispr-gene-therapy",
        "title": "CRISPR Gene Therapy",
        "query": "Therapeutic applications of CRISPR Cas9 genome editing",
        "disease": "Sickle Cell Disease, Beta-Thalassemia & Transthyretin Amyloidosis",
        "intervention": "Exagamglogene autotemcel (Exa-cel), In Vivo LNP-Cas9",
        "biomarker": "BCL11A Erythroid Enhancer, TTR Gene Knockout",
        "population": "Patients with Severe Hemoglobinopathies or Hereditary Amyloidosis",
        "study_type": "Phase I/II/III First-in-Human Clinical Trials",
        "aliases": [
            "crispr gene therapy",
            "crispr genome editing",
            "gene editing treatment",
            "cas9 therapy",
            "in vivo crispr"
        ],
        "summary": "Ex vivo editing of the BCL11A enhancer produces durable fetal hemoglobin induction and eliminates vaso-occlusive crises in sickle cell disease. In vivo lipid nanoparticle delivery demonstrates >85% serum TTR reduction with low off-target cleavage.",
        "contradiction": {
            "topic": "Pre-existing Anti-Cas9 Humoral and Cellular Immunity Impact on In Vivo Editing",
            "summary": "In vitro assays demonstrated high prevalence of neutralizing antibodies against S. pyogenes Cas9 in healthy adults, yet in vivo clinical trials of LNP-formulated Cas9 mRNA showed potent target knockout with zero neutralizing antibody interference.",
            "population_diff": "In Vitro Recombinant Cas9 Exposure vs In Vivo Transient LNP-mRNA Translation",
            "biomarker_diff": "Serum IgG Titers vs Intracellular Hepatocyte Cleavage Efficiency",
            "dosage_diff": "Single-Dose 0.3mg/kg LNP vs Exogenous Protein Challenge",
            "endpoint_diff": "Serum TTR Protein Reduction vs Anti-Cas9 T-Cell Proliferation",
            "possible_explanation": "LNP packaging delivers mRNA directly to the intracellular hepatocyte cytoplasm where translation and Cas9 degradation occur within 24 hours, evading pre-existing circulating serum antibodies."
        },
        "gap": {
            "title": "Non-Viral In Vivo Delivery to Non-Hepatic Tissues",
            "description": "Systemic in vivo CRISPR delivery remains heavily restricted to the liver due to natural apolipoprotein E (ApoE) uptake.",
            "known": "Intravenous LNPs achieve high editing efficacy in hepatocytes.",
            "uncertain": "Cell-type specific targeting ligands for lung, muscle, and central nervous system tissue.",
            "missing": "Clinical-grade targeted lipid nanoparticles for pulmonary and cardiac genetic disorders.",
            "why": "Expands CRISPR gene therapies beyond hemoglobinopathies and liver disorders to cystic fibrosis and muscular dystrophies.",
            "coverage": 28.0
        },
        "direction": {
            "question": "Can antibody-conjugated lipid nanoparticles deliver base-editing mRNA specifically to hematopoietic stem cells in vivo, eliminating the need for toxic myeloablative busulfan conditioning?",
            "rationale": "Direct in vivo targeting of CD117+ stem cells removes the life-threatening risks of bone marrow ablation and prolonged neutropenia.",
            "novelty": 94.0,
            "gap": 93.0,
            "feasibility": 62.0,
            "impact": 95.0
        }
    },
    {
        "id": "topic-tb-drug-resistance",
        "title": "Tuberculosis Drug Resistance",
        "query": "Mycobacterium tuberculosis drug resistance molecular determinants",
        "disease": "Multidrug-Resistant (MDR) and Extensively Drug-Resistant (XDR) Tuberculosis",
        "intervention": "BPaL Regimen (Bedaquiline, Pretomanid, Linezolid)",
        "biomarker": "katG, rpoB, gyrA, rrs, Rv0678 Mutations",
        "population": "Patients with Rifampicin-Resistant Pulmonary TB",
        "study_type": "Nix-TB, ZeNix Randomized Phase III Trials & Global Genomic Cohorts",
        "aliases": [
            "tuberculosis drug resistance",
            "drug resistant tb",
            "drug resistant tuberculosis",
            "mdr-tb",
            "xdr-tb",
            "bedaquiline resistance",
            "tuberculosis resistance"
        ],
        "summary": "The 6-month all-oral BPaL regimen achieved ~90% treatment success in MDR/XDR-TB. However, emergent mutations in Rv0678 causing bedaquiline/clofazimine cross-resistance threaten global treatment gains.",
        "contradiction": {
            "topic": "Linezolid Dosing Optimization: 1200mg vs 600mg in BPaL Regimen",
            "summary": "Initial Nix-TB trial with 1200mg daily linezolid showed high efficacy (90%) but caused 81% peripheral neuropathy and myelosuppression. The ZeNix trial showed 600mg linezolid maintained equivalent efficacy (89%) with dramatically lower toxicity (24%).",
            "population_diff": "High Baseline Cavitary Disease vs Standard MDR-TB",
            "biomarker_diff": "Rv0678 Wild-Type vs Rv0678 Mutant Strains",
            "dosage_diff": "Linezolid 1200mg 26w vs 600mg 26w",
            "endpoint_diff": "Relapse-Free Cure at 24 Months vs Adverse Event Discontinuation",
            "possible_explanation": "Bedaquiline and Pretomanid provide potent bactericidal activity that allows reduced Linezolid exposure while remaining well above the bacterial MIC, avoiding mitochondrial protein synthesis inhibition in host tissues."
        },
        "gap": {
            "title": "Rapid Molecular Diagnostics for Non-Canonical Bedaquiline Resistance Mutations",
            "description": "Standard GeneXpert platforms only detect rifampicin and isoniazid resistance, missing emergent bedaquiline-resistant Rv0678 variants.",
            "known": "Rv0678 transcriptional repressor mutations cause MmpL5 efflux pump upregulation.",
            "uncertain": "The phenotypic resistance contribution of novel uncharacterized Rv0678 single-nucleotide polymorphisms.",
            "missing": "Point-of-care rapid cartridge assays for bedaquiline, delamanid, and linezolid resistance.",
            "why": "Prevents inadvertent functional monotherapy and rapid failure of novel 6-month MDR-TB regimens.",
            "coverage": 20.0
        },
        "direction": {
            "question": "Does the addition of an MmpL5 efflux pump inhibitor reverse bedaquiline cross-resistance in Rv0678-mutant Mycobacterium tuberculosis isolates?",
            "rationale": "Pharmacological inhibition of the efflux transporter restores intracellular bedaquiline accumulation to levels sufficient for ATP synthase inhibition.",
            "novelty": 90.0,
            "gap": 91.0,
            "feasibility": 70.0,
            "impact": 88.0
        }
    },
    {
        "id": "topic-cart-cell-therapy",
        "title": "CAR-T Cell Therapy",
        "query": "CAR-T cell therapy in cancer immunotherapy clinical development",
        "disease": "Relapsed/Refractory B-Cell Malignancies & Multiple Myeloma",
        "intervention": "Axicabtagene ciloleucel, Tisagenlecleucel, Idecabtagene vicleucel",
        "biomarker": "CD19 Antigen Density, BCMA Expression, T-Cell Exhaustion (PD-1, TIM-3)",
        "population": "Patients Progressing After Multiple Prior Lines of Chemotherapy",
        "study_type": "Pivotal Phase II/III Trials & Real-World Registry Outcomes",
        "aliases": [
            "car-t cell therapy",
            "car t treatment",
            "car t cell",
            "cart therapy",
            "chimeric antigen receptor"
        ],
        "summary": "Anti-CD19 and anti-BCMA CAR-T therapies induce remarkable initial complete responses in 70-85% of pretreated lymphoma and myeloma patients. However, 50% of responders experience disease relapse within 1-2 years due to target antigen loss or CAR-T cell exhaustion.",
        "contradiction": {
            "topic": "Dual CD19/CD20 Bi-Specific CAR-T vs Sequential Monospecific Infusion",
            "summary": "Bivalent CD19/CD20 CAR-T constructs reduced antigen-loss relapse rates in DLBCL, but phase 1 data in follicular lymphoma showed no significant progression-free survival difference over standard CD19 CAR-T.",
            "population_diff": "High-Grade Diffuse Large B-Cell Lymphoma vs Indolent Follicular Lymphoma",
            "biomarker_diff": "Heterogeneous CD19 Low Subclones vs Homogeneous CD19 High Target",
            "dosage_diff": "Single Bi-Specific Vector vs Sequential Product",
            "endpoint_diff": "24-Month Event-Free Survival",
            "possible_explanation": "Aggressive DLBCL exhibits high genetic instability and rapid CD19 splicing mutations under selective pressure, whereas indolent lymphomas retain uniform antigen expression and fail primarily through T-cell exhaustion."
        },
        "gap": {
            "title": "Overcoming Immunosuppressive Microenvironments in Solid Tumor CAR-T",
            "description": "Systemic intravenous CAR-T cells fail to penetrate dense stroma and undergo rapid functional exhaustion in solid tumors.",
            "known": "CAR-T cells exhibit high cytotoxicity against circulating and nodal hematological malignancies.",
            "uncertain": "Efficacy of armor constructs secreting IL-7/CCL19 or dominant-negative TGF-beta receptors in human solid tumors.",
            "missing": "Phase 2 randomized trials evaluating armored CAR-T in glioblastoma and pancreatic adenocarcinoma.",
            "why": "Unlocks cell therapy for the 90% of cancer mortalities caused by solid organ malignancies.",
            "coverage": 22.0
        },
        "direction": {
            "question": "Can logic-gated synthetic Notch CAR-T cells with localized TGF-beta trap secretion maintain persistence and eliminate antigen-loss relapse in glioblastoma?",
            "rationale": "Combinatorial dual-antigen recognition prevents off-target healthy tissue toxicity while localized TGF-beta neutralization neutralizes the primary immunosuppressive cytokine.",
            "novelty": 93.0,
            "gap": 94.0,
            "feasibility": 66.0,
            "impact": 92.0
        }
    },
    {
        "id": "topic-diabetes-treatment",
        "title": "Diabetes Treatment Response",
        "query": "Type 2 diabetes treatment response patient heterogeneity GLP-1",
        "disease": "Type 2 Diabetes Mellitus & Metabolic Syndrome",
        "intervention": "GLP-1 Receptor Agonists (Semaglutide, Tirzepatide), SGLT2 Inhibitors",
        "biomarker": "Baseline C-peptide, HOMA-B, HOMA-IR, GCK/TCF7L2 Genotypes",
        "population": "Adults with Inadequately Controlled Type 2 Diabetes",
        "study_type": "SURPASS, STEP, SUSTAIN Randomized Clinical Trials",
        "aliases": [
            "diabetes treatment response",
            "diabetes treatment",
            "glp-1 response",
            "semaglutide diabetes",
            "type 2 diabetes heterogeneity"
        ],
        "summary": "Dual GIP/GLP-1 receptor agonists deliver unprecedented glycemic reduction (HbA1c -2.5%) and weight loss. However, marked inter-individual variation occurs, with poor responders characterized by severe residual beta-cell exhaustion and specific TCF7L2 risk alleles.",
        "contradiction": {
            "topic": "GLP-1 RA Glycemic Durability Across Patient Subgroups with Low Baseline C-Peptide",
            "summary": "Semaglutide demonstrated consistent HbA1c reductions across broad BMI categories in SUSTAIN trials, but subgroup analysis in longstanding diabetes (>15 yrs) with fasting C-peptide < 0.3 nmol/L showed early glycemic failure at 12 months.",
            "population_diff": "Recent-Onset Type 2 Diabetes vs Severe Insulin-Deficient Diabetes (SIDD Subgroup)",
            "biomarker_diff": "Preserved C-Peptide (>0.6 nmol/L) vs Depleted C-Peptide (<0.3 nmol/L)",
            "dosage_diff": "Semaglutide 1.0mg weekly vs Tirzepatide 15mg weekly",
            "endpoint_diff": "Sustained HbA1c < 7.0% at 2 Years",
            "possible_explanation": "GLP-1 receptor agonists stimulate glucose-dependent insulin secretion from pancreatic beta cells. In patients with severe beta-cell mass depletion, incretin receptor activation cannot compensate for absent cellular insulin reserve."
        },
        "gap": {
            "title": "Genotype-Guided Algorithms for First-Line Incretin Therapy",
            "description": "Standard clinical guidelines use trial-and-error sequencing rather than baseline biomarker stratification.",
            "known": "Patient subgroups (Severe Insulin-Resistant vs Severe Insulin-Deficient) exhibit distinct pathophysiology.",
            "uncertain": "Cost-effectiveness of routine polygenic risk scoring prior to initiating second-line therapy.",
            "missing": "Prospective randomized trials comparing biomarker-guided therapy vs standard guideline step-therapy.",
            "why": "Prevents years of therapeutic failure and early microvascular diabetic complications.",
            "coverage": 30.0
        },
        "direction": {
            "question": "Does baseline stratification by fasting C-peptide and HOMA2-B identify patient cohorts requiring immediate combination SGLT2i + GIP/GLP-1 therapy to prevent accelerated glycemic decompensation?",
            "rationale": "Early dual-mechanism treatment protects residual beta cells from glucotoxicity while addressing peripheral insulin resistance.",
            "novelty": 82.0,
            "gap": 85.0,
            "feasibility": 84.0,
            "impact": 88.0
        }
    },
    {
        "id": "topic-personalized-cancer",
        "title": "Personalized Cancer Treatment",
        "query": "Personalized cancer treatment next-generation sequencing NGS molecular profiling",
        "disease": "Metastatic Colorectal, Ovarian & Lung Cancers",
        "intervention": "Comprehensive Genomic Profiling (CGP) & Matched Molecular Targeted Therapies",
        "biomarker": "KRAS, BRAF V600E, BRCA1/2, HER2, NTRK Fusions, TMB",
        "population": "Patients with Treatment-Refractory Advanced Solid Tumors",
        "study_type": "Basket Trials (MATCH, TAPUR, SHIVA) & Prospective Molecular Tumor Board Cohorts",
        "aliases": [
            "personalized cancer treatment",
            "precision oncology",
            "targeted cancer therapy",
            "ngs cancer profiling",
            "molecular tumor board"
        ],
        "summary": "Next-generation sequencing identifies actionable genomic alterations in ~40% of patients. However, matched targeted therapies yield clinical benefit in only 15-20% of cases due to co-occurring bypass mutations and tissue-specific signaling architecture.",
        "contradiction": {
            "topic": "BRAF V600E Monotherapy in Melanoma vs Colorectal Cancer",
            "summary": "Vemurafenib/Dabrafenib monotherapy produces >50% objective response rates in BRAF V600E melanoma, but produced a dismal ~5% response rate in BRAF V600E metastatic colorectal cancer.",
            "population_diff": "Cutaneous Melanoma vs Colorectal Adenocarcinoma",
            "biomarker_diff": "BRAF V600E with Low EGFR vs BRAF V600E with High EGFR Rebound Feedback",
            "dosage_diff": "Standard Monotherapy Dosing",
            "endpoint_diff": "Objective Response Rate (ORR)",
            "possible_explanation": "Colorectal tumors express high baseline EGFR. Inhibition of BRAF causes rapid loss of negative feedback on EGFR, resulting in immediate reactivation of the MAPK pathway through CRAF and EGFR dimerization."
        },
        "gap": {
            "title": "Real-Time Tracking of Subclonal Clonal Evolution via Serial ctDNA",
            "description": "Static baseline tissue biopsies fail to capture spatial and temporal genomic heterogeneity as therapy selective pressure evolves.",
            "known": "ctDNA detects emergent resistance mutations months before radiographic progression.",
            "uncertain": "Whether preemptive therapy switching based on low-frequency ctDNA clones improves overall survival.",
            "missing": "Phase 3 randomized trials testing intervention on molecular-only progression vs radiographic progression.",
            "why": "Shifts oncology from reactive treatment of bulky resistant disease to proactive interception.",
            "coverage": 26.0
        },
        "direction": {
            "question": "Can serial ultra-deep ctDNA sequencing guide adaptive 'pulse' treatment schedules to prevent fixed clone resistance in KRAS G12C and EGFR-mutant solid tumors?",
            "rationale": "Intermittent therapy withdrawal allows drug-sensitive parental clones to outcompete resistant clones, preserving long-term therapeutic sensitivity.",
            "novelty": 90.0,
            "gap": 89.0,
            "feasibility": 76.0,
            "impact": 91.0
        }
    },
    {
        "id": "topic-vaccine-effectiveness",
        "title": "Vaccine Effectiveness",
        "query": "Vaccine effectiveness tracking and systematic review meta-analysis",
        "disease": "Respiratory Viral Infections (SARS-CoV-2, Influenza, RSV)",
        "intervention": "mRNA Vaccines, Recombinant Protein Vaccines, Adjuvanted Subunit Vaccines",
        "biomarker": "Serum Neutralizing Antibody Titers, Spike-Specific Memory B Cells, T-Cell IFN-gamma",
        "population": "Immunocompromised Hosts, Elderly & General Populations",
        "study_type": "Test-Negative Case-Control Studies & Longitudinal Immune Correlate Cohorts",
        "aliases": [
            "vaccine effectiveness",
            "vaccine efficacy",
            "vaccine durability",
            "mrna vaccine effectiveness",
            "immune waning"
        ],
        "summary": "mRNA vaccines provide robust initial protection (>90%) against severe disease. Neutralizing antibody titers wane over 4-6 months, but memory B-cell and CD8+ T-cell responses provide durable long-term protection against hospitalization and death.",
        "contradiction": {
            "topic": "Booster Dose Durability Against Symptomatic Infection Across Emerging Immune-Evasive Variants",
            "summary": "Updated bivalent/monovalent boosters restored high neutralization against contemporaneous variants, but protection against mild symptomatic infection dropped to baseline within 12-16 weeks while protection against hospitalization remained >75%.",
            "population_diff": "General Population vs Severely Immunocompromised (Solid Organ Transplant)",
            "biomarker_diff": "Upper Airway Mucosal IgA vs Systemic Neutralizing IgG / CD8+ T Cells",
            "dosage_diff": "Single Booster vs Repeated Dosing",
            "endpoint_diff": "Symptomatic Mild Infection vs Severe Disease / Mechanical Ventilation",
            "possible_explanation": "Systemic intramuscular vaccination generates robust serum IgG that protects the highly vascularized lower respiratory tract and lungs, but produces transient mucosal secretory IgA in the nasal epithelium."
        },
        "gap": {
            "title": "Mucosal Intranasal Vaccines to Block Upper Airway Viral Transmission",
            "description": "Current intramuscular vaccines reduce disease severity but fail to prevent asymptomatic transmission and nasal viral shedding.",
            "known": "Intramuscular immunization induces systemic IgG and memory T cells.",
            "uncertain": "Formulation stability and durability of mucosal IgA induction in human nasal mucosa.",
            "missing": "Phase 3 clinical trials evaluating prime-pull intranasal booster platforms.",
            "why": "Essential to achieve sterilizing herd immunity and break community transmission cycles during respiratory pandemics.",
            "coverage": 25.0
        },
        "direction": {
            "question": "Does a mucosal nanoparticle booster delivering conserved mosaic antigens induce long-lived resident memory T cells (T_RM) and secretory IgA capable of cross-variant sterilizing immunity?",
            "rationale": "Airway resident memory cells provide immediate barrier defense at the site of viral entry, preventing cellular establishment.",
            "novelty": 88.0,
            "gap": 89.0,
            "feasibility": 74.0,
            "impact": 94.0
        }
    },
    {
        "id": "topic-parkinsons-treatment",
        "title": "Parkinson's Disease Treatment",
        "query": "Parkinson's disease treatment modalities disease modifying therapies",
        "disease": "Idiopathic Parkinson's Disease",
        "intervention": "Levodopa/Carbidopa, Dopamine Agonists, MAO-B/COMT Inhibitors, GLP-1 Agonists",
        "biomarker": "MDS-UPDRS Motor Score, DAT-SPECT Imaging, Alpha-Synuclein SAA",
        "population": "Early to Advanced Parkinson's Disease Patients",
        "study_type": "Double-Blind Placebo-Controlled Disease-Modification Trials",
        "aliases": [
            "parkinson's disease treatment",
            "parkinson's treatment",
            "parkinson disease therapies",
            "levodopa motor fluctuations",
            "disease modifying therapies in parkinson"
        ],
        "summary": "Dopaminergic replacement therapies provide powerful symptomatic relief but do not arrest progressive dopaminergic neurodegeneration in the substantia nigra. Repurposed GLP-1 receptor agonists (Exenatide, Lixisenatide) show promising neuroprotective signals in early clinical trials.",
        "contradiction": {
            "topic": "GLP-1 Receptor Agonist Neuroprotection in Parkinson's: Exenatide vs Lixisenatide",
            "summary": "Exenatide phase 2 trial demonstrated a 3.5-point motor score advantage over placebo sustained after 12-week washout. However, the LixiPark trial showed modest motor stabilization during treatment with no persistent benefit following therapy discontinuation.",
            "population_diff": "Moderate Baseline Disability vs Early Disease (<3 years duration)",
            "biomarker_diff": "Alpha-Synuclein SAA Positive vs Negative",
            "dosage_diff": "Exenatide 2mg weekly vs Lixisenatide 20ug daily",
            "endpoint_diff": "Off-State MDS-UPDRS Part III Motor Score",
            "possible_explanation": "Exenatide exhibits higher blood-brain barrier permeability and sustained GLP-1 receptor target engagement in microglial cells, providing durable attenuation of neuroinflammation compared to shorter-acting analogues."
        },
        "gap": {
            "title": "Validated In Vivo Biomarkers of Alpha-Synuclein Clearance in Clinical Trials",
            "description": "Lack of quantitative PET tracers for imaging alpha-synuclein aggregate burden in living human brains.",
            "known": "Seed amplification assays (SAA) detect misfolded alpha-synuclein in CSF.",
            "uncertain": "Correlation between therapeutic reductions in soluble aggregates and clinical motor score stabilization.",
            "missing": "High-affinity selective alpha-synuclein PET radiotracers for longitudinal treatment monitoring.",
            "why": "Essential to evaluate target engagement and accelerate clinical trials of disease-modifying therapies.",
            "coverage": 20.0
        },
        "direction": {
            "question": "Can dual GLP-1/GIP co-agonists engineered for enhanced blood-brain barrier penetration attenuate alpha-synuclein seeding and mitochondrial dysfunction in GBA1-mutant Parkinson's disease?",
            "rationale": "GBA1 mutations exacerbate lysosomal failure and neuroinflammation, two core pathways reversed by incretin neurotrophic signaling.",
            "novelty": 91.0,
            "gap": 90.0,
            "feasibility": 72.0,
            "impact": 92.0
        }
    },
    {
        "id": "topic-heart-failure",
        "title": "Heart Failure Treatment",
        "query": "Heart failure with reduced ejection fraction guideline directed medical therapy",
        "disease": "Heart Failure with Reduced (HFrEF) & Preserved Ejection Fraction (HFpEF)",
        "intervention": "Quadruple Therapy (ARNI, SGLT2i, Beta-Blocker, MRA)",
        "biomarker": "NT-proBNP, LVEF, eGFR, Serum Potassium, Troponin T",
        "population": "NYHA Class II-IV Heart Failure Patients",
        "study_type": "DAPA-HF, EMPEROR-Reduced, PARADIGM-HF, DELIVER Trials",
        "aliases": [
            "heart failure treatment",
            "heart failure management",
            "hfref treatment",
            "hfpef treatment",
            "guideline-directed medical therapy heart failure"
        ],
        "summary": "Quadruple guideline-directed medical therapy reduces all-cause and cardiovascular mortality by >60% in HFrEF. SGLT2 inhibitors demonstrate broad clinical benefit across both reduced and preserved ejection fraction phenotypes.",
        "contradiction": {
            "topic": "Sacubitril-Valsartan (ARNI) Efficacy in HFpEF Across Gender and LVEF Spectrums",
            "summary": "The PARAGON-HF trial narrowly missed statistical significance in the overall HFpEF cohort (P=0.059), but prespecified subgroup analysis showed profound 27% risk reduction in women and patients with ejection fractions <= 57%.",
            "population_diff": "Overall HFpEF (LVEF >= 45%) vs Subgroup with Mid-Range / Mildly Reduced LVEF (45-57%) and Women",
            "biomarker_diff": "NT-proBNP Elevation > 900 pg/mL vs Mild Elevation",
            "dosage_diff": "Sacubitril-Valsartan 97/103mg BID vs Valsartan 160mg BID",
            "endpoint_diff": "Composite Total Hospitalizations for Heart Failure and Death from CV Causes",
            "possible_explanation": "Women exhibit higher prevalence of microvascular endothelial inflammation and smaller left ventricular end-diastolic dimensions, making their myocardium uniquely responsive to neprilysin-mediated cyclic GMP augmentation."
        },
        "gap": {
            "title": "Implementation and Rapid Up-Titration in Real-World Clinical Practice",
            "description": "Less than 25% of eligible heart failure patients receive guideline-recommended target doses of all 4 foundational drug classes.",
            "known": "Rapid simultaneous initiation within 6 weeks saves lives and prevents early re-hospitalizations.",
            "uncertain": "Whether nurse-led remote digital monitoring protocols achieve higher target dosing without hyperkalemia.",
            "missing": "Systematic health-system randomized trials testing automated electronic health record clinical decision support.",
            "why": "Eliminates clinical inertia and closes the deadly gap between landmark clinical trials and real-world bedside execution.",
            "coverage": 34.0
        },
        "direction": {
            "question": "Does rapid simultaneous 4-drug initiation at low doses within 24 hours of acute heart failure hospitalization reduce 90-day readmissions compared to conventional stepped up-titration?",
            "rationale": "Early multimodal neurohormonal blockade rapidly reduces ventricular wall stress and promotes reverse cardiac remodeling.",
            "novelty": 84.0,
            "gap": 86.0,
            "feasibility": 86.0,
            "impact": 93.0
        }
    },
    {
        "id": "topic-breast-cancer-biomarkers",
        "title": "Breast Cancer Biomarkers",
        "query": "Breast cancer biomarkers risk assessment prediction treatment efficacy",
        "disease": "Early and Metastatic Breast Carcinoma",
        "intervention": "Antibody-Drug Conjugates (Trastuzumab deruxtecan), CDK4/6 Inhibitors, PARP Inhibitors",
        "biomarker": "HER2-Low (IHC 1+ or 2+/ISH-), ER/PR, PIK3CA, ESR1, BRCA1/2, ctDNA",
        "population": "Patients with Hormone Receptor-Positive or HER2-Expressing Breast Tumors",
        "study_type": "DESTINY-Breast04, monarchE, OlympiA Phase III Trials",
        "aliases": [
            "breast cancer biomarkers",
            "her2 low breast cancer",
            "breast cancer prediction",
            "brca breast cancer",
            "breast cancer risk assessment"
        ],
        "summary": "Identification of HER2-low status redefined metastatic breast cancer treatment, establishing Trastuzumab deruxtecan as a potent new standard. Serial ctDNA monitoring detects ESR1 resistance mutations in hormone receptor-positive disease up to 6 months prior to clinical progression.",
        "contradiction": {
            "topic": "HER2-Low Status Stability Across Primary and Metastatic Biopsies",
            "summary": "DESTINY-Breast04 established profound survival benefit of T-DXd in HER2-low metastatic disease, but longitudinal biopsy studies reveal that over 38% of tumors switch between HER2-0 and HER2-low across disease progression.",
            "population_diff": "Primary Surgical Specimen vs Recurrent Metastatic Biopsy",
            "biomarker_diff": "IHC 1+ vs IHC 0 (Zero Staining)",
            "dosage_diff": "T-DXd 5.4 mg/kg q3w",
            "endpoint_diff": "Progression-Free Survival and Biomarker Concordance",
            "possible_explanation": "HER2 expression is biologically dynamic and influenced by intratumoral heterogeneity and prior endocrine therapies. Standard immunohistochemistry lacks quantitative sensitivity at low receptor thresholds."
        },
        "gap": {
            "title": "Quantitative Proteomic and RNA Assays for Low-Level HER2 Expression",
            "description": "Standard subjective IHC pathology scoring fails to reliably distinguish IHC 0 from IHC 1+, misclassifying patients who could benefit from antibody-drug conjugates.",
            "known": "Even minimal HER2 expression enables bystander cytotoxic payload delivery.",
            "uncertain": "The exact minimum receptor density required for therapeutic antibody-drug conjugate internalization.",
            "missing": "Automated quantitative digital spatial proteomics assays validated in multi-center clinical trials.",
            "why": "Prevents denying life-extending antibody-drug conjugate therapies to patients misclassified as HER2-zero.",
            "coverage": 26.0
        },
        "direction": {
            "question": "Can real-time liquid biopsy quantification of circulating tumor cell HER2 mRNA detect dynamic transition to HER2-low status and guide timely initiation of antibody-drug conjugate therapy?",
            "rationale": "Liquid biopsy overcomes spatial biopsy sampling error in heterogeneous metastatic disease.",
            "novelty": 89.0,
            "gap": 88.0,
            "feasibility": 78.0,
            "impact": 91.0
        }
    },
    {
        "id": "topic-nanoparticle-delivery",
        "title": "Nanoparticle Drug Delivery",
        "query": "Nanoparticle based drug delivery systems current advances tumors",
        "disease": "Solid Tumors, Glioblastoma & Metastatic Cancers",
        "intervention": "Lipid Nanoparticles (LNPs), Polymeric Nanocarriers, Albumin-Bound Nanoparticles",
        "biomarker": "EPR Effect, Transferrin Receptor (TfR), Tumor Endothelial Glycocalyx",
        "population": "Patients with Difficult-to-Treat Solid Organ and Brain Tumors",
        "study_type": "Translational Pharmacokinetic & Phase I/II Clinical Trials",
        "aliases": [
            "nanoparticle drug delivery",
            "nanoparticle drug delivery systems",
            "nanomedicine in oncology",
            "lipid nanoparticles delivery",
            "targeted nanoparticle cancer"
        ],
        "summary": "Nanocarriers significantly enhance drug solubility, prolong plasma half-life, and reduce off-target toxicities (e.g. nab-paclitaxel). However, reliance on the enhanced permeability and retention (EPR) effect has shown inconsistent translation in dense human stroma.",
        "contradiction": {
            "topic": "Enhanced Permeability and Retention (EPR) Translation: Rodent Models vs Human Tumors",
            "summary": "Passive nanoparticle accumulation reaches up to 10% of injected dose in rapid-growth rodent xenografts, but human tumor microdialysis studies demonstrate median tumor accumulation of less than 1% of administered dose.",
            "population_diff": "Murine Flank Xenografts vs Spontaneous Human Desmoplastic Tumors",
            "biomarker_diff": "Hyper-Permeable Discontinuous Endothelium vs High Interstitial Fluid Pressure and Dense Collagen Stroma",
            "dosage_diff": "Systemic Intravenous Infusion",
            "endpoint_diff": "Intratumoral Drug Concentration vs Tumor Volume Regression",
            "possible_explanation": "Human tumors develop over years with dense fibrotic stroma and elevated interstitial fluid pressure that counteracts passive capillary extravasation."
        },
        "gap": {
            "title": "Active Receptor-Mediated Transcytosis Across the Blood-Brain Barrier",
            "description": "Passive nanocarriers cannot cross the intact blood-brain barrier to treat diffuse infiltrative glioblastoma.",
            "known": "Conjugation to transferrin or LRP1 ligands promotes endothelial receptor binding.",
            "uncertain": "The optimal ligand density that permits endosomal release rather than lysosomal degradation.",
            "missing": "Phase 2 clinical trials evaluating actively transcytosing nanocarriers with validated intracranial pharmacokinetic endpoints.",
            "why": "Enables curative chemotherapeutic and gene therapy delivery for lethal brain malignancies.",
            "coverage": 22.0
        },
        "direction": {
            "question": "Does ultrasound-mediated microbubble cavitation combined with transferrin-functionalized lipid nanoparticles achieve therapeutic therapeutic small RNA delivery across the blood-brain barrier in recurrent glioblastoma?",
            "rationale": "Focused ultrasound transiently opens endothelial tight junctions, creating an anatomical window for actively targeted nanomedicines.",
            "novelty": 92.0,
            "gap": 91.0,
            "feasibility": 68.0,
            "impact": 94.0
        }
    },
    {
        "id": "topic-autoimmune-treatment",
        "title": "Autoimmune Disease Treatment",
        "query": "Autoimmune diseases molecular pathogenesis therapeutic targets biologic therapies",
        "disease": "Rheumatoid Arthritis, Systemic Lupus Erythematosus, Inflammatory Bowel Disease",
        "intervention": "JAK Inhibitors, Anti-TNF Biologics, Anti-IL-23/IL-17, Anti-CD20 (Rituximab)",
        "biomarker": "Anti-dsDNA, ANA, RF, Anti-CCP, Serum Cytokine Signatures (IFN-alpha, IL-6)",
        "population": "Refractory Autoimmune Patients Inadequately Responsive to Standard DMARDs",
        "study_type": "ORAL Surveillance, SELECT, ADVANCE Randomized Phase III Trials",
        "aliases": [
            "autoimmune disease treatment",
            "autoimmune disease therapies",
            "targeted immunotherapy for autoimmune disease",
            "jak inhibitors autoimmune",
            "biologics in rheumatoid arthritis"
        ],
        "summary": "Targeted biologics and JAK inhibitors achieve remission in 50-60% of refractory autoimmune patients. Safety surveillance trials identified risk signals for major adverse cardiovascular events (MACE) and venous thromboembolism with pan-JAK inhibitors in elderly cohorts.",
        "contradiction": {
            "topic": "JAK Inhibitor Cardiovascular and Thromboembolic Risk Profile: ORAL Surveillance vs Post-Hoc Real-World Registries",
            "summary": "The ORAL Surveillance randomized safety trial in rheumatoid arthritis patients aged >=50 with >=1 CV risk factor found tofacitinib associated with higher risk of MACE and malignancies compared to TNF inhibitors (HR 1.33). Subsequent real-world registry cohorts in younger patients with low CV baseline risk showed no significant difference in MACE rates.",
            "population_diff": "Elderly Patients (>=50) with Cardiovascular Comorbidities vs Younger Low-Risk Autoimmune Cohorts",
            "biomarker_diff": "Elevated Baseline hs-CRP and Thrombocytosis vs Controlled Baseline Inflammation",
            "dosage_diff": "Tofacitinib 5mg/10mg BID vs TNF Inhibitors (Adalimumab/Etanercept)",
            "endpoint_diff": "Major Adverse Cardiovascular Events (MACE) and Venous Thromboembolism (VTE)",
            "possible_explanation": "JAK-mediated inhibition of STAT signaling alters platelet turnover and lipid metabolism. In patients with pre-existing endothelial atherosclerosis, this shifts the hemostatic balance toward thrombosis, whereas young uncompromised vasculature tolerates pathway modulation."
        },
        "gap": {
            "title": "Predictive Multi-Omic Cytokine Signatures for First-Line Biologic Selection",
            "description": "Clinical practice relies on empirical trial-and-error cycling between TNF, IL-6, IL-17, and JAK inhibitors.",
            "known": "Patients exhibit heterogeneous pathogenic cytokine drivers (TNF-dominant vs Type I IFN-dominant).",
            "uncertain": "The clinical accuracy of synovial transcriptomic classification in predicting therapeutic non-response.",
            "missing": "Prospective randomized trials comparing multi-omic biomarker-directed biologic selection against standard sequential cycling.",
            "why": "Eliminates months of debilitating joint destruction and chronic organ damage caused by ineffective biologic trials.",
            "coverage": 28.0
        },
        "direction": {
            "question": "Does single-cell synovial biopsy transcriptomic mapping of dominant pathogenic cytokine pathways (TNF vs JAK/STAT vs IL-17) prior to biologic initiation double 6-month clinical remission rates compared to standard empirical prescribing?",
            "rationale": "Matching the specific upregulated cellular pathway directly to its targeted inhibitor eliminates non-response from targeting secondary bystanders.",
            "novelty": 90.0,
            "gap": 89.0,
            "feasibility": 78.0,
            "impact": 92.0
        }
    }
]

def load_verified_paper_seeds() -> List[Dict[str, str]]:
    """Read the verified CSV seeds file."""
    csv_path = os.path.join(os.path.dirname(__file__), "researchloop_verified_paper_seeds.csv")
    papers = []
    if os.path.exists(csv_path):
        with open(csv_path, mode="r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                papers.append({
                    "topic": row.get("topic", "").strip(),
                    "title": row.get("title", "").strip(),
                    "pmid": row.get("pmid", "").strip(),
                    "doi": row.get("doi", "").strip(),
                    "pubmed_url": row.get("pubmed_url", "").strip(),
                })
    return papers
