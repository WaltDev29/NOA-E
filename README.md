# 🚀 NOA-E (Node Oriented Agent - Education)

<img width="2170" height="725" alt="logo_with_bg" src="https://github.com/user-attachments/assets/2237d965-94e4-4cb6-b6f1-ce27b105c69a" />

> NOA-E는 **React Flow** 기반의 직관적인 시각적 노드 에디터와 **FastAPI + LangGraph** 엔진, 그리고 독립형 데스크톱 실행기를 통해 AI Agent를 학습하고 설계하여 로컬 환경에서 직접 실행하는 교육·실습 플랫폼입니다.

---

## 📌 프로젝트 소개 (Overview)

**NOA-E**는 코딩에 익숙하지 않은 초보 학습자도 시각적으로 AI Agent의 구조와 작동 원리를 이해하고 직접 설계할 수 있는 교육 플랫폼입니다.

- 📚 **체계적인 이론 학습 (Learn)**: LLM, 프롬프트 엔지니어링, AI Agent 아키텍처(ReAct 루프), 도구 및 함수 호출, RAG, MCP(Model Context Protocol), AI 안전/윤리 등 기초부터 실전 개념까지 직관적으로 학습합니다.
- 🎨 **비주얼 노드 스튜디오 (Studio)**: 캔버스 위에 Input, LLM, Tool, Output 노드를 배치하고 연결하여 워크플로우를 구성합니다.
  - 온보딩 가이드 및 노드별 실시간 툴팁/상세 설명 제공
  - 노드별 세부 파라미터(System Prompt, Temperature, Model 등) 실시간 편집
- ⚡ **실시간 시뮬레이션 및 SSE 스트리밍**: SSE를 통해 노드 실행 상태, 토큰 생성 과정, ReAct 사고 로그를 실시간으로 모니터링합니다.
- 📦 **독립형 로컬 런타임 실행기**: 웹에서 설계한 에이전트를 `JSON`으로 내려받아, 별도 개발 환경 없이 독립형 데스크톱 실행기(`.exe` / PySide6 GUI)에서 즉시 구동하고 활용합니다.
- 🌐 **하이브리드 LLM 지원**: 로컬 환경을 위한 Ollama 및 상용 OpenAI 모델을 유연하게 연동합니다.

---

## 🛠 기술 스택 (Tech Stack)

### Web Frontend
- **Framework**: React 19, Vite, TypeScript
- **Visual Editor**: `@xyflow/react` (React Flow)
- **State Management**: Zustand
- **Styling & UI**: TailwindCSS v4, Lucide React, Material Symbols, Framer Motion, Axios

### Server & Engine
- **Framework**: Python 3.11+, FastAPI, Uvicorn
- **Agent Orchestration**: LangGraph, LangChain (`langchain-openai`)
- **Schema & Validation**: Pydantic
- **Database & ORM**: PostgreSQL 15, SQLAlchemy, psycopg2

### Local Native Runtime
- **Desktop GUI**: PySide6, QThread 비동기 워커
- **Execution Engine**: LangGraph Standalone Engine
- **Packaging**: PyInstaller (.exe 단일 실행 파일 빌드)

### Infrastructure & DevOps
- **Containerization**: Docker, Docker Compose
- **Reverse Proxy**: Nginx
- **Local LLM Runner**: Ollama (`gemma2:2b`)

---

## 📂 프로젝트 구조 (Directory Structure)

