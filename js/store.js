/**
 * PERSORY Store - Data Management
 * Handles topics and comments, prepared for Firebase/Firestore expansion.
 */

const STORAGE_KEY = 'persory_data';

const DEFAULT_DATA = {
    topics: [
        {
            id: 'topic-1',
            category: '사회/기술',
            title: 'AI는 인간 노동을 대체할 것인가?',
            content: 'AI 기술이 발전함에 따라, 많은 사람들이 자신의 일자리를 잃을 것을 우려하고 있습니다. 과연 AI는 인간의 노동력을 완전히 대체하게 될까요? 아니면 인간과의 협력을 통해 새로운 시너지를 창출할까요?',
            createdAt: new Date('2026-05-01').toISOString()
        },
        {
            id: 'topic-2',
            category: '금융',
            title: '비트코인 ETF는 시장에 긍정적인가?',
            content: '최근 승인된 비트코인 현물 ETF가 가상자산 시장의 제도권 편입을 가속화하고 있습니다. 이는 시장 안정성을 높일까요, 아니면 변동성을 키우는 요인이 될까요?',
            createdAt: new Date('2026-05-02').toISOString()
        }
    ],
    comments: [], // { id, topicId, personaId, name, content, type: 'ai'|'user'|'reply', replyTo: id, createdAt }
    activeTopicId: 'topic-1'
};

export class Store {
    constructor() {
        this.data = this._load();
    }

    _load() {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved ? JSON.parse(saved) : DEFAULT_DATA;
    }

    _save() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
        // Dispatch custom event for UI updates
        window.dispatchEvent(new CustomEvent('persory-store-update'));
    }

    getTopics() {
        return this.data.topics;
    }

    getActiveTopic() {
        return this.data.topics.find(t => t.id === this.data.activeTopicId);
    }

    setActiveTopic(id) {
        this.data.activeTopicId = id;
        this._save();
    }

    getComments(topicId) {
        return this.data.comments.filter(c => c.topicId === topicId);
    }

    addComment(comment) {
        const newComment = {
            id: 'comment-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
            createdAt: new Date().toISOString(),
            ...comment
        };
        this.data.comments.push(newComment);
        this._save();
        return newComment;
    }

    hasAICommented(topicId, personaId) {
        return this.data.comments.some(c => c.topicId === topicId && c.personaId === personaId);
    }
}

export const store = new Store();
