const express = require('express');
const router = express.Router();
const Anthropic = require('@anthropic-ai/sdk');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const OpenAI = require('openai');

// AI 클라이언트 초기화
const anthropic = new Anthropic({
    apiKey: process.env.CLAUDE_API_KEY
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// 프롬프트 템플릿 생성
function createSystemPrompt(sceneCount, scenes) {
    return `당신은 Sora 2 영상 제작을 위한 전문 프롬프트 작성자입니다.

사용자가 원하는 영상 내용을 듣고, 아래 형식에 맞춰 상세하고 전문적인 영상 프롬프트를 생성해야 합니다.

**프롬프트 작성 규칙:**

1. 총 ${sceneCount}개의 장면(SHOT)을 생성해야 합니다.
2. 각 장면의 구성:
${scenes.map(scene => `   - SHOT${scene.number}: ${scene.duration}초`).join('\n')}

3. 각 SHOT의 형식:
   - 장면 제목: "SHOT{번호} — 장면: [위치 및 분위기 설명]"
   - 시간대별 상세 묘사:
     * 0–0.2s: 화면 전환 효과
     * 0.2–5s: 초반 장면 설정 및 주요 액션
     * 5–10s: 중반 전개 및 클라이맥스 빌드업
     * 10–${scenes[0].duration}s: 마무리 및 다음 장면 연결

4. 각 시간대마다 포함할 요소:
   - 카메라 앵글 (와이드샷, 미디엄샷, 클로즈업 등)
   - 캐릭터의 동작과 표정
   - 대사 (있는 경우, 큰따옴표로 표시)
   - 시각적 효과 (빛, 그림자, 모션 블러, 파티클 등)
   - 분위기와 감정
   - 카메라 움직임 (팬, 틸트, 줌, 트래킹 등)

5. 작성 스타일:
   - 영화적이고 전문적인 어조
   - 구체적이고 시각적인 묘사
   - 시간의 흐름에 따른 자연스러운 연결
   - 각 장면 간의 스토리 연속성 유지

6. 예시 참고 (형식만 참고, 내용은 사용자 요청에 맞게):
   "SHOT1 — 장면: 안개 낀 폐허의 산촌 입구, 달빛이 낮게 비추는 밤

   0–0.2s:
   빠른 모션 블러 속에서 달빛이 번져 화면이 서서히 드러난다.

   0.2–5s:
   와이드샷으로 흐릿한 골목과 부서진 한옥 지붕이 보이고, **강무(한국 남성 무사, 30대, 검은 한복·붉은 허리끈·차가운 눈빛)**가 서서히 칼집에 손을 올린다..."

**중요:**
- 반드시 위 형식을 정확히 따라야 합니다.
- 각 장면의 시간은 지정된 duration에 맞춰야 합니다.
- 모든 묘사는 한국어로 작성합니다.
- 캐릭터, 배경, 액션을 구체적으로 묘사합니다.
- 영상의 전체적인 스토리 흐름을 고려합니다.`;
}

// Claude로 프롬프트 생성
async function generateWithClaude(systemPrompt, userDescription) {
    const message = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4096,
        temperature: 0.7,
        system: systemPrompt,
        messages: [
            {
                role: "user",
                content: userDescription
            }
        ]
    });

    return message.content[0].text;
}

// Gemini로 프롬프트 생성
async function generateWithGemini(systemPrompt, userDescription) {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    const prompt = `${systemPrompt}

사용자 요청:
${userDescription}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
}

// GPT-4o mini로 프롬프트 생성
async function generateWithGPT(systemPrompt, userDescription) {
    const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            {
                role: "system",
                content: systemPrompt
            },
            {
                role: "user",
                content: userDescription
            }
        ],
        temperature: 0.7,
        max_tokens: 4096
    });

    return completion.choices[0].message.content;
}

// 메인 라우트
router.post('/generate', async (req, res) => {
    try {
        const { model, sceneCount, scenes, description } = req.body;

        // 입력 검증
        if (!model || !sceneCount || !scenes || !description) {
            return res.status(400).json({
                error: '필수 입력값이 누락되었습니다.',
                required: ['model', 'sceneCount', 'scenes', 'description']
            });
        }

        // 시스템 프롬프트 생성
        const systemPrompt = createSystemPrompt(sceneCount, scenes);

        let generatedPrompt;

        // 선택된 모델에 따라 프롬프트 생성
        switch (model) {
            case 'claude':
                generatedPrompt = await generateWithClaude(systemPrompt, description);
                break;
            case 'gemini':
                generatedPrompt = await generateWithGemini(systemPrompt, description);
                break;
            case 'gpt4o-mini':
                generatedPrompt = await generateWithGPT(systemPrompt, description);
                break;
            default:
                return res.status(400).json({
                    error: '지원하지 않는 AI 모델입니다.',
                    supported: ['claude', 'gemini', 'gpt4o-mini']
                });
        }

        // 성공 응답
        res.json({
            success: true,
            model: model,
            prompt: generatedPrompt,
            metadata: {
                sceneCount: sceneCount,
                totalDuration: scenes.reduce((sum, scene) => sum + scene.duration, 0),
                generatedAt: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('프롬프트 생성 오류:', error);

        // 에러 응답
        res.status(500).json({
            error: 'AI 프롬프트 생성 중 오류가 발생했습니다.',
            message: error.message,
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

module.exports = router;
