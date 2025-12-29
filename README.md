# 🎬 Sora 2 영상 프롬프트 생성기

AI를 활용하여 Sora 2 영상 제작을 위한 전문적인 프롬프트를 자동으로 생성하는 웹 애플리케이션입니다.

## ✨ 주요 기능

- **장면 설정**: 1~10개의 장면 개수 선택 및 각 장면별 시간 설정
- **AI 모델 선택**: Gemini 2.5 Flash, Claude 4.5, GPT-4o Mini 중 선택
- **자동 프롬프트 생성**: 사용자의 영상 아이디어를 전문적인 Sora 2 프롬프트로 변환
- **프롬프트 형식**:
  - SHOT별 구분
  - 시간대별 상세 묘사 (0-0.2s, 0.2-5s, 5-10s 등)
  - 카메라 앵글 (와이드샷, 미디엄샷, 클로즈업)
  - 캐릭터 대사 및 동작
  - 시각적 효과 및 분위기

## 🏗️ 프로젝트 구조

```
video-prompt-generator/
├── frontend/              # 프론트엔드 파일
│   ├── index.html        # 메인 HTML
│   ├── css/
│   │   └── style.css     # 스타일시트
│   └── js/
│       └── app.js        # 클라이언트 로직
├── backend/              # 백엔드 서버
│   ├── server.js         # Express 서버
│   ├── package.json      # 의존성 관리
│   ├── .env.example      # 환경 변수 예시
│   └── routes/
│       └── generate.js   # 프롬프트 생성 API
├── .gitignore
└── README.md
```

## 🚀 설치 및 실행

### 1. 프로젝트 클론

```bash
git clone <repository-url>
cd 20251229
```

### 2. 의존성 설치

```bash
cd backend
npm install
```

### 3. 환경 변수 설정

`backend/.env.example` 파일을 `backend/.env`로 복사하고 API 키를 입력하세요:

```bash
cp .env.example .env
```

`.env` 파일 편집:

```env
PORT=3000
NODE_ENV=development

# API 키 입력
CLAUDE_API_KEY=your_claude_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
```

#### API 키 발급 방법

- **Claude API**: https://console.anthropic.com/
- **Gemini API**: https://ai.google.dev/
- **OpenAI API**: https://platform.openai.com/

### 4. 서버 실행

```bash
npm start
```

개발 모드 (nodemon 사용):

```bash
npm run dev
```

### 5. 웹 브라우저에서 접속

```
http://localhost:3000
```

## 📖 사용 방법

### 1단계: 장면 설정
- 슬라이더로 원하는 장면 개수 선택 (1~10개)
- 각 장면별 시간 설정 (5~60초)

### 2단계: AI 모델 선택
- **Gemini 2.5 Flash**: 빠르고 효율적
- **Claude 4.5**: 창의적이고 상세함
- **GPT-4o Mini**: 균형잡힌 성능

### 3단계: 영상 내용 설명
- 텍스트 영역에 만들고 싶은 영상 내용을 자유롭게 작성
- 예시: "안개 낀 폐허의 산촌에서 한국 무사가 좀비들과 싸우는 액션 장면"

### 4단계: 프롬프트 생성
- "프롬프트 생성하기" 버튼 클릭
- AI가 전문적인 Sora 2 프롬프트를 자동으로 생성

### 5단계: 결과 활용
- **복사하기**: 클립보드에 복사
- **다운로드**: 텍스트 파일로 저장

## 🎨 생성 프롬프트 예시

```
SHOT1 — 장면: 안개 낀 폐허의 산촌 입구, 달빛이 낮게 비추는 밤

0–0.2s:
빠른 모션 블러 속에서 달빛이 번져 화면이 서서히 드러난다.

0.2–5s:
와이드샷으로 흐릿한 골목과 부서진 한옥 지붕이 보이고, **강무(한국 남성 무사, 30대, 검은 한복·붉은 허리끈·차가운 눈빛)**가 서서히 칼집에 손을 올린다. 카메라가 미디엄으로 이동하며 그의 얼굴 클로즈업으로 전환되고, 바람이 머리칼을 지나며 그는 낮게 말한다:
"밤이 깊어도, 나의 길은 흐려지지 않는다."

5–10s:
골목 끝에서 좀비 무리가 비틀거리며 나타나고 카메라는 그의 발끝이 '탁' 앞으로 나아가는 모습으로 자연스럽게 이동한다...
```

## 🔧 API 엔드포인트

### POST `/api/generate`

프롬프트 생성 요청

**Request Body:**
```json
{
  "model": "gemini | claude | gpt4o-mini",
  "sceneCount": 3,
  "scenes": [
    { "number": 1, "duration": 15 },
    { "number": 2, "duration": 15 },
    { "number": 3, "duration": 15 }
  ],
  "description": "영상 내용 설명..."
}
```

**Response:**
```json
{
  "success": true,
  "model": "gemini",
  "prompt": "생성된 프롬프트...",
  "metadata": {
    "sceneCount": 3,
    "totalDuration": 45,
    "generatedAt": "2025-12-29T..."
  }
}
```

## 🛠️ 기술 스택

### Frontend
- HTML5
- CSS3 (Grid, Flexbox, Animations)
- Vanilla JavaScript (ES6+)

### Backend
- Node.js
- Express.js
- AI SDKs:
  - `@anthropic-ai/sdk` (Claude)
  - `@google/generative-ai` (Gemini)
  - `openai` (GPT-4o Mini)

## 📝 라이선스

MIT License

## 🤝 기여

이슈 및 풀 리퀘스트를 환영합니다!

## 📧 문의

프로젝트에 대한 질문이나 제안사항이 있으시면 이슈를 등록해주세요.

---

Made with ❤️ for Sora 2 creators
