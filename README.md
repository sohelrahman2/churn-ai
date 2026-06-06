# 🤖 ChurnIQ AI — Customer Analytics Assistant

> An AI-powered customer churn analytics platform built with **React**, **Claude AI (Anthropic)**, and a dataset of **6,418 telecom customers**.

![ChurnIQ AI Demo](https://img.shields.io/badge/AI-Claude%20Sonnet-6366f1?style=for-the-badge&logo=anthropic)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=vite)
![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python)

---

## 🚀 Project Overview

ChurnIQ AI is a **Generative AI project** that transforms raw customer data into conversational insights. Users can ask natural language questions and receive data-driven answers about:

- 📊 Churn patterns and root causes
- 🎯 High-risk customer segments
- 💡 Retention strategies
- 💰 Revenue impact analysis
- 🗺️ Geographic churn hotspots

---

## 🧠 Key Features

| Feature | Description |
|---|---|
| 💬 **AI Chat Interface** | Ask any question about customer data in plain English |
| 📊 **Insights Dashboard** | Visual breakdown of churn by contract, internet type, payment, state |
| 🤖 **Claude AI Backend** | Powered by Anthropic's Claude Sonnet — context-aware, data-grounded answers |
| 📈 **EDA Reports** | Pre-generated Excel + PDF reports with 10 visualizations |
| 🔄 **Live Excel Formulas** | 238 dynamic COUNTIF/AVERAGEIF formulas across 6 sheets |

---

## 📊 Dataset Highlights

- **6,418** customer records | **32 features**
- Overall churn rate: **27%** (1,732 customers)
- Total revenue: **$19.47M**
- Top churn driver: **Competitor offers** (44% of churns)
- Highest risk: **Month-to-Month contracts** (46.5% churn rate)

---

## 🗂️ Project Structure

```
churniq-ai/
├── 📁 src/
│   ├── App.jsx              # Main React app (AI chat + insights dashboard)
│   └── main.jsx             # Entry point
├── 📁 data/
│   └── stats.json           # Pre-computed dataset statistics
├── 📁 reports/
│   ├── Customer_EDA_Report.xlsx   # Excel report (238 live formulas)
│   └── Customer_EDA_Report.pdf    # PDF report (8 sections, 10 charts)
├── eda_analysis.py          # Full EDA pipeline (charts + Excel + PDF)
├── index.html               # App entry HTML
├── package.json             # Node dependencies
├── vite.config.js           # Vite configuration
└── README.md
```

---

## ⚙️ Setup & Run

### Prerequisites
- Node.js 18+
- An [Anthropic API key](https://console.anthropic.com/)

### 1. Clone the repo
```bash
git clone https://github.com/YOUR_USERNAME/churniq-ai.git
cd churniq-ai
```

### 2. Install dependencies
```bash
npm install
```

### 3. Add your API key

Create a `.env` file in the root:
```env
VITE_ANTHROPIC_API_KEY=sk-ant-your-key-here
```

> ⚠️ **Never commit your `.env` file.** It's already in `.gitignore`.

### 4. Run the app
```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) 🎉

---

## 🐍 Python EDA Pipeline

To regenerate charts, Excel, and PDF reports:

```bash
pip install pandas matplotlib seaborn openpyxl reportlab
python eda_analysis.py
```

This generates:
- 10 PNG chart visualizations
- `Customer_EDA_Report.xlsx` — 6 sheets with live formulas
- `Customer_EDA_Report.pdf` — 8-section professional report

---

## 🤖 How the AI Works

1. **Dataset statistics** are pre-computed and injected into the Claude system prompt
2. The AI has full context of: churn rates, top reasons, contract analysis, geographic breakdown, demographics
3. Every user question is answered with **specific numbers** grounded in real data
4. Conversation history is maintained for follow-up questions

---

## 📸 Screenshots

### Chat Interface
Ask natural language questions → get data-grounded AI answers

### Insights Dashboard
Visual breakdowns of churn across all key dimensions

---

## 🛠️ Tech Stack

- **Frontend:** React 18, Vite 5
- **AI:** Anthropic Claude Sonnet (`claude-sonnet-4-20250514`)
- **Data Analysis:** Python, Pandas, Matplotlib, Seaborn
- **Reports:** ReportLab (PDF), OpenPyXL (Excel)
- **Styling:** Pure CSS with CSS variables

---

## 📄 License

MIT License — free to use, modify, and distribute.

---

## 🙌 Acknowledgements

- Dataset: Telecom Customer Churn (India)
- AI: [Anthropic Claude](https://anthropic.com)
- Built as a Generative AI EDA project
