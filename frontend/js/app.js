// DOM 요소
const sceneCountSlider = document.getElementById('sceneCount');
const sceneCountValue = document.getElementById('sceneCountValue');
const sceneTimeSettings = document.getElementById('sceneTimeSettings');
const videoDescription = document.getElementById('videoDescription');
const generateBtn = document.getElementById('generateBtn');
const resultSection = document.getElementById('resultSection');
const resultContent = document.getElementById('resultContent');
const copyBtn = document.getElementById('copyBtn');
const downloadBtn = document.getElementById('downloadBtn');

// API 엔드포인트 설정
const API_BASE_URL = 'http://localhost:3000/api';

// 장면 개수 변경 이벤트
sceneCountSlider.addEventListener('input', (e) => {
    const count = parseInt(e.target.value);
    sceneCountValue.textContent = count;
    generateSceneTimeInputs(count);
});

// 초기 장면 시간 입력 생성
function generateSceneTimeInputs(count) {
    sceneTimeSettings.innerHTML = '';

    for (let i = 1; i <= count; i++) {
        const sceneItem = document.createElement('div');
        sceneItem.className = 'scene-time-item';
        sceneItem.innerHTML = `
            <label>SHOT ${i}:</label>
            <input
                type="number"
                id="sceneTime${i}"
                min="5"
                max="60"
                value="15"
                step="5"
            >
            <span>초</span>
        `;
        sceneTimeSettings.appendChild(sceneItem);
    }
}

// 페이지 로드 시 초기화
generateSceneTimeInputs(3);

// 프롬프트 생성 버튼 클릭
generateBtn.addEventListener('click', async () => {
    // 입력 검증
    const description = videoDescription.value.trim();
    if (!description) {
        alert('영상 내용을 입력해주세요!');
        return;
    }

    // 장면 데이터 수집
    const sceneCount = parseInt(sceneCountSlider.value);
    const scenes = [];
    for (let i = 1; i <= sceneCount; i++) {
        const timeInput = document.getElementById(`sceneTime${i}`);
        scenes.push({
            number: i,
            duration: parseInt(timeInput.value)
        });
    }

    // 선택된 AI 모델
    const selectedModel = document.querySelector('input[name="aiModel"]:checked').value;

    // UI 상태 변경
    setLoadingState(true);

    try {
        // API 호출
        const response = await fetch(`${API_BASE_URL}/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: selectedModel,
                sceneCount: sceneCount,
                scenes: scenes,
                description: description
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || '프롬프트 생성에 실패했습니다.');
        }

        const data = await response.json();
        displayResult(data.prompt);
    } catch (error) {
        console.error('Error:', error);
        alert(`오류가 발생했습니다: ${error.message}`);
    } finally {
        setLoadingState(false);
    }
});

// 로딩 상태 설정
function setLoadingState(isLoading) {
    const btnText = generateBtn.querySelector('.btn-text');
    const btnLoader = generateBtn.querySelector('.btn-loader');

    if (isLoading) {
        btnText.style.display = 'none';
        btnLoader.style.display = 'inline-flex';
        generateBtn.disabled = true;
    } else {
        btnText.style.display = 'inline';
        btnLoader.style.display = 'none';
        generateBtn.disabled = false;
    }
}

// 결과 표시
function displayResult(prompt) {
    resultContent.textContent = prompt;
    resultSection.style.display = 'block';

    // 결과 섹션으로 부드럽게 스크롤
    resultSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// 복사 버튼
copyBtn.addEventListener('click', async () => {
    try {
        await navigator.clipboard.writeText(resultContent.textContent);

        // 피드백 표시
        const originalText = copyBtn.textContent;
        copyBtn.textContent = '✓ 복사됨!';
        copyBtn.style.background = '#10b981';

        setTimeout(() => {
            copyBtn.textContent = originalText;
            copyBtn.style.background = '';
        }, 2000);
    } catch (error) {
        alert('복사에 실패했습니다.');
    }
});

// 다운로드 버튼
downloadBtn.addEventListener('click', () => {
    const text = resultContent.textContent;
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `sora2-prompt-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
});
