# AI Research Paper Reviewer

## Current State
New project — no existing code.

## Requested Changes (Diff)

### Add
- Home page explaining the platform's capabilities
- PDF upload page with drag-and-drop interface using blob-storage
- Analysis page showing real-time processing steps with progress indicators
- Results/Review page with full structured peer review report
- In-browser PDF text extraction using PDF.js
- AI analysis simulation engine that parses extracted text and generates:
  - Section detection (Title, Abstract, Introduction, Related Work, Methodology, Experiments, Results, Conclusion, References)
  - Six quality scores: Novelty, Methodology, Experiment Strength, Citation Quality, Reproducibility, Writing Clarity
  - Overall score aggregation
  - Claim vs Evidence detection (extract claims, evaluate evidence)
  - Weak section detection
  - Citation verification (flag outdated/irrelevant/missing refs)
  - Experiment quality analysis (dataset, baselines, metrics, ablation)
  - Reproducibility checklist (dataset access, params, architecture, code repo)
  - Strengths and weaknesses summary
  - Final recommendation (Accept / Weak Accept / Major Revision / Reject)
  - Research gap finder suggestions
  - AI acceptance predictor (probability %)
  - Paper structure visualization (Problem → Method → Experiment → Results flow)
- Radar/spider chart for score visualization
- Download review report as formatted HTML/PDF
- Motoko backend to store paper metadata and analysis results
- Authorization for user history tracking

### Modify
N/A — new project

### Remove
N/A — new project

## Implementation Plan
1. Select blob-storage and authorization components
2. Generate Motoko backend with paper storage, analysis result storage, and user history
3. Build frontend:
   - App shell with navigation (Home, Upload, History)
   - Home page: hero, feature cards, how-it-works section
   - Upload page: drag-and-drop PDF uploader, PDF.js text extraction, section parsing
   - Analysis page: step-by-step progress visualization while AI engine runs
   - Results page: score cards, radar chart, claims table, weak sections, recommendation badge, download button
   - History page: list of past analyses
4. Implement AI analysis engine (deterministic heuristic + text-based scoring)
5. Wire blob-storage for PDF file storage
6. Wire authorization for user sessions and history
