/**
 * PERSORY - Main Logic & Web Components
 */

import { store } from './js/store.js';
import { PERSONAS } from './js/persona.js';
import { runAIDebate } from './js/debate.js';

class PersonaCard extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
    }

    render() {
        const name = this.getAttribute('name') || 'AI Persona';
        const title = this.getAttribute('title') || 'Expert';
        const icon = this.getAttribute('icon') || '🤖';
        const content = this.getAttribute('content') || '';
        const sentiment = this.getAttribute('sentiment') || 'Neutral';

        this.shadowRoot.innerHTML = `
            <style>
                :host { display: block; }
                .card {
                    background: white; border-radius: 12px; padding: 20px;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05); border: 1px solid #f0f0f0;
                    height: 100%; display: flex; flex-direction: column; transition: transform 0.3s ease;
                }
                .card:hover { transform: translateY(-5px); }
                .header { display: flex; align-items: center; margin-bottom: 16px; }
                .icon { font-size: 2rem; margin-right: 12px; }
                .info { display: flex; flex-direction: column; }
                .name { font-weight: 800; font-size: 1.1rem; color: #1a1a1a; }
                .title { font-size: 0.8rem; color: #666; font-weight: 600; }
                .sentiment { display: inline-block; font-size: 0.7rem; padding: 2px 8px; border-radius: 10px; background: #f0f4ff; color: #3b82f6; margin-top: 4px; width: fit-content; }
                .content { font-size: 0.95rem; color: #444; line-height: 1.6; flex-grow: 1; }
                .actions { margin-top: 16px; padding-top: 12px; border-top: 1px solid #f5f5f5; display: flex; gap: 12px; }
                button { background: none; border: none; cursor: pointer; font-size: 0.8rem; color: #888; display: flex; align-items: center; gap: 4px; padding: 4px 8px; border-radius: 4px; }
                button:hover { background: #f9f9f9; color: #333; }
            </style>
            <div class="card">
                <div class="header">
                    <span class="icon">${icon}</span>
                    <div class="info">
                        <span class="name">${name}</span>
                        <span class="title">${title}</span>
                        <span class="sentiment">${sentiment}</span>
                    </div>
                </div>
                <p class="content">${content}</p>
                <div class="actions">
                    <button>👍 추천</button>
                    <button>💬 답글</button>
                </div>
            </div>
        `;
    }
}

customElements.define('persona-card', PersonaCard);

// Application Controller
class App {
    constructor() {
        this.init();
    }

    init() {
        this.renderSidebar();
        this.renderActiveTopic();
        this.renderComments();
        this.setupEventListeners();

        // Listen for store updates
        window.addEventListener('persory-store-update', () => {
            this.renderSidebar();
            this.renderComments();
        });

        // Trigger AI Debate if needed
        const activeTopic = store.getActiveTopic();
        if (activeTopic) {
            runAIDebate(activeTopic.id);
        }
    }

    renderSidebar() {
        const sidebar = document.getElementById('topic-sidebar');
        if (!sidebar) return;

        const topics = store.getTopics();
        const activeTopic = store.getActiveTopic();
        const activeTopicId = activeTopic ? activeTopic.id : null;

        sidebar.innerHTML = topics.map(topic => `
            <article class="topic-card ${topic.id === activeTopicId ? 'active' : ''}" data-id="${topic.id}">
                <span class="category">${topic.category}</span>
                <h3>${topic.title}</h3>
                <div class="topic-stats">
                    <span>🤖 AI ${store.getComments(topic.id).filter(c => c.type === 'ai').length}</span>
                    <span>💬 ${store.getComments(topic.id).filter(c => c.type === 'user').length}</span>
                </div>
            </article>
        `).join('');

        sidebar.querySelectorAll('.topic-card').forEach(card => {
            card.addEventListener('click', () => {
                const id = card.getAttribute('data-id');
                store.setActiveTopic(id);
                this.renderActiveTopic();
                runAIDebate(id);
            });
        });
    }

    renderActiveTopic() {
        const topic = store.getActiveTopic();
        if (!topic) return;

        document.querySelector('.breadcrumb').textContent = `홈 > ${topic.category}`;
        document.querySelector('.discussion-title').textContent = topic.title;
        document.querySelector('.discussion-desc').textContent = topic.content;
    }

