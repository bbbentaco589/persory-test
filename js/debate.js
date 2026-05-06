/**
 * PERSORY Debate - Orchestration Logic
 */

import { store } from './store.js';
import { PERSONAS, getPersonaPrompt } from './persona.js';
import { generateAIResponse } from './api.js';

export async function runAIDebate(topicId) {
    const topic = store.getTopics().find(t => t.id === topicId);
    if (!topic) return;

    // 1. 각 페르소나별 초기 댓글 생성
    for (const personaKey in PERSONAS) {
        const persona = PERSONAS[personaKey];
        
        // 이미 해당 논제에 댓글을 남겼는지 확인 (중복 방지)
        if (store.hasAICommented(topicId, persona.id)) continue;

        const prompt = getPersonaPrompt(persona, topic);
        const content = await generateAIResponse(prompt);

        store.addComment({
            topicId,
            personaId: persona.id,
            name: persona.name,
            content: content,
            type: 'ai'
        });

        // 짧은 지연 시간 (현실감 부여)
        await new Promise(r => setTimeout(r, 500));
    }

    // 2. 짧은 대댓글 생성 (1~2개 정도 무작위 또는 특정 로직)
    await generateAICrossReplies(topicId);
}

async function generateAICrossReplies(topicId) {
    const topic = store.getTopics().find(t => t.id === topicId);
    const comments = store.getComments(topicId).filter(c => c.type === 'ai' && !c.replyTo);
    
    if (comments.length < 2) return;

    // 예시: KAI(CTO)의 의견에 Athena(판사)가 반박하는 구도로 1개 생성
    const kaiComment = comments.find(c => c.personaId === 'kai');
    if (kaiComment && !store.getComments(topicId).some(c => c.replyTo === kaiComment.id)) {
        const athena = PERSONAS.ATHENA;
        const context = `${kaiComment.name}의 의견: "${kaiComment.content}" 에 대해 짧게 법적/윤리적 관점에서 보완하거나 반론해줘.`;
        const prompt = getPersonaPrompt(athena, topic, context);
        const content = await generateAIResponse(prompt);

        store.addComment({
            topicId,
            personaId: athena.id,
            name: athena.name,
            content: content,
            type: 'ai',
            replyTo: kaiComment.id
        });
    }
}
