# 🚀 NOA-E (Node Oriented Agent - Education)

<img width="2170" height="725" alt="logo_with_bg" src="https://github.com/user-attachments/assets/2237d965-94e4-4cb6-b6f1-ce27b105c69a" />


  <p align="center">
    <strong>노드 연결 기반 AI Agent 학습·개발 플랫폼</strong>
  </p>

  <p align="center">
    <a href="#-프로젝트-소개-overview">프로젝트 소개</a> •
    <a href="#-핵심-기능-key-features">핵심 기능</a> •
    <a href="#-기술-스택-tech-stack">기술 스택</a> •
    <a href="#-프로젝트-구조-directory-structure">프로젝트 구조</a> •
    <a href="#-빠른-시작-quick-start">빠른 시작</a> •
    <a href="#-데스크톱-로컬-런타임-desktop-runtime">데스크톱 런타임</a>
  </p>
</div>

---

## 📌 프로젝트 소개 (Overview)

**NOA-E (Node Oriented Agent - Education)**는 코딩에 익숙하지 않은 입문자를 대상으로 AI Agent의 구조와 오케스트레이션 원리를 직관적으로 이해하고 직접 설계할 수 있는 교육·실습 플랫폼입니다.

- 🧩 **No-Code 비주얼 에디터**: React Flow 기반의 캔버스에서 노드를 드래그 앤 드롭하고 선을 이어 AI Agent 워크플로우를 완성할 수 있습니다.
- 🧠 **에이전트 오케스트레이션 지원**: 단일 프롬프팅을 넘어 **Planner**, **Router**, **Aggregator** 노드를 통해 목표 분해, 조건부 동적 분기, 다중 작업 결과 취합 루프를 시각적으로 구현할 수 있습니다.
- 🛠️ **실시간 외부 도구(Tools) 연동**: 웹 검색, YouTube 검색 등 다양한 Tool 노드를 에이전트 LLM에 유연하게 바인딩할 수 있습니다.
- ⚡ **실시간 SSE 스트리밍 & 디버깅**: 에이전트 실행 시 노드별 실행 상태, 토큰 스트리밍, ReAct 추론/사고 로그를 단계별(Step)로 모니터링할 수 있습니다.
- 📦 **독립형 데스크톱 런타임 (PySide6)**: 웹에서 설계한 에이전트 워크플로우(`JSON`)를 내려받아, 웹 연결 프록시 또는 로컬 LLM을 통해 독립 실행형 데스크톱 애플리케이션으로 바로 구동합니다.

---

## ✨ 핵심 기능 (Key Features)

### 1. 📚 체계적인 5단계 이론 교육 (Learn)
- **1단계: LLM 기초와 생성 원리**
- **2단계: 프롬프트 엔지니어링 & 제어**
- **3단계: AI Agent 아키텍처**
- **4단계: 도구(Tools) & RAG**
- **5단계: MCP & AI 안전/윤리**

### 2. 🎨 비주얼 노드 스튜디오 (Studio)
- **노드 라이브러리**:
  - `Input` / `Output`: 워크플로우의 입력 및 결과 렌더링
  - `LLM`: Ollama / OpenAI 호환 모델 설정, 시스템 프롬프트 및 파라미터 제어, 상단 Tool 바인딩 지원
  - `Planner`: 사용자 목표를 분석하여 세부 작업 계획 수립
  - `Router`: 실행 상태 및 의도에 따른 조건부 동적 경로 분기 제어
  - `Aggregator`: 복수 노드의 실행 결과를 취합하고 최종 응답 생성
  - `Tools`: Web Search, Weather, YouTube 등 실시간 외부 도구 바인딩
- **인터랙티브 기능**:
  - **온보딩 가이드**: 플랫폼의 주요 메뉴와 핵심 기능을 한눈에 둘러보는 온보딩 가이드
  - **에이전트 제작 가이드**: 노드 배치부터 연결, 실행까지 단계별로 안내하는 제작 가이드
  - **실시간 실행 결과 패널**: 루프/스텝별 실행 내역 실시간 누적 및 아코디언 토글

### 3. 🖥️ 독립형 데스크톱 런타임 (Desktop Native Runtime)
- 웹 스튜디오에서 제작한 에이전트를 내보내기(`JSON`)하여 로컬 데스크톱에서 단독 구동
- **웹 경유 LLM 프록시 탑재**: PC에 고사양 GPU나 LLM 환경이 없어도 웹 플랫폼 서버를 경유하여 즉시 동작
- **커스텀 LLM 설정**: 로컬 Ollama 또는 개인 OpenAI API Key 등으로 노드별 유연한 전환 지원
- **실시간 사고 과정 뷰어**: 에이전트의 내부 의사결정 및 도구 호출 과정을 실시간 로그 카드로 시각화

---

## 🛠 기술 스택 (Tech Stack)

