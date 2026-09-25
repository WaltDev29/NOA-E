# 🚀 NOA-E (Node Oriented Agent - Education)

> **React Flow** 기반의 직관적인 노드 캔버스와 **FastAPI + LangGraph** 엔진을 통해 복잡한 AI Agent 워크플로우를 시각적으로 설계하고 실시간으로 실행하는 교육·실습 플랫폼입니다.

---

## 📌 프로젝트 소개 (Overview)

**NOA-E**는 사용자가 복잡한 코드를 작성하지 않고도 드래그 앤 드롭 방식으로 AI Agent의 작동 흐름(Input, LLM, Tool, Output)을 구성하고, LangGraph를 통해 컴파일하여 즉시 테스트할 수 있는 웹 기반 AI Agent 교육 플랫폼입니다.

- **비주얼 노드 에디터**: 캔버스 위에 Input, LLM, Tool, Output 노드를 배치하고 직관적으로 연결하여 에이전트를 빌드합니다.
- **LangGraph 기반 실행 엔진**: 프론트엔드에서 설계한 워크플로우 JSON을 검증 후 LangGraph의 `StateGraph` 구조로 변환하여 실행합니다.
- **실시간 스트리밍 모니터링**: Server-Sent Events (SSE)를 통해 노드 실행 상태, 토큰 생성 과정, 실행 로그를 실시간으로 시각화합니다.
- **하이브리드 LLM 지원**: 로컬 환경을 위한 Ollama(Gemma2 등) 및 클라우드 OpenAI 모델을 지원합니다.

---

## 🛠 기술 스택 (Tech Stack)

### Frontend
- **Framework**: React 19, Vite, TypeScript
- **Visual Editor**: `@xyflow/react` (React Flow)
- **State Management**: Zustand
- **Styling & UI**: TailwindCSS v4, Lucide React, Framer Motion, Axios

### Backend & Engine
- **Framework**: Python 3.11+, FastAPI, Uvicorn
- **Agent Orchestration**: LangGraph, LangChain (`langchain-openai`)
- **Schema & Validation**: Pydantic
- **Database & ORM**: PostgreSQL 15, SQLAlchemy, psycopg2

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
│   │   │   └── router/          # API 엔드포인트 (/api/workflow)
│   │   ├── Dockerfile
│   │   ├── main.py              # Backend 진입점
│   │   └── requirements.txt
│   ├── frontend/                # React Flow 기반 웹 클라이언트
│   │   ├── src/
│   │   │   ├── components/      # Visual Editor, Palette, Execution View
│   │   │   ├── store/           # Workflow 상태 저장소 (Zustand)
│   │   │   └── App.tsx
│   │   ├── Dockerfile
│   │   └── package.json
│   └── nginx/                   # 프록시 라우팅 설정
├── Implementation Plan.md       # MVP 구현 계획서
├── WORKFLOW_SCHEMA.md           # Workflow JSON Schema 정의서
├── .gitignore                   # Git 제외 설정
└── README.md                    # 프로젝트 가이드
```

---

## ⚡ 빠른 시작 (Quick Start)

### 1. Docker Compose로 전체 시스템 실행 (권장)

Docker 및 Docker Compose가 설치되어 있다면 단일 명령어로 모든 NOA-E 컨테이너를 기동할 수 있습니다.

```bash
# 1. 저장소 클론 및 디렉토리 이동
git clone <repository-url>
cd n8n

# 2. Docker Compose 실행
docker compose -f docker/compose/docker-compose.yml up --build -d
```

#### 🐳 실행되는 컨테이너 목록
| 서비스명 | 컨테이너 이름 | 포트 매핑 | 설명 |
| :--- | :--- | :--- | :--- |
| **Nginx** | `noa-e-nginx` | `80:80` | 리버스 프록시 및 라우팅 |
| **Frontend** | `noa-e-frontend` | `3000:3000` | 웹 에디터 UI ([http://localhost:3000](http://localhost:3000)) |
| **Backend** | `noa-e-backend` | `8000:8000` | FastAPI & LangGraph 엔진 ([Swagger Docs](http://localhost:8000/docs)) |
| **Database** | `noa-e-db` | `5432:5432` | PostgreSQL 15 데이터베이스 |
| **Ollama** | `noa-e-ollama` | `11434:11434` | 로컬 LLM 런타임 |
| **Ollama Init** | `noa-e-ollama-init` | - | 기본 모델 (`gemma2:2b`) 자동 풀링 |

---

### 2. 로컬 개발 환경 직접 실행 (Local Development)

#### Backend 실행 (Python 3.11+)

```bash
cd services/backend

# 가상환경 생성 및 활성화
python -m venv .venv
# Windows:
.venv\Scripts\activate
# macOS/Linux:
# source .venv/bin/activate

# 의존성 설치
pip install -r requirements.txt

# 서버 실행 (개발 모드)
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

#### Frontend 실행 (Node.js 18+)

```bash
cd services/frontend

# 패키지 설치
npm install

# 개발 서버 실행
npm run dev
```

브라우저에서 [http://localhost:5173](http://localhost:5173) (Vite 기본 포트)으로 접속합니다.

---

## 🔑 환경 변수 설정 (Environment Variables)

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

## 📖 핵심 기능 및 워크플로우 구성

1. **노드 배치**:
   - `Input`: 사용자 질문/입력 파라미터 정의
   - `LLM`: 프롬프트 템플릿, 모델(OpenAI / Ollama), Temperature 설정
   - `Tool`: 계산기(Calculator), 웹 검색, 커스텀 Python 함수 등 연동
   - `Output`: 최종 생성 결과 출력 및 렌더링
2. **엣지 연결**: 노드의 핸들을 드래그하여 입력과 출력을 연결합니다.
3. **실행 및 스트리밍 확인**:
   - `Run` 버튼을 누르면 워크플로우가 검증되고 서버의 LangGraph 엔진으로 전달됩니다.
   - 우측/하단 모니터링 패널에서 실시간 스트리밍 로그와 최종 응답을 확인합니다.

> 상세한 노드 규격 및 JSON 데이터 포맷은 [WORKFLOW_SCHEMA.md](file:///d:/project/n8n/WORKFLOW_SCHEMA.md)를 참조하세요.

---

## 📜 라이선스 (License)

This project is licensed under the MIT License.
