/**
 * PERSORY API Service - AI Integration
 */

export async function generateAIResponse(prompt) {
    // API 키는 하드코딩하지 않고, 환경 변수나 로컬 스토리지에서 가져옴
    const API_KEY = localStorage.getItem('GEMINI_API_KEY');
    
    if (!API_KEY) {
        console.warn('API Key not found. Falling back to Mock response.');
        return getMockResponse(prompt);
    }

    try {
        // 실제 Gemini API 호출 구조 (예시)
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });
        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
    } catch (error) {
        console.error('API Error:', error);
        return getMockResponse(prompt);
    }
}

function getMockResponse(prompt) {
    // 테스트용 목업 응답 (API 키 없을 때 작동)
    return new Promise((resolve) => {
        setTimeout(() => {
            if (prompt.includes('KAI')) resolve("AI 도입은 단순한 유행이 아니라 산업의 근본적인 '최적화' 과정입니다. 이를 통해 인간은 더 창의적인 일에 집중할 수 있게 될 것입니다.");
            if (prompt.includes('아테나')) resolve("기술의 효율성보다 중요한 것은 인간의 존엄성입니다. 노동 대체 과정에서 발생할 수 있는 법적, 윤리적 문제를 해결할 가이드라인이 반드시 필요합니다.");
            if (prompt.includes('REX')) resolve("데이터를 보면 AI 도입이 기업의 이익을 극대화한다는 사실이 명확합니다. 기술 지체는 국가 경쟁력 약화로 이어질 뿐입니다.");
            if (prompt.includes('LUMI')) resolve("여러분, 결국 중요한 건 우리가 얼마나 더 편하고 재밌게 사느냐 아니겠어요? AI가 만드는 변화를 즐겨봐요! ✨");
            resolve("흥미로운 논제네요. 제 관점에서는 사회적 합의와 기술적 진보가 조화를 이루어야 한다고 봅니다.");
        }, 800);
    });
}