```text
n8n/
├── docker/
│   ├── compose/
│   │   └── docker-compose.yml   # NOA-E Docker Compose 오케스트레이션 정의
│   └── env/
│       ├── .env.backend         # Backend 환경 변수
│       ├── .env.frontend        # Frontend 환경 변수
│       └── .env.db              # PostgreSQL DB 환경 변수
├── services/
│   ├── backend/                 # FastAPI 백엔드 & LangGraph 엔진
│   │   ├── app/
│   │   │   ├── core/engine/     # Workflow Compiler & Node 실행 로직
│   │   │   ├── router/          # API 엔드포인트 (/api/workflow)
│   │   │   └── services/        # LLM 서비스 레이어
│   │   ├── Dockerfile
│   │   ├── main.py              # Backend 진입점
│   │   └── requirements.txt
│   ├── frontend/                # React Flow 기반 웹 클라이언트
│   │   ├── src/
│   │   │   ├── components/      # Canvas, NodePalette, PropertyPanel, Modals
│   │   │   ├── pages/           # MainPage, LearnPage, StudioPage, TemplatesPage
│   │   │   ├── store/           # Zustand 워크플로우 상태 저장소
│   │   │   └── App.tsx
│   │   ├── Dockerfile
│   │   └── package.json
│   └── nginx/                   # 프록시 라우팅 설정
├── runtime/                     # 데스크톱 네이티브 런타임 실행기
│   ├── core/engine/             # 독립형 LangGraph 실행 엔진
│   ├── agent_runner.py          # GUI/CLI 진입점
│   ├── gui.py                   # PySide6 네이티브 데스크톱 GUI
│   ├── config.py                # LLM 엔드포인트 및 모델 설정
│   ├── build_exe.py             # PyInstaller exe 빌드 스크립트
│   └── requirements.txt
├── WORKFLOW_SCHEMA.md           # Workflow JSON Schema 정의서
├── .gitignore                   # Git 제외 설정
└── README.md                    # 프로젝트 가이드
```

---

## ⚡ 빠른 시작 (Quick Start)

### 1. 환경 변수 설정 (Environment Variables)

`docker/env/` 디렉토리의 설정 파일에서 데이터베이스 및 LLM 설정을 관리합니다.

- **`docker/env/.env.backend`**
  ```env
  DATABASE_URL=postgresql://postgres:postgres@db:5432/agent_db
  USE_OPENAI=false
  LLM_MODEL=gemma2:2b
  LLM_BASE_URL=http://ollama:11434/v1
  LLM_API_KEY=ollama
  ```

- **`docker/env/.env.frontend`**
  ```env
  VITE_API_BASE_URL=http://localhost:8000
  ```

- **`docker/env/.env.db`**
  ```env
  POSTGRES_USER=postgres
  POSTGRES_PASSWORD=postgres
  POSTGRES_DB=agent_db
  ```

---

### 2. Docker Compose로 웹 플랫폼 전체 실행 (권장)

Docker 및 Docker Compose가 설치되어 있다면 단일 명령어로 전체 서비스를 기동할 수 있습니다.

```bash
# 1. 저장소 디렉토리 이동
cd n8n

# 2. Docker Compose 실행
docker compose -f docker/compose/docker-compose.yml up --build -d
```

#### 🐳 실행되는 컨테이너 목록
| 서비스명 | 컨테이너 이름 | 포트 매핑 | 설명 |
| :--- | :--- | :--- | :--- |
| **Nginx** | `noa-e-nginx` | `80:80` | 리버스 프록시 및 통합 라우팅 |
| **Frontend** | `noa-e-frontend` | `3000:3000` | 웹 플랫폼 UI ([http://localhost:3000](http://localhost:3000)) |
| **Backend** | `noa-e-backend` | `8000:8000` | FastAPI & LangGraph 엔진 ([Swagger Docs](http://localhost:8000/docs)) |
| **Database** | `noa-e-db` | `5432:5432` | PostgreSQL 15 데이터베이스 |
| **Ollama** | `noa-e-ollama` | `11434:11434` | 로컬 LLM 런타임 |
| **Ollama Init** | `noa-e-ollama-init` | - | 기본 모델 (`gemma2:2b`) 자동 풀링 |

---

### 3. 데스크톱 에이전트 런타임 실행기 (Desktop Runtime)

웹 스튜디오에서 제작한 에이전트(`workflow.json`)를 로컬 PC에서 단독 실행합니다.

```bash
cd runtime
pip install -r requirements.txt

# 1. PySide6 데스크톱 GUI 실행
python agent_runner.py
# (또는 python gui.py)

# 2. CLI 인터랙티브 대화 모드 실행
python agent_runner.py --workflow sample_agent.json --cli

# 3. 단일 실행 파일(.exe) 빌드
python build_exe.py
```
> 빌드가 완료되면 `runtime/dist/NOA-E_Agent_Runtime/` 디렉토리에 실행 파일이 생성됩니다.

---

## 📜 라이선스 (License)

This project is licensed under the MIT License.
