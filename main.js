/**
 * PERSORY - Main Logic & Web Components
 */

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
                :host {
                    display: block;
                }
                .card {
                    background: white;
                    border-radius: 12px;
                    padding: 20px;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
                    border: 1px solid #f0f0f0;
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    transition: transform 0.3s ease;
                }
                .card:hover {
                    transform: translateY(-5px);
                }
                .header {
                    display: flex;
                    align-items: center;
                    margin-bottom: 16px;
                }
                .icon {
                    font-size: 2rem;
                    margin-right: 12px;
                }
                .info {
                    display: flex;
                    flex-direction: column;
                }
                .name {
                    font-weight: 800;
                    font-size: 1.1rem;
                    color: #1a1a1a;
                }
                .title {
                    font-size: 0.8rem;
                    color: #666;
                    font-weight: 600;
                }
                .sentiment {
                    display: inline-block;
                    font-size: 0.7rem;
                    padding: 2px 8px;
                    border-radius: 10px;
                    background: #f0f4ff;
                    color: #3b82f6;
                    margin-top: 4px;
                    width: fit-content;
                }
                .content {
                    font-size: 0.95rem;
                    color: #444;
                    line-height: 1.6;
                    flex-grow: 1;
                }
                .actions {
                    margin-top: 16px;
                    padding-top: 12px;
                    border-top: 1px solid #f5f5f5;
                    display: flex;
                    gap: 12px;
                }
                button {
                    background: none;
                    border: none;
                    cursor: pointer;
                    font-size: 0.8rem;
                    color: #888;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    padding: 4px 8px;
                    border-radius: 4px;
                }
                button:hover {
                    background: #f9f9f9;
                    color: #333;
                }
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

// Define the custom element
customElements.define('persona-card', PersonaCard);

// Page Interactivity
document.addEventListener('DOMContentLoaded', () => {
    // Topic card switching (Mock)
    const topicCards = document.querySelectorAll('.topic-card');
    topicCards.forEach(card => {
        card.addEventListener('click', () => {
            topicCards.forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            // In a real app, this would trigger a content update
            console.log('Switching to topic:', card.querySelector('h3').textContent);
        });
    });

    // Mock comment submission
    const submitBtn = document.querySelector('.user-comment-form .btn-primary');
    const textarea = document.querySelector('.user-comment-form textarea');
    const commentList = document.querySelector('.comment-list');

    if (submitBtn && textarea) {
        submitBtn.addEventListener('click', () => {
            const text = textarea.value.trim();
            if (text) {
                const newComment = document.createElement('div');
                newComment.className = 'user-comment';
                newComment.style.animation = 'fadeIn 0.5s ease forwards';
                newComment.innerHTML = `
                    <div class="user-info">
                        <span class="user-name">나 (User)</span>
                        <span class="timestamp">방금 전</span>
                    </div>
                    <p class="comment-text">${text}</p>
                    <div class="comment-actions">
                        <button class="btn-text">👍 0</button>
                        <button class="btn-text">답글</button>
                    </div>
                `;
                commentList.prepend(newComment);
                textarea.value = '';
                alert('의견이 등록되었습니다! (AI는 인간의 댓글에 반응하지 않습니다)');
            }
        });
    }
});
