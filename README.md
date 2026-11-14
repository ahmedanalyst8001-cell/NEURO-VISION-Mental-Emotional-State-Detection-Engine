# 🧠 NEURO-VISION
### Mental & Emotional State Detection Engine

**An experimental computer vision platform for real-time analysis and visualization of model-generated mental and emotional state estimates.**

---

## 🚀 1. Project Overview

**Neuro-Vision Mental & Emotional State Detection Engine** is an experimental computer vision application that connects a webcam feed to a locally hosted AI analysis backend.

The system processes incoming video frames through a computer vision model and visualizes the model-generated estimates through an interactive monitoring dashboard.

Its primary objective is to provide a structured environment for experimenting with visual data, monitoring model outputs, and evaluating prediction patterns.

### 🎯 Core Objectives

- 📷 Real-time webcam integration.
- 🤖 Computer vision model integration.
- 📊 Live visualization of model-generated estimates.
- 🔌 WebSocket-based frontend/backend communication.
- 📈 Experimental session monitoring.
- 📁 Historical data collection and CSV export.
- 🔬 Support for preliminary model evaluation.

> **Important:** Neuro-Vision is an experimental software system. Its outputs are model-generated estimates, not clinically validated measurements or definitive evidence of a person's mental or emotional state.

---

## ⚡ 2. Core Features

| Feature | Description |
|---|---|
| 📷 Live Camera | Captures video through the user's webcam |
| 🔌 Backend Connection | Communicates with the analysis server through WebSockets |
| 🧠 Model Outputs | Displays stress, valence, engagement, and anxiety estimates returned by the backend |
| 📊 Live Visualization | Presents incoming model outputs through real-time charts |
| ⏺️ Session Recording | Records model outputs during experimental sessions |
| 📈 Session Analytics | Calculates average values from collected samples |
| 📥 Data Export | Exports recorded telemetry as CSV |
| 🟢 Connection Monitoring | Displays camera and backend connection status |

### 📊 Dashboard Metrics

The interface currently supports four backend-reported estimates:

**1. Stress Estimate**

Displays the model's estimated stress-related score.

**2. Valence Estimate**

Displays the model's estimated valence-related score.

**3. Engagement Estimate**

Displays the model's estimated engagement-related score.

**4. Anxiety Estimate**

Displays the model's estimated anxiety-related score.

Values are displayed on a 0–100 scale when supplied in that format by the backend. Their meaning and reliability depend on the underlying model, its training data, and its validation.

---

## 🛠️ 3. Technology Stack

### 💻 Frontend Technologies

- ⚛️ React
- 📘 TypeScript
- 🎨 Tailwind CSS
- 📊 Recharts
- 🧩 Lucide React
- 🖼️ HTML5 Canvas
- 🔗 WebSocket API
- 📷 Browser MediaDevices API

### ⚙️ Backend Integration

- 🐍 Python-compatible analysis backend
- 🔌 WebSocket communication
- 👁️ Computer vision model integration
- 🤖 Model inference and output transmission

*The frontend does not independently perform facial emotion recognition or validate the backend's predictions.*

---

## 🏗️ 4. System Architecture

```text
🧠 NEURO-VISION
│
├── 💻 FRONTEND
│   ├── Webcam Interface
│   ├── Live Monitoring Dashboard
│   ├── Model Output Visualization
│   ├── Session Recorder
│   ├── Analytics
│   └── CSV Export
│
└── ⚙️ BACKEND
    ├── WebSocket Server
    ├── Frame Reception
    ├── Computer Vision Model
    ├── Model Inference
    └── Output Transmission
```

### 🔄 Processing Workflow

```text
📷 Webcam
    |
    v
🖼️ Video Frame Capture
    |
    v
🔌 WebSocket Transmission
    |
    v
⚙️ Backend Processing
    |
    v
👁️ Computer Vision Model
    |
    v
🤖 Model Output Generation
    |
    v
📊 Frontend Dashboard
    |
    v
📈 Visualization & Session Recording
    |
    v
📁 CSV Export
```

---

## 📦 5. Installation & Setup

### Prerequisites

Install the following before running the project:

- Node.js
- npm
- Python (for the backend)
- A working webcam
- A compatible computer vision analysis backend

### Step 1 — Install Frontend Dependencies

Open a terminal inside the project directory:

```bash
npm install
```

### Step 2 — Configure Backend Connection

The frontend uses the following default WebSocket endpoint:

```text
ws://localhost:8000/ws/analyze
```

Ensure that your backend is running and exposes the corresponding WebSocket route.

If your backend uses a different address, update the WebSocket configuration in the frontend.

### Step 3 — Start the Backend

Start your computer vision backend using its configured Python environment and startup command.

For example, if the backend uses FastAPI with Uvicorn:

```bash
uvicorn main:app --host 0.0.0.0 --port 8000
```