    renderComments() {
        const personaGrid = document.getElementById('persona-grid');
        const commentList = document.getElementById('comment-list');
        const activeTopic = store.getActiveTopic();

        if (!personaGrid || !commentList || !activeTopic) return;

        const allComments = store.getComments(activeTopic.id);
        
        // 1. AI Persona Cards (Main Opinions)
        const mainAIComments = allComments.filter(c => c.type === 'ai' && !c.replyTo);
        personaGrid.innerHTML = '';
        if (mainAIComments.length === 0) {
            personaGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-secondary);">AI 페르소나들이 의견을 준비하고 있습니다...</p>';
        } else {
            mainAIComments.forEach(comment => {
                const persona = Object.values(PERSONAS).find(p => p.id === comment.personaId);
                const card = document.createElement('persona-card');
                card.setAttribute('name', comment.name);
                card.setAttribute('title', persona?.role || 'Expert');
                card.setAttribute('icon', persona?.icon || '🤖');
                card.setAttribute('sentiment', persona?.sentiment || 'Neutral');
                card.setAttribute('content', comment.content);
                personaGrid.appendChild(card);
            });
        }

        // 2. Comments Area (Replies and Human Comments)
        const otherComments = allComments.filter(c => c.type === 'user' || c.replyTo);
        commentList.innerHTML = otherComments.map(comment => {
            const isReply = !!comment.replyTo;
            const replyTarget = isReply ? allComments.find(c => c.id === comment.replyTo) : null;
            
            return `
                <div class="user-comment ${isReply ? 'ai-reply' : ''}" style="margin-left: ${isReply ? '40px' : '0'}; border-left: ${isReply ? '2px solid var(--brand-primary)' : 'none'}">
                    <div class="user-info">
                        <span class="user-name">${isReply ? '↩️ ' : ''}${comment.name}</span>
                        ${isReply ? `<span class="reply-target">to ${replyTarget?.name}</span>` : ''}
                        <span class="timestamp">방금 전</span>
                    </div>
                    <p class="comment-text">${comment.content}</p>
                    <div class="comment-actions">
                        <button class="btn-text">👍 0</button>
                        <button class="btn-text">답글</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    setupEventListeners() {
        // Topic submission
        const btnShowForm = document.getElementById('btn-show-topic-form');
        const btnCancelForm = document.getElementById('btn-cancel-topic');
        const btnSubmitTopic = document.getElementById('btn-submit-topic');
        const topicForm = document.getElementById('new-topic-form');
        const titleInput = document.getElementById('topic-title-input');
        const contentInput = document.getElementById('topic-content-input');

        if (btnShowForm) {
            btnShowForm.addEventListener('click', () => {
                topicForm.style.display = 'block';
                btnShowForm.style.display = 'none';
            });
        }

        if (btnCancelForm) {
            btnCancelForm.addEventListener('click', () => {
                topicForm.style.display = 'none';
                btnShowForm.style.display = 'inline-block';
            });
        }

        if (btnSubmitTopic) {
            btnSubmitTopic.addEventListener('click', () => {
                const title = titleInput.value.trim();
                const content = contentInput.value.trim();

                if (title && content) {
                    const newTopic = store.addTopic({
                        title,
                        content,
                        category: '사용자 주제'
                    });
                    
                    titleInput.value = '';
                    contentInput.value = '';
                    topicForm.style.display = 'none';
                    btnShowForm.style.display = 'inline-block';
                    
                    this.renderActiveTopic();
                    runAIDebate(newTopic.id);
                }
            });
        }

        // Comment submission
        const submitBtn = document.getElementById('submit-comment');
        const textarea = document.getElementById('user-comment-input');

        if (submitBtn && textarea) {
            submitBtn.addEventListener('click', () => {
                const text = textarea.value.trim();
                if (text) {
                    store.addComment({
                        topicId: store.getActiveTopic().id,
                        name: '나 (User)',
                        content: text,
                        type: 'user'
                    });
                    textarea.value = '';
                }
            });
        }
    }
}

// Global Styles for replies
const style = document.createElement('style');
style.textContent = `
    .ai-reply { background: oklch(98% 0.01 250); padding: 16px; border-radius: var(--radius-md); margin-top: 12px; border: 1px solid oklch(90% 0.01 250); }
    .reply-target { font-size: 0.8rem; color: var(--brand-primary); font-weight: 600; margin-left: 8px; }
    .ai-reply .user-name { color: var(--brand-primary); font-weight: 700; }
`;
document.head.appendChild(style);

// Start App
document.addEventListener('DOMContentLoaded', () => new App());
