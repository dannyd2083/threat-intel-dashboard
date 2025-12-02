# 🛡️ Threat Intelligence Dashboard

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-15.0-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?style=for-the-badge&logo=typescript)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Latest-336791?style=for-the-badge&logo=postgresql)
![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o-412991?style=for-the-badge&logo=openai)

**AI-Powered Threat Intelligence Analysis & Query Platform**

[Features](#-features) • [Quick Start](#-quick-start) • [Architecture](#️-architecture) • [API Documentation](#-api-documentation) • [Data Sources](#-data-sources)

</div>

---

## 📖 Overview

Threat Intelligence Dashboard is a modern threat intelligence visualization and analysis platform that integrates CVE vulnerability data, phishing domain monitoring, and security community trending topics. Powered by RAG (Retrieval-Augmented Generation) technology, it provides intelligent threat intelligence Q&A services.

## ✨ Features

### 📊 Data Visualization Dashboard
- **CVE Vulnerability Trends** - Real-time visualization of CVE publication timeline
- **Phishing Domain Trends** - Monitor dynamic changes in phishing activities
- **Security Hot Topics Cloud** - Aggregated trending topics from Hacker News security community
- **Summary Statistics Cards** - Quick overview of key threat indicators

### 🤖 AI Intelligent Assistant
- **RAG Technology Support** - Intelligent Q&A based on real-time database retrieval
- **Multi-dimensional Analysis** - Supports statistical analysis, trend forecasting, and specific queries
- **Source Attribution** - Clear distinction between database facts and AI analysis
- **Contextual Conversations** - Continuous analysis with multi-turn dialogue support

### 🔍 Threat Data Management
- **CVE Vulnerability Database** - Includes severity levels, CVSS scores, affected vendors/products
- **Phishing Domain Database** - Records malicious domains, sources, status, target brands
- **Hacker News Trends** - Tracks security community discussion hotspots

## 🚀 Quick Start

### Prerequisites

- Node.js 18.0+
- PostgreSQL database (Docker recommended)
- OpenAI API Key

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd threat-intel-dashboard
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**

Create a `.env.local` file with the following variables:
```env
# PostgreSQL Database Configuration
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=threat_intelligence
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password

# OpenAI API Configuration
OPENAI_API_KEY=your_openai_api_key
```

4. **Start PostgreSQL (Docker method)**
```bash
docker run -d \
  --name postgres-threat-intel \
  -e POSTGRES_PASSWORD=your_password \
  -e POSTGRES_DB=threat_intelligence \
  -p 5432:5432 \
  postgres:latest
```

5. **Initialize the database**
```bash
# Linux/macOS
cat database/setup.sql | docker exec -i postgres-threat-intel psql -U postgres -d threat_intelligence

# Windows PowerShell
Get-Content database/setup.sql | docker exec -i postgres-threat-intel psql -U postgres -d threat_intelligence
```

6. **(Optional) Import sample data**
```bash
cat database/seed-data.sql | docker exec -i postgres-threat-intel psql -U postgres -d threat_intelligence
```

7. **Start the development server**
```bash
npm run dev
```

Visit http://localhost:3000 to view the application.

## 🏗️ Architecture

```
threat-intel-dashboard/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── chat/                 # AI Chat Endpoint
│   │   ├── cves/                 # CVE Data Endpoint
│   │   ├── phishing/             # Phishing Domain Endpoint
│   │   ├── stats/                # Statistics Endpoint
│   │   ├── threats/              # Threats Endpoint
│   │   └── trending/             # Trending Topics Endpoint
│   ├── globals.css               # Global Styles
│   ├── layout.tsx                # Root Layout
│   └── page.tsx                  # Home Page
├── components/                   # React Components
│   ├── chat-interface.tsx        # AI Chat Interface
│   ├── dashboard/                # Dashboard Components
│   │   ├── cards/                # Statistics Cards
│   │   ├── charts/               # Chart Components
│   │   ├── filters/              # Filter Components
│   │   └── sidebar.tsx           # Sidebar
│   ├── data-table/               # Data Table
│   └── ui/                       # UI Base Components
├── lib/                          # Utilities
│   ├── db.ts                     # Database Connection
│   ├── rag-service.ts            # RAG Retrieval Service
│   └── utils.ts                  # Utility Functions
├── database/                     # Database Scripts
│   ├── setup.sql                 # Table Creation Script
│   └── seed-data.sql             # Sample Data
├── workflow/                     # n8n Data Collection Workflows
│   ├── CVE Data Collection.json
│   ├── Hacker News Data Collection.json
│   └── Phishing Data Collection.json
└── types/                        # TypeScript Type Definitions
    └── threat.ts
```

## 📡 API Documentation

### CVE Vulnerability Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/cves` | GET | Get CVE list |
| `/api/cves/timeline` | GET | Get CVE timeline data |

### Phishing Domain Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/phishing` | GET | Get phishing domain list |
| `/api/phishing/timeline` | GET | Get phishing domain trends |

### Statistics & Trends Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/stats` | GET | Get comprehensive statistics |
| `/api/threats` | GET | Get threat overview |
| `/api/trending/hackernews` | GET | Get HN trending topics |

### AI Chat Endpoint

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/chat` | POST | AI intelligent Q&A |

**Request Example:**
```json
{
  "messages": [
    { "role": "user", "content": "What are the recent critical Microsoft vulnerabilities?" }
  ]
}
```

## 📊 Data Sources

### Database Schema

| Table | Description | Key Fields |
|-------|-------------|------------|
| `cves` | CVE Vulnerability Data | cve_id, severity, cvss_score, vendor, product |
| `phishing_domains` | Phishing Domains | domain, url, source, status, target |
| `hacker_news_trends` | HN Trends | title, url, points, num_comments |
| `data_refresh_log` | Data Refresh Logs | source, status, records_processed |

### Data Collection

The project includes n8n workflow configuration files for automated data collection:

- **CVE Data Collection** - Collects CVE data from sources like NVD
- **Phishing Data Collection** - Collects phishing domain data
- **Hacker News Data Collection** - Collects security-related HN trending topics

Import the JSON files from the `workflow/` directory into n8n to use them.

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| **Frontend Framework** | Next.js 15, React 18 |
| **Language** | TypeScript 5.6 |
| **Styling** | Tailwind CSS, shadcn/ui |
| **Charts** | Recharts |
| **Database** | PostgreSQL |
| **AI/LLM** | OpenAI GPT-4o, Vercel AI SDK |
| **Markdown** | react-markdown, remark-gfm |

## 🔧 Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run linting
npm run lint
```

## 📝 AI Assistant Usage Examples

Here are some example questions you can ask the AI assistant:

- "What are the recent critical CVE vulnerabilities?"
- "How many vulnerabilities are related to Microsoft?"
- "What is the severity distribution of vulnerabilities in the past 30 days?"
- "Which vendors have the most vulnerabilities?"
- "Are there any phishing domains targeting Google?"
- "What are the details of CVE-2024-XXXX?"

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**🛡️ Stay Secure, Stay Informed 🛡️**

</div>