| 영역 | 기술 스택 |
| :--- | :--- |
| **Web Frontend** | React 19, TypeScript, `@xyflow/react` (React Flow), TailwindCSS, Zustand |
| **Backend & Engine** | Python 3.11+, FastAPI, LangGraph, LangChain, PostgreSQL 15 |
| **Desktop Runtime** | PySide6 (Qt GUI), Standalone LangGraph Engine, PyInstaller |
| **Infra & LLM** | Docker, Docker Compose, Nginx, Ollama, OpenAI Compatible API |

---

## 📂 프로젝트 구조 (Directory Structure)

```text
NOA-E/
├── docker/       # Docker Compose 및 환경 변수(.env) 설정
├── services/
│   ├── backend/  # FastAPI 백엔드 & LangGraph 엔진
│   ├── frontend/ # React Flow 기반 웹 클라이언트
│   └── nginx/    # Nginx 리버스 프록시
└── runtime/      # PySide6 데스크톱 네이티브 런타임
```

---

## ⚡ 빠른 시작 (Quick Start)

### 1. 환경 변수 확인 및 설정

`docker/env/` 디렉터리의 기본 환경 변수를 필요에 따라 수정합니다.

- **`docker/env/.env.backend`**
  ```env
  DATABASE_URL=postgresql://postgres:postgres@db:5432/agent_db
  USE_OPENAI=false

  # LLM 기본 엔드포인트 설정
  LLM_MODEL=gpt-6-luna
  LLM_BASE_URL=https://llm_base_url
  LLM_API_KEY=your_llm_api_key

  # YouTube Tool 사용 시 필수 (Google Cloud Console 발급)
  YOUTUBE_API_KEY=your_youtube_api_key

  # 지원 모델 기능 명세 (JSON)
  MODELS_CONFIG={"gpt-6-luna":{"base_url":"https://llm_base_url","api_key":"your_llm_api_key","image":false,"tool":true,"mcp":false,"skill":false}}
  ```

- **`docker/env/.env.frontend`**
  ```env
  VITE_API_BASE_URL=/noa-e/api
  ```

- **`docker/env/.env.db`**
  ```env
  POSTGRES_USER=postgres
  POSTGRES_PASSWORD=postgres
  POSTGRES_DB=agent_db
  ```

---

### 2. Docker Compose로 웹 플랫폼 전체 기동 (권장)

Docker 및 Docker Compose가 설치된 환경에서 아래 명령어를 실행합니다.

```bash
# Docker Compose 컨테이너 빌드 및 백그라운드 기동
docker compose -f docker/compose/docker-compose.yml up --build -d
```

#### 🐳 컨테이너 서비스 구성
| 컨테이너명 | 포트 | 설명 |
| :--- | :--- | :--- |
| **`noa-e-nginx`** | `80` | 통합 리버스 프록시 ([http://localhost/noa-e](http://localhost/noa-e)) |
| **`noa-e-frontend`** | `3000` | React 웹 클라이언트 개발 서버 |
| **`noa-e-backend`** | `8000` | FastAPI 백엔드 ([API Docs](http://localhost:8000/docs)) |
| **`noa-e-db`** | `5432` | PostgreSQL 15 데이터베이스 |
| **`noa-e-ollama`** | `11434` | 로컬 LLM 런타임 |
| **`noa-e-ollama-init`** | - | 기본 모델 (`gemma2:2b`) 자동 풀링 |

---

## 🖥️ 데스크톱 로컬 런타임 (Desktop Runtime)

웹 스튜디오에서 설계한 에이전트를 `JSON` 파일로 내보낸 후 로컬 데스크톱에서 독립적으로 실행하기 위한 로컬 런타임입니다.

### 1. 환경 설정 및 의존성 설치
```bash
cd runtime
pip install -r requirements.txt
```

### 2. GUI 데스크톱 앱 실행 (기본 권장)
```bash
python agent_runner.py
# 또는 python gui.py
```
- 실행 후 좌측 사이드바의 **[⚙️ 에이전트 로드 / 설정]**을 클릭하여 `workflow.json` 파일을 불러옵니다.
- 에이전트 노드별로 **기본(웹 서버 프록시/서버 Ollama)** 또는 **커스텀(개인 API Key/로컬 LLM)**을 자유롭게 설정할 수 있습니다.
- 대화창에 메시지를 입력하면 실시간 ReAct 사고 로그 및 도구 호출 과정과 함께 답변을 수신합니다.

### 3. CLI 터미널 대화 모드
```bash
python agent_runner.py --workflow sample_agent.json --cli
```

### 4. 윈도우 배포 패키지(.exe / 설치 프로그램) 빌드
- **독립형 실행 폴더 빌드 (PyInstaller)**:
  ```bash
  python build_exe.py
  ```
  > `dist/noa-e/noa-e.exe` 생성
- **원클릭 인스톨러 생성 (Inno Setup)**:
  ```bash
  python build_installer.py
  ```
  > `installer_output/NOA-E_Desktop_Setup_v1.0.0.exe` 생성 (바탕화면 바로가기, 환경변수 등록, 언인스톨러 포함)

---

## 📜 라이선스 (License)

This project is licensed under the MIT License.