*The actual command depends on your backend implementation.*

### Step 4 — Start the Frontend

```bash
npm run dev
```

Open the local development URL displayed in your terminal.

### Step 5 — Grant Camera Permission

Allow browser access to your webcam when prompted.

Once the camera and backend connections are established, the dashboard can begin displaying incoming model outputs.

---

## 🔌 6. Backend Communication

The frontend communicates with the backend through a WebSocket connection.

### Expected Message Structure

A successful backend response should follow this general structure:

```json
{
  "status": "success",
  "scores": {
    "stress": 42,
    "valence": 68,
    "engagement": 75,
    "anxiety": 31
  },
  "feedback": "Example model feedback"
}
```

<text id="nv-note" color="secondary" size="xs">The numbers above are illustrative examples, not actual experimental findings.</text>

### Communication Requirements

The backend should:

1. 📥 Accept incoming webcam frames.
2. 🖼️ Decode and process the received image data.
3. 🤖 Execute the configured computer vision model.
4. 📊 Return the supported score fields.
5. 💬 Optionally return feedback associated with the model output.

The frontend visualizes the received data. It does not guarantee that the model's predictions are accurate.

---

## 📈 7. Session Recording & Data Export

Neuro-Vision includes session-level data collection.

During a recording session, the application stores incoming model outputs and can calculate:

- ⏱️ Session duration.
- 🔢 Number of received samples.
- 📊 Average stress estimate.
- 📊 Average valence estimate.
- 📊 Average engagement estimate.
- 📊 Average anxiety estimate.

### 📁 Data Export

Recorded telemetry can be exported into CSV format for further analysis using:

- Microsoft Excel
- Python
- Pandas
- Power BI

### 🔬 Potential Experimental Applications

Exported data can support:

- Model-output inspection.
- Session-to-session comparisons.
- Visualization of prediction trends.
- Preliminary model evaluation.
- Identification of inconsistent or unstable outputs.

These applications require appropriate experimental design and validation before drawing scientific conclusions.

---

## ⚠️ 8. Technical Limitations

A webcam-based computer vision model cannot reliably establish a person's internal emotional, psychological, or physiological condition from facial appearance alone.

Model outputs may be affected by:

- 💡 Lighting conditions.
- 📷 Camera quality.
- 😷 Facial occlusion.
- ↔️ Head orientation.
- 🖼️ Image resolution.
- 📚 Dataset limitations.
- 🌍 Demographic representation.
- 🧠 Model architecture and training quality.
- 🧪 Differences between experimental and real-world environments.

### Important Considerations

- Model estimates must not be treated as clinical measurements.
- The dashboard must not be used for medical diagnosis.
- A high or low score does not establish a person's actual psychological condition.
- Model accuracy must be independently evaluated against appropriate reference data.

---

## 🔭 9. Future Development Roadmap

The following improvements could strengthen the project's technical and experimental foundation.

| Development Area | Proposed Improvement |
|---|---|
| 🤖 Model Evaluation | Precision, recall, F1-score and confusion matrix |
| 🧪 Validation | Testing against appropriately labelled datasets |
| ⚡ Performance | Frame-processing latency and inference time |
| 🔌 Reliability | WebSocket reconnection and error handling |
| 🗂️ Data Management | Structured experiment metadata |
| 📊 Analytics | Session comparisons and prediction distributions |
| 🔁 Reproducibility | Model version and configuration tracking |
| 🔐 Privacy | Local processing and controlled data retention |

*These are proposed development areas, not features claimed to be implemented.*

---

## 📌 10. Project Information

| Attribute | Details |
|---|---|
| Project Name | Neuro-Vision |
| Full Name | Neuro-Vision Mental & Emotional State Detection Engine |
| Project Classification | Experimental Computer Vision Software |
| Primary Objective | Real-time monitoring and visualization of model-generated mental and emotional state estimates |
| Frontend | React + TypeScript |
| Backend | Separately hosted analysis server |
| Communication | WebSocket |
| Current Scope | Webcam integration, backend communication, model-output visualization, session recording and CSV export |
| Validation Status | Dependent on the underlying model and its independently documented evaluation |

---

## 🔐 11. Responsible Use & Privacy

Neuro-Vision is intended for software development, computer vision experimentation, and model-output visualization.

It should not be used as a standalone system for:

- Psychological diagnosis.
- Medical assessment.
- Employee or student psychological profiling.
- High-stakes decisions about individuals.
- Definitive claims about a person's mental state without independent validation.

Camera data should be processed and retained only with appropriate user consent and privacy safeguards.

---

## 📄 12. License

Add the project's chosen open-source or proprietary license before public distribution.

---


# 🧠 NEURO-VISION

### Mental & Emotional State Detection Engine

**Observe. Analyze. Evaluate. Validate.**

*Turning computer vision model outputs into structured, interpretable experimental insights.*

