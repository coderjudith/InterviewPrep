// Configuration  
const API_BASE_URL = 'http://localhost:3001/api';
let currentState = {
    selectedQuestionId: null,
    selectedSessionId: null,
    categories: [],
    companies: [],
    roles: [],
    questions: [],
    sessions: [],
    sessionQuestions: []
};

// ==================== GLOBAL FUNCTIONS ====================

// Modal functions
window.showQuestionModal = function(question = null) {
    console.log('showQuestionModal called', question);
    
    // Reset to single mode by default
    setQuestionMode('single');
    
    if (question) {
        // Editing mode - always single
        document.getElementById('questionModalTitle').textContent = 'Edit Question';
        document.getElementById('questionId').value = question.id;
        document.getElementById('questionText').value = question.question_text;
        document.getElementById('categorySelect').value = question.category_id || '';
        document.getElementById('companySelect').value = question.company_id || '';
        document.getElementById('roleSelect').value = question.role_id || '';
        
        // Hide batch mode button when editing
        document.getElementById('batchModeBtn').style.display = 'none';
    } else {
        // Add new mode
        document.getElementById('questionModalTitle').textContent = 'Add New Question';
        document.getElementById('questionId').value = '';
        document.getElementById('questionText').value = '';
        document.getElementById('batchQuestionsText').value = '';
        document.getElementById('categorySelect').value = '';
        document.getElementById('companySelect').value = '';
        document.getElementById('roleSelect').value = '';
        
        // Show batch mode button
        document.getElementById('batchModeBtn').style.display = 'flex';
    }
    
    openModal('questionModal');
};
window.addQuestionToSessionFromQuestionsTab = async function(questionId) {
    // If no session is selected, show a prompt to select one
    if (!currentState.selectedSessionId) {
        // First, switch to the Sessions tab
        switchTab('sessions');
        
        // Show a message
        setTimeout(() => {
            alert('Please select a session first. We\'ve switched you to the Practice Sessions tab.\n\n1. Select an existing session OR\n2. Create a new session\n\nThen come back to add questions to it.');
        }, 300);
        return;
    }
    
    // If a session is selected, add the question to it
    try {
        await apiRequest(`/sessions/${currentState.selectedSessionId}/questions/${questionId}`, {
            method: 'POST'
        });
        alert('Question added to session!');
        
        // Optional: Switch to sessions tab to see the result
        const shouldViewSession = confirm('Question added successfully!\n\nDo you want to view the session now?');
        if (shouldViewSession) {
            switchTab('sessions');
        }
    } catch (error) {
        console.error('Failed to add question to session:', error);
        alert(`Failed to add question to session: ${error.message}`);
    }
};

window.showAnswerModal = function(answer = null) {
    console.log('showAnswerModal called', answer);
    
    if (!currentState.selectedQuestionId) {
        alert('Please select a question first');
        return;
    }
    
    if (answer) {
        document.getElementById('answerModalTitle').textContent = 'Edit Answer';
        document.getElementById('answerId').value = answer.id;
        document.getElementById('answerText').value = answer.answer_text;
    } else {
        document.getElementById('answerModalTitle').textContent = 'Add New Answer';
        document.getElementById('answerId').value = '';
        document.getElementById('answerText').value = '';
    }
    openModal('answerModal');
};

window.showCategoryModal = function(category = null) {
    if (category) {
        document.getElementById('categoryModalTitle').textContent = 'Edit Category';
        document.getElementById('categoryId').value = category.id;
        document.getElementById('modalCategoryName').value = category.name;
    } else {
        document.getElementById('categoryModalTitle').textContent = 'Add New Category';
        document.getElementById('categoryId').value = '';
        document.getElementById('modalCategoryName').value = '';
    }
    openModal('categoryModal');
};

window.showCompanyModal = function(company = null) {
    if (company) {
        document.getElementById('companyModalTitle').textContent = 'Edit Company';
        document.getElementById('companyId').value = company.id;
        document.getElementById('modalCompanyName').value = company.name;
    } else {
        document.getElementById('companyModalTitle').textContent = 'Add New Company';
        document.getElementById('companyId').value = '';
        document.getElementById('modalCompanyName').value = '';
    }
    openModal('companyModal');
};

window.showRoleModal = function(role = null) {
    if (role) {
        document.getElementById('roleModalTitle').textContent = 'Edit Role';
        document.getElementById('roleId').value = role.id;
        document.getElementById('modalRoleTitle').value = role.title;
    } else {
        document.getElementById('roleModalTitle').textContent = 'Add New Role';
        document.getElementById('roleId').value = '';
        document.getElementById('modalRoleTitle').value = '';
    }
    openModal('roleModal');
};

window.showSessionModal = function(session = null) {
    if (session) {
        document.getElementById('sessionModalTitle').textContent = 'Edit Session';
        document.getElementById('sessionId').value = session.id;
        document.getElementById('modalSessionName').value = session.name;
        document.getElementById('modalSessionCompany').value = session.company_id || '';
        document.getElementById('modalSessionRole').value = session.role_id || '';
    } else {
        document.getElementById('sessionModalTitle').textContent = 'Create Practice Session';
        document.getElementById('sessionId').value = '';
        document.getElementById('modalSessionName').value = '';
        document.getElementById('modalSessionCompany').value = '';
        document.getElementById('modalSessionRole').value = '';
    }
    openModal('sessionModal');
};

window.openModal = function(modalId) {
    console.log('Opening modal:', modalId);
    document.getElementById(modalId).style.display = 'flex';
};

window.closeModal = function(modalId) {
    document.getElementById(modalId).style.display = 'none';
};

// Question Mode Functions
window.setQuestionMode = function(mode) {
    document.getElementById('questionMode').value = mode;
    
    // Update button states
    document.getElementById('singleModeBtn').classList.toggle('active', mode === 'single');
    document.getElementById('batchModeBtn').classList.toggle('active', mode === 'batch');
    
    // Show/hide sections
    document.getElementById('singleQuestionSection').style.display = mode === 'single' ? 'block' : 'none';
    document.getElementById('batchQuestionsSection').style.display = mode === 'batch' ? 'block' : 'none';
    
    // Update submit button text
    document.getElementById('submitBtn').textContent = mode === 'single' ? 'Save Question' : 'Save All Questions';
    
    // Update textarea requirement
    document.getElementById('questionText').required = mode === 'single';
    document.getElementById('batchQuestionsText').required = mode === 'batch';
    
    // Update preview for batch mode
    if (mode === 'batch') {
        updateBatchPreview();
    }
};

// Update batch preview
function updateBatchPreview() {
    const batchText = document.getElementById('batchQuestionsText').value;
    const questions = batchText.split('\n')
        .map(q => q.trim())
        .filter(q => q.length > 0);
    
    const previewList = document.getElementById('previewList');
    const questionCount = document.getElementById('questionCount');
    
    if (questions.length > 0) {
        document.getElementById('batchPreview').style.display = 'block';
        questionCount.textContent = questions.length;
        
        previewList.innerHTML = questions.map((q, index) => `
            <div class="preview-item">
                <div style="display: flex; align-items: center;">
                    <span class="question-number">${index + 1}</span>
                    <span>${q.length > 60 ? q.substring(0, 60) + '...' : q}</span>
                </div>
                <small style="color: #64748b;">${q.length} chars</small>
            </div>
        `).join('');
    } else {
        document.getElementById('batchPreview').style.display = 'none';
    }
}

// Add event listener for batch textarea
document.addEventListener('DOMContentLoaded', function() {
    const batchTextarea = document.getElementById('batchQuestionsText');
    if (batchTextarea) {
        batchTextarea.addEventListener('input', updateBatchPreview);
    }
});

// ==================== INITIALIZATION ====================

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing app...');
    initializeApp();
});

async function initializeApp() {
    console.log('Initializing app...');
    await checkAPIStatus();
    setupEventListeners();
    setupTabNavigation();
    await loadAllData();
}

// ==================== API FUNCTIONS ====================

async function apiRequest(endpoint, options = {}) {
    try {
        console.log(`Making API request to: ${API_BASE_URL}${endpoint}`);
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });
        
        console.log(`Response status: ${response.status}`);
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('API Request failed:', error);
        alert(`Error: ${error.message}`);
        throw error;
    }
}

async function checkAPIStatus() {
    try {
        await apiRequest('/health');
        document.getElementById('apiStatus').innerHTML = '<i class="fas fa-check-circle"></i> Backend Connected';
        document.getElementById('apiStatus').style.color = '#10b981';
    } catch (error) {
        document.getElementById('apiStatus').innerHTML = '<i class="fas fa-times-circle"></i> Backend Not Connected';
        document.getElementById('apiStatus').style.color = '#ef4444';
    }
}

// ==================== DATA LOADING ====================

async function loadAllData() {
    try {
        console.log('Loading all data...');
        const [categories, companies, roles, questions, sessions] = await Promise.all([
            apiRequest('/categories?order=asc'),
            apiRequest('/companies?order=asc'),
            apiRequest('/roles?order=asc'),
            apiRequest('/questions?order=asc'),
            apiRequest('/sessions?order=asc')
        ]);
        
        // Sort data to show OLDEST first (ascending order by ID)
        currentState.categories = categories.sort((a, b) => a.id - b.id);
        currentState.companies = companies.sort((a, b) => a.id - b.id);
        currentState.roles = roles.sort((a, b) => a.id - b.id);
        currentState.questions = questions.sort((a, b) => a.id - b.id);
        currentState.sessions = sessions.sort((a, b) => a.id - b.id);
        
        console.log('Data loaded:', {
            categories: categories.length,
            companies: companies.length,
            roles: roles.length,
            questions: questions.length,
            sessions: sessions.length
        });
        
        renderCategories();
        renderCompanies();
        renderRoles();
        renderQuestions();
        renderSessions();
        renderQuestionsForAnswers();
        populateDropdowns();
        
    } catch (error) {
        console.error('Failed to load data:', error);
        alert('Failed to load data. Please check console for details.');
    }
}

async function loadQuestions() {
    try {
        const query = new URLSearchParams();
        const categoryFilter = document.getElementById('filterCategory');
        const companyFilter = document.getElementById('filterCompany');
        const roleFilter = document.getElementById('filterRole');
        const searchInput = document.getElementById('searchQuestion');
        
        if (categoryFilter && categoryFilter.value) query.append('category_id', categoryFilter.value);
        if (companyFilter && companyFilter.value) query.append('company_id', companyFilter.value);
        if (roleFilter && roleFilter.value) query.append('role_id', roleFilter.value);
        if (searchInput && searchInput.value) query.append('search', searchInput.value);
        
        query.append('order', 'asc');
        const queryString = query.toString();
        const endpoint = queryString ? `/questions?${queryString}` : '/questions?order=asc';
        
        currentState.questions = await apiRequest(endpoint);
        currentState.questions = currentState.questions.sort((a, b) => a.id - b.id);
        renderQuestions();
        renderQuestionsForAnswers();
    } catch (error) {
        console.error('Failed to load questions:', error);
    }
}

async function loadAnswers(questionId) {
    try {
        console.log(`Loading answers for question ${questionId}`);
        const answers = await apiRequest(`/answers/question/${questionId}?order=asc`);
        renderAnswers(answers.sort((a, b) => a.id - b.id));
        
        const addAnswerBtn = document.getElementById('addAnswerBtn');
        if (addAnswerBtn) addAnswerBtn.disabled = false;
        
        currentState.selectedQuestionId = questionId;
        
        // Update question title in answers tab
        const question = currentState.questions.find(q => q.id === questionId);
        if (question) {
            const titleElement = document.getElementById('currentQuestionTitle');
            if (titleElement) {
                titleElement.textContent = question.question_text.substring(0, 50) + 
                    (question.question_text.length > 50 ? '...' : '');
            }
        }
    } catch (error) {
        console.error('Failed to load answers:', error);
    }
}

async function loadSessionDetails(sessionId) {
    try {
        const [session, sessionQuestions] = await Promise.all([
            apiRequest(`/sessions/${sessionId}`),
            apiRequest(`/questions/session/${sessionId}`)
        ]);
        
        // Load answers for each question in the session
        currentState.sessionQuestions = await Promise.all(
            sessionQuestions.map(async (question) => {
                const answers = await apiRequest(`/answers/question/${question.id}?order=asc`);
                return {
                    ...question,
                    answers: answers.sort((a, b) => a.id - b.id)
                };
            })
        );
        
        // Sort session questions by oldest first
        currentState.sessionQuestions.sort((a, b) => a.id - b.id);
        
        renderSessionDetails(session, currentState.sessionQuestions);
        currentState.selectedSessionId = sessionId;
    } catch (error) {
        console.error('Failed to load session details:', error);
    }
}

// ==================== RENDER FUNCTIONS ====================

function renderQuestions() {
    const questionsList = document.getElementById('questionsList');
    if (!questionsList) return;
    
    if (!currentState.questions.length) {
        questionsList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-inbox fa-3x"></i>
                <p>No questions found. Add your first question!</p>
            </div>
        `;
        return;
    }
    
    questionsList.innerHTML = currentState.questions.map(question => `
        <div class="question-card">
            <div class="question-text">${question.question_text}</div>
            <div class="question-meta">
                ${question.category_name ? `<span class="question-tag"><i class="fas fa-tag"></i> ${question.category_name}</span>` : ''}
                ${question.company_name ? `<span class="question-tag"><i class="fas fa-building"></i> ${question.company_name}</span>` : ''}
                ${question.role_title ? `<span class="question-tag"><i class="fas fa-briefcase"></i> ${question.role_title}</span>` : ''}
            </div>
            <div class="question-actions">
                <button class="btn btn-sm btn-secondary" onclick="editQuestion(${question.id})">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteItem('question', ${question.id})">
                    <i class="fas fa-trash"></i> Delete
                </button>
                <button class="btn btn-sm btn-success" onclick="viewAnswers(${question.id})">
                    <i class="fas fa-reply"></i> Answers
                </button>
                <button class="btn btn-sm btn-primary" onclick="addAnswerToQuestion(${question.id})">
                    <i class="fas fa-plus"></i> Add Answer
                </button>
                <button class="btn btn-sm btn-primary" onclick="addQuestionToSessionFromQuestionsTab(${question.id})" style="background-color: #8b5cf6; border-color: #8b5cf6;">
    <i class="fas fa-plus-circle"></i> Add to Session
</button>
            </div>
        </div>
    `).join('');
}

function renderQuestionsForAnswers() {
    const questionsForAnswers = document.getElementById('questionsForAnswers');
    if (!questionsForAnswers) return;
    
    if (!currentState.questions.length) {
        questionsForAnswers.innerHTML = `
            <div class="empty-state">
                <p>No questions found. Add questions first.</p>
            </div>
        `;
        return;
    }
    
    questionsForAnswers.innerHTML = currentState.questions.map(question => `
        <div class="question-sidebar-item ${currentState.selectedQuestionId === question.id ? 'selected' : ''}" 
             onclick="selectQuestionForAnswers(${question.id})">
            <div style="font-weight: 600; margin-bottom: 5px;">
                ${question.question_text.substring(0, 60)}${question.question_text.length > 60 ? '...' : ''}
            </div>
            <div style="font-size: 0.85rem; color: #64748b;">
                ${question.category_name || 'No category'}
            </div>
        </div>
    `).join('');
}

function renderAnswers(answers) {
    const answersList = document.getElementById('answersList');
    if (!answersList) return;
    
    if (!answers.length) {
        answersList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-comment-slash fa-2x"></i>
                <p>No answers yet. Add your first answer!</p>
            </div>
        `;
        return;
    }
    
    answersList.innerHTML = answers.map(answer => `
        <div class="answer-item">
            <div class="answer-text">${answer.answer_text}</div>
            <div class="answer-meta">
                <small>Added: ${new Date(answer.created_at).toLocaleDateString()}</small>
                <div class="answer-actions">
                    <button class="btn btn-sm btn-secondary" onclick="editAnswer(${answer.id})">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteItem('answer', ${answer.id})">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function renderCategories() {
    const categoriesList = document.getElementById('categoriesList');
    if (!categoriesList) return;
    
    categoriesList.innerHTML = currentState.categories.map(category => `
        <div class="category-card">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <h3 style="color: #334155; margin-bottom: 5px;">${category.name}</h3>
                    <small style="color: #64748b;">ID: ${category.id}</small>
                </div>
                <div class="question-actions">
                    <button class="btn btn-sm btn-secondary" onclick="editCategory(${category.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteItem('category', ${category.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function renderCompanies() {
    const companiesList = document.getElementById('companiesList');
    if (!companiesList) return;
    
    companiesList.innerHTML = currentState.companies.map(company => `
        <div class="company-card">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <h3 style="color: #334155; margin-bottom: 5px;">${company.name}</h3>
                    <small style="color: #64748b;">ID: ${company.id}</small>
                </div>
                <div class="question-actions">
                    <button class="btn btn-sm btn-secondary" onclick="editCompany(${company.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteItem('company', ${company.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function renderRoles() {
    const rolesList = document.getElementById('rolesList');
    if (!rolesList) return;
    
    rolesList.innerHTML = currentState.roles.map(role => `
        <div class="role-card">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <h3 style="color: #334155; margin-bottom: 5px;">${role.title}</h3>
                    <small style="color: #64748b;">ID: ${role.id}</small>
                </div>
                <div class="question-actions">
                    <button class="btn btn-sm btn-secondary" onclick="editRole(${role.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteItem('role', ${role.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function renderSessions() {
    const sessionsList = document.getElementById('sessionsList');
    if (!sessionsList) return;
    
    if (!currentState.sessions.length) {
        sessionsList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-play-circle fa-3x"></i>
                <p>No practice sessions yet</p>
            </div>
        `;
        return;
    }
    
    sessionsList.innerHTML = currentState.sessions.map(session => `
        <div class="session-card ${currentState.selectedSessionId === session.id ? 'selected' : ''}">
            <div style="cursor: pointer;" onclick="selectSession(${session.id})">
                <h3 style="color: #334155; margin-bottom: 10px;">${session.name}</h3>
                <div style="display: flex; gap: 10px; margin-bottom: 10px;">
                    ${session.company_name ? `<span class="question-tag"><i class="fas fa-building"></i> ${session.company_name}</span>` : ''}
                    ${session.role_title ? `<span class="question-tag"><i class="fas fa-briefcase"></i> ${session.role_title}</span>` : ''}
                </div>
                <small style="color: #64748b;">ID: ${session.id}</small>
            </div>
            <div class="question-actions" style="margin-top: 15px;">
                <button class="btn btn-sm btn-secondary" onclick="editSession(${session.id})">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteItem('session', ${session.id})">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        </div>
    `).join('');
}

// Function to show session selection modal
window.showSessionSelectionModal = function(questionId) {
    // Store the question ID for later use
    window.selectedQuestionForSession = questionId;
    
    // Load sessions into the modal
    renderSessionsForSelection();
    
    // Show the modal
    openModal('sessionSelectModal');
};

// Function to render sessions in the selection modal
function renderSessionsForSelection() {
    const sessionsSelectionList = document.getElementById('sessionsSelectionList');
    if (!sessionsSelectionList) return;
    
    if (!currentState.sessions.length) {
        sessionsSelectionList.innerHTML = `
            <div class="empty-state" style="padding: 20px;">
                <i class="fas fa-play-circle fa-2x"></i>
                <p>No sessions found</p>
            </div>
        `;
        return;
    }
    
    sessionsSelectionList.innerHTML = currentState.sessions.map(session => `
        <div class="session-selection-item" onclick="selectSessionForQuestion(${session.id}, ${window.selectedQuestionForSession})" 
             style="padding: 12px; border: 1px solid #e2e8f0; border-radius: 6px; margin-bottom: 10px; cursor: pointer; transition: all 0.2s;"
             onmouseover="this.style.backgroundColor='#f8fafc'; this.style.borderColor='#cbd5e1';"
             onmouseout="this.style.backgroundColor='white'; this.style.borderColor='#e2e8f0';">
            <div style="font-weight: 600; color: #334155; margin-bottom: 5px;">${session.name}</div>
            <div style="display: flex; gap: 10px; font-size: 0.85rem; color: #64748b;">
                ${session.company_name ? `<span><i class="fas fa-building"></i> ${session.company_name}</span>` : ''}
                ${session.role_title ? `<span><i class="fas fa-briefcase"></i> ${session.role_title}</span>` : ''}
            </div>
        </div>
    `).join('');
}

// Function to select a session and add the question
window.selectSessionForQuestion = async function(sessionId, questionId) {
    try {
        await apiRequest(`/sessions/${sessionId}/questions/${questionId}`, {
            method: 'POST'
        });
        
        closeModal('sessionSelectModal');
        alert('Question added to session!');
        
        // Update the selected session ID
        currentState.selectedSessionId = sessionId;
        
        // Optional: Switch to sessions tab
        const shouldViewSession = confirm('Question added successfully!\n\nDo you want to view the session now?');
        if (shouldViewSession) {
            switchTab('sessions');
            // Refresh the session details
            setTimeout(() => {
                loadSessionDetails(sessionId);
            }, 100);
        }
    } catch (error) {
        console.error('Failed to add question to session:', error);
        alert(`Failed to add question to session: ${error.message}`);
    }
};

// Function to create a new session for the question
window.createNewSessionForQuestion = function() {
    closeModal('sessionSelectModal');
    // Show the session creation modal
    setTimeout(() => {
        showSessionModal();
        // Store the question ID to add it after session creation
        window.questionToAddAfterSessionCreation = window.selectedQuestionForSession;
    }, 300);
};

// Modify your handleSessionSubmit to handle adding the question after creation
// Find your handleSessionSubmit function and update it:
async function handleSessionSubmit(e) {
    e.preventDefault();
    
    const sessionData = {
        name: document.getElementById('modalSessionName').value.trim(),
        company_id: document.getElementById('modalSessionCompany').value || null,
        role_id: document.getElementById('modalSessionRole').value || null
    };
    
    if (!sessionData.name) {
        alert('Session name is required');
        return;
    }
    
    try {
        const sessionId = document.getElementById('sessionId').value;
        let newSessionId;
        
        if (sessionId) {
            // Update session
            await apiRequest(`/sessions/${sessionId}`, {
                method: 'PUT',
                body: JSON.stringify(sessionData)
            });
            alert('Session updated successfully!');
            newSessionId = sessionId;
        } else {
            // Create session
            const newSession = await apiRequest('/sessions', {
                method: 'POST',
                body: JSON.stringify(sessionData)
            });
            alert('Session created successfully!');
            newSessionId = newSession.id;
        }
        
        closeModal('sessionModal');
        
        // If there's a question waiting to be added, add it now
        if (window.questionToAddAfterSessionCreation) {
            await apiRequest(`/sessions/${newSessionId}/questions/${window.questionToAddAfterSessionCreation}`, {
                method: 'POST'
            });
            alert('Question added to the new session!');
            window.questionToAddAfterSessionCreation = null;
        }
        
        await loadAllData();
    } catch (error) {
        console.error('Failed to save session:', error);
        alert(`Failed to save session: ${error.message}`);
    }
}

function renderSessionDetails(session, questionsWithAnswers) {
    const sessionDetails = document.getElementById('sessionDetails');
    if (!sessionDetails) return;
    
    if (!questionsWithAnswers || !questionsWithAnswers.length) {
        sessionDetails.innerHTML = `
            <div>
                <h3 style="color: #334155; margin-bottom: 20px;">${session.name}</h3>
                <div style="display: flex; gap: 15px; margin-bottom: 25px;">
                    ${session.company_name ? `
                        <div style="background: #e0e7ff; color: #4f46e5; padding: 8px 20px; border-radius: 20px;">
                            <i class="fas fa-building"></i> ${session.company_name}
                        </div>
                    ` : ''}
                    ${session.role_title ? `
                        <div style="background: #dbeafe; color: #1d4ed8; padding: 8px 20px; border-radius: 20px;">
                            <i class="fas fa-briefcase"></i> ${session.role_title}
                        </div>
                    ` : ''}
                </div>
                
                <div class="empty-state" style="padding: 40px; text-align: center; background: #f8fafc; border-radius: 8px;">
                    <i class="fas fa-question-circle fa-3x" style="color: #cbd5e1; margin-bottom: 20px;"></i>
                    <p style="color: #64748b; font-size: 1.1rem; margin-bottom: 15px;">No questions in this session yet</p>
                    <p style="color: #94a3b8; font-size: 0.9rem; margin-bottom: 20px;">Add questions from the Questions tab by clicking "Add to Session"</p>
                </div>
            </div>
        `;
        return;
    }
    
    sessionDetails.innerHTML = `
        <div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <div>
                    <h3 style="color: #334155; margin-bottom: 5px;">${session.name}</h3>
                    <small style="color: #64748b;">Session ID: ${session.id}</small>
                </div>
                <div style="display: flex; gap: 10px; align-items: center;">
                    <div style="background: #f0f9ff; color: #0ea5e9; padding: 6px 12px; border-radius: 20px; font-size: 0.9rem;">
                        <i class="fas fa-question-circle"></i> ${questionsWithAnswers.length} Questions
                    </div>
                    <div style="background: #f0fdf4; color: #10b981; padding: 6px 12px; border-radius: 20px; font-size: 0.9rem;">
                        <i class="fas fa-comments"></i> ${questionsWithAnswers.reduce((total, q) => total + (q.answers ? q.answers.length : 0), 0)} Answers
                    </div>
                </div>
            </div>
            
            <div style="display: flex; gap: 15px; margin-bottom: 25px;">
                ${session.company_name ? `
                    <div style="background: #e0e7ff; color: #4f46e5; padding: 8px 20px; border-radius: 20px; display: flex; align-items: center; gap: 8px;">
                        <i class="fas fa-building"></i> ${session.company_name}
                    </div>
                ` : ''}
                ${session.role_title ? `
                    <div style="background: #dbeafe; color: #1d4ed8; padding: 8px 20px; border-radius: 20px; display: flex; align-items: center; gap: 8px;">
                        <i class="fas fa-briefcase"></i> ${session.role_title}
                    </div>
                ` : ''}
            </div>
            
            <div class="session-questions">
                <h4 style="color: #475569; margin-bottom: 20px; padding-bottom: 10px; border-bottom: 2px solid #e2e8f0;">Practice Questions</h4>
                
                ${questionsWithAnswers.map((q, index) => `
                    <div class="session-question-item" style="margin-bottom: 25px; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px; background: white; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px;">
                            <div style="flex: 1;">
                                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
                                    <span style="background: #4f46e5; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.85rem; font-weight: 600;">
                                        ${index + 1}
                                    </span>
                                    <div style="font-weight: 600; color: #334155; font-size: 1.1rem; line-height: 1.4;">${q.question_text}</div>
                                </div>
                                <div style="display: flex; gap: 10px; margin-left: 38px; margin-top: 8px;">
                                    ${q.category_name ? `
                                        <span style="background: #f1f5f9; color: #64748b; padding: 4px 12px; border-radius: 12px; font-size: 0.8rem;">
                                            <i class="fas fa-tag" style="margin-right: 4px;"></i>${q.category_name}
                                        </span>
                                    ` : ''}
                                    ${q.company_name ? `
                                        <span style="background: #f1f5f9; color: #64748b; padding: 4px 12px; border-radius: 12px; font-size: 0.8rem;">
                                            <i class="fas fa-building" style="margin-right: 4px;"></i>${q.company_name}
                                        </span>
                                    ` : ''}
                                    ${q.role_title ? `
                                        <span style="background: #f1f5f9; color: #64748b; padding: 4px 12px; border-radius: 12px; font-size: 0.8rem;">
                                            <i class="fas fa-briefcase" style="margin-right: 4px;"></i>${q.role_title}
                                        </span>
                                    ` : ''}
                                </div>
                            </div>
                            <button class="btn btn-sm btn-danger" onclick="removeQuestionFromSession(${session.id}, ${q.id})">
                                <i class="fas fa-times"></i> Remove
                            </button>
                        </div>
                        
                        ${q.answers && q.answers.length > 0 ? `
                            <div style="margin-top: 20px; padding-left: 38px;">
                                <h5 style="color: #475569; margin-bottom: 15px; font-size: 1rem; display: flex; align-items: center; gap: 8px;">
                                    <i class="fas fa-comments" style="color: #10b981;"></i>
                                    Answers (${q.answers.length})
                                </h5>
                                <div style="display: flex; flex-direction: column; gap: 12px;">
                                    ${q.answers.map((answer, ansIndex) => `
                                        <div style="padding: 15px; background: #f8fafc; border-radius: 8px; border-left: 3px solid #10b981; position: relative;">
                                            <div style="color: #334155; margin-bottom: 8px; line-height: 1.5;">${answer.answer_text}</div>
                                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                                <div style="font-size: 0.8rem; color: #64748b;">
                                                    <i class="fas fa-clock" style="margin-right: 4px;"></i>
                                                    Added: ${new Date(answer.created_at).toLocaleDateString()}
                                                </div>
                                                <div style="display: flex; gap: 8px;">
                                                    <button class="btn btn-xs btn-secondary" onclick="editAnswer(${answer.id})">
                                                        <i class="fas fa-edit"></i> Edit
                                                    </button>
                                                    <button class="btn btn-xs btn-danger" onclick="deleteItem('answer', ${answer.id})">
                                                        <i class="fas fa-trash"></i> Delete
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        ` : `
                            <div style="margin-top: 15px; padding-left: 38px;">
                                <div style="background: #fef2f2; border: 1px dashed #fca5a5; border-radius: 8px; padding: 15px; text-align: center;">
                                    <i class="fas fa-exclamation-circle" style="color: #dc2626; margin-bottom: 8px;"></i>
                                    <div style="color: #dc2626; font-size: 0.9rem; margin-bottom: 5px;">No answers added yet</div>
                                    <button class="btn btn-sm btn-primary" onclick="addAnswerToQuestion(${q.id})">
                                        <i class="fas fa-plus"></i> Add Answer
                                    </button>
                                </div>
                            </div>
                        `}
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function populateDropdowns() {
    populateDropdown('filterCategory', currentState.categories, 'name');
    populateDropdown('filterCompany', currentState.companies, 'name');
    populateDropdown('filterRole', currentState.roles, 'title');
    populateDropdown('categorySelect', currentState.categories, 'name');
    populateDropdown('companySelect', currentState.companies, 'name');
    populateDropdown('roleSelect', currentState.roles, 'title');
    populateDropdown('modalSessionCompany', currentState.companies, 'name');
    populateDropdown('modalSessionRole', currentState.roles, 'title');
}

function populateDropdown(elementId, items, nameField) {
    const element = document.getElementById(elementId);
    if (!element) {
        console.log(`Dropdown element not found: ${elementId}`);
        return;
    }
    
    // Keep first option
    const firstOption = element.options[0];
    element.innerHTML = firstOption ? firstOption.outerHTML : '<option value="">Select</option>';
    
    items.forEach(item => {
        const option = document.createElement('option');
        option.value = item.id;
        option.textContent = item[nameField];
        element.appendChild(option);
    });
}

// ==================== FORM HANDLERS ====================

function setupEventListeners() {
    console.log('Setting up event listeners...');
    
    // Question Form
    const questionForm = document.getElementById('questionForm');
    if (questionForm) {
        console.log('Found question form');
        questionForm.addEventListener('submit', handleQuestionSubmit);
    } else {
        console.error('Question form not found!');
    }
    
    // Answer Form
    const answerForm = document.getElementById('answerForm');
    if (answerForm) {
        console.log('Found answer form');
        answerForm.addEventListener('submit', handleAnswerSubmit);
    } else {
        console.error('Answer form not found!');
    }
    
    // Category Form
    const categoryForm = document.getElementById('categoryForm');
    if (categoryForm) {
        categoryForm.addEventListener('submit', handleCategorySubmit);
    }
    
    // Company Form
    const companyForm = document.getElementById('companyForm');
    if (companyForm) {
        companyForm.addEventListener('submit', handleCompanySubmit);
    }
    
    // Role Form
    const roleForm = document.getElementById('roleForm');
    if (roleForm) {
        roleForm.addEventListener('submit', handleRoleSubmit);
    }
    
    // Session Form
    const sessionForm = document.getElementById('sessionForm');
    if (sessionForm) {
        sessionForm.addEventListener('submit', handleSessionSubmit);
    }
    
    // Close modals on outside click
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            closeModal(e.target.id);
        }
    });
    
    // Search on enter
    const searchInput = document.getElementById('searchQuestion');
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') loadQuestions();
        });
    }
}

async function handleQuestionSubmit(e) {
    e.preventDefault();
    console.log('Question form submitted');
    
    const mode = document.getElementById('questionMode').value;
    const categoryId = document.getElementById('categorySelect').value;
    const companyId = document.getElementById('companySelect').value;
    const roleId = document.getElementById('roleSelect').value;
    
    if (!categoryId) {
        alert('Category is required');
        return;
    }
    
    try {
        const questionId = document.getElementById('questionId').value;
        
        if (questionId) {
            // Update single question (editing mode)
            const questionData = {
                question_text: document.getElementById('questionText').value.trim(),
                category_id: categoryId || null,
                company_id: companyId || null,
                role_id: roleId || null
            };
            
            if (!questionData.question_text) {
                alert('Question text is required');
                return;
            }
            
            await apiRequest(`/questions/${questionId}`, {
                method: 'PUT',
                body: JSON.stringify(questionData)
            });
            alert('Question updated successfully!');
            
        } else if (mode === 'single') {
            // Add single question
            const questionText = document.getElementById('questionText').value.trim();
            
            if (!questionText) {
                alert('Question text is required');
                return;
            }
            
            const questionData = {
                question_text: questionText,
                category_id: categoryId || null,
                company_id: companyId || null,
                role_id: roleId || null
            };
            
            await apiRequest('/questions', {
                method: 'POST',
                body: JSON.stringify(questionData)
            });
            alert('Question added successfully!');
            
        } else if (mode === 'batch') {
            // Add multiple questions
            const batchText = document.getElementById('batchQuestionsText').value;
            const questions = batchText.split('\n')
                .map(q => q.trim())
                .filter(q => q.length > 0);
            
            if (questions.length === 0) {
                alert('Please enter at least one question');
                return;
            }
            
            if (questions.length > 50) {
                alert(`You entered ${questions.length} questions. Maximum batch size is 50 questions at once.`);
                return;
            }
            
            // Create all questions
            const createPromises = questions.map(questionText => {
                const questionData = {
                    question_text: questionText,
                    category_id: categoryId || null,
                    company_id: companyId || null,
                    role_id: roleId || null
                };
                
                return apiRequest('/questions', {
                    method: 'POST',
                    body: JSON.stringify(questionData)
                });
            });
            
            // Show loading message
            const submitBtn = document.getElementById('submitBtn');
            const originalText = submitBtn.textContent;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
            submitBtn.disabled = true;
            
            // Wait for all to complete
            await Promise.all(createPromises);
            
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
            
            alert(`Successfully added ${questions.length} questions!`);
        }
        
        closeModal('questionModal');
        await loadAllData();
        
    } catch (error) {
        console.error('Failed to save question(s):', error);
        alert(`Failed to save: ${error.message}`);
        
        // Reset submit button if in batch mode
        const submitBtn = document.getElementById('submitBtn');
        submitBtn.textContent = mode === 'single' ? 'Save Question' : 'Save All Questions';
        submitBtn.disabled = false;
    }
}
async function handleAnswerSubmit(e) {
    e.preventDefault();
    console.log('Answer form submitted');
    
    if (!currentState.selectedQuestionId) {
        alert('Please select a question first');
        return;
    }
    
    const answerText = document.getElementById('answerText').value.trim();
    if (!answerText) {
        alert('Answer text is required');
        return;
    }
    
    try {
        const answerId = document.getElementById('answerId').value;
        if (answerId) {
            // Update answer
            await apiRequest(`/answers/${answerId}`, {
                method: 'PUT',
                body: JSON.stringify({ answer_text: answerText })
            });
            alert('Answer updated successfully!');
        } else {
            // Create answer
            await apiRequest(`/answers/question/${currentState.selectedQuestionId}`, {
                method: 'POST',
                body: JSON.stringify({ answer_text: answerText })
            });
            alert('Answer added successfully!');
        }
        
        closeModal('answerModal');
        // Force reload with correct ordering
        await loadAnswers(currentState.selectedQuestionId);
        
    } catch (error) {
        console.error('Failed to save answer:', error);
        alert(`Failed to save answer: ${error.message}`);
    }
}

async function handleCategorySubmit(e) {
    e.preventDefault();
    
    const name = document.getElementById('modalCategoryName').value.trim();
    if (!name) {
        alert('Category name is required');
        return;
    }
    
    try {
        const categoryId = document.getElementById('categoryId').value;
        if (categoryId) {
            await apiRequest(`/categories/${categoryId}`, {
                method: 'PUT',
                body: JSON.stringify({ name })
            });
            alert('Category updated successfully!');
        } else {
            await apiRequest('/categories', {
                method: 'POST',
                body: JSON.stringify({ name })
            });
            alert('Category added successfully!');
        }
        
        closeModal('categoryModal');
        await loadAllData();
    } catch (error) {
        console.error('Failed to save category:', error);
        alert(`Failed to save category: ${error.message}`);
    }
}

async function handleCompanySubmit(e) {
    e.preventDefault();
    
    const name = document.getElementById('modalCompanyName').value.trim();
    if (!name) {
        alert('Company name is required');
        return;
    }
    
    try {
        const companyId = document.getElementById('companyId').value;
        if (companyId) {
            await apiRequest(`/companies/${companyId}`, {
                method: 'PUT',
                body: JSON.stringify({ name })
            });
            alert('Company updated successfully!');
        } else {
            await apiRequest('/companies', {
                method: 'POST',
                body: JSON.stringify({ name })
            });
            alert('Company added successfully!');
        }
        
        closeModal('companyModal');
        await loadAllData();
    } catch (error) {
        console.error('Failed to save company:', error);
        alert(`Failed to save company: ${error.message}`);
    }
}

async function handleRoleSubmit(e) {
    e.preventDefault();
    
    const title = document.getElementById('modalRoleTitle').value.trim();
    if (!title) {
        alert('Role title is required');
        return;
    }
    
    try {
        const roleId = document.getElementById('roleId').value;
        if (roleId) {
            await apiRequest(`/roles/${roleId}`, {
                method: 'PUT',
                body: JSON.stringify({ title })
            });
            alert('Role updated successfully!');
        } else {
            await apiRequest('/roles', {
                method: 'POST',
                body: JSON.stringify({ title })
            });
            alert('Role added successfully!');
        }
        
        closeModal('roleModal');
        await loadAllData();
    } catch (error) {
        console.error('Failed to save role:', error);
        alert(`Failed to save role: ${error.message}`);
    }
}

async function handleSessionSubmit(e) {
    e.preventDefault();
    
    const sessionData = {
        name: document.getElementById('modalSessionName').value.trim(),
        company_id: document.getElementById('modalSessionCompany').value || null,
        role_id: document.getElementById('modalSessionRole').value || null
    };
    
    if (!sessionData.name) {
        alert('Session name is required');
        return;
    }
    
    try {
        const sessionId = document.getElementById('sessionId').value;
        if (sessionId) {
            await apiRequest(`/sessions/${sessionId}`, {
                method: 'PUT',
                body: JSON.stringify(sessionData)
            });
            alert('Session updated successfully!');
        } else {
            await apiRequest('/sessions', {
                method: 'POST',
                body: JSON.stringify(sessionData)
            });
            alert('Session created successfully!');
        }
        
        closeModal('sessionModal');
        await loadAllData();
    } catch (error) {
        console.error('Failed to save session:', error);
        alert(`Failed to save session: ${error.message}`);
    }
}

// ==================== MORE GLOBAL FUNCTIONS ====================

window.editQuestion = async function(questionId) {
    try {
        const question = await apiRequest(`/questions/${questionId}`);
        if (question) {
            showQuestionModal(question);
        }
    } catch (error) {
        console.error('Failed to load question for editing:', error);
        alert('Failed to load question for editing');
    }
};

window.editAnswer = async function(answerId) {
    try {
        const answers = await apiRequest(`/answers/question/${currentState.selectedQuestionId}`);
        const answer = answers.find(a => a.id === answerId);
        if (answer) {
            showAnswerModal(answer);
        }
    } catch (error) {
        console.error('Failed to load answer for editing:', error);
        alert('Failed to load answer for editing');
    }
};

window.editCategory = function(categoryId) {
    const category = currentState.categories.find(c => c.id === categoryId);
    if (category) {
        showCategoryModal(category);
    }
};

window.editCompany = function(companyId) {
    const company = currentState.companies.find(c => c.id === companyId);
    if (company) {
        showCompanyModal(company);
    }
};

window.editRole = function(roleId) {
    const role = currentState.roles.find(r => r.id === roleId);
    if (role) {
        showRoleModal(role);
    }
};

window.editSession = async function(sessionId) {
    try {
        const session = await apiRequest(`/sessions/${sessionId}`);
        if (session) {
            showSessionModal(session);
        }
    } catch (error) {
        console.error('Failed to load session for editing:', error);
        alert('Failed to load session for editing');
    }
};

window.deleteItem = async function(type, id) {
    if (!confirm(`Are you sure you want to delete this ${type}?`)) {
        return;
    }
    
    // Handle irregular plurals
    let endpoint;
    switch(type) {
        case 'category':
            endpoint = '/categories';
            break;
        case 'company':
            endpoint = '/companies';
            break;
        case 'role':
            endpoint = '/roles';
            break;
        case 'question':
            endpoint = '/questions';
            break;
        case 'answer':
            endpoint = '/answers';
            break;
        case 'session':
            endpoint = '/sessions';
            break;
        default:
            endpoint = `/${type}s`; // Default pluralization
    }
    
    try {
        await apiRequest(`${endpoint}/${id}`, { method: 'DELETE' });
        alert(`${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully!`);
        
        // Reload data
        await loadAllData();
        
        // Clear selections if needed
        if (type === 'question' && currentState.selectedQuestionId === id) {
            currentState.selectedQuestionId = null;
            const answersList = document.getElementById('answersList');
            if (answersList) {
                answersList.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-comment-slash fa-2x"></i>
                        <p>Select a question to view answers</p>
                    </div>
                `;
            }
        }
        if (type === 'session' && currentState.selectedSessionId === id) {
            currentState.selectedSessionId = null;
            const sessionDetails = document.getElementById('sessionDetails');
            if (sessionDetails) {
                sessionDetails.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-hand-pointer fa-2x"></i>
                        <p>Select a session to view details</p>
                    </div>
                `;
            }
        }
    } catch (error) {
        console.error(`Failed to delete ${type}:`, error);
        alert(`Failed to delete ${type}: ${error.message}`);
    }
};

window.selectQuestionForAnswers = function(questionId) {
    console.log('Selecting question for answers:', questionId);
    currentState.selectedQuestionId = questionId;
    loadAnswers(questionId);
    
    // Update UI selection
    document.querySelectorAll('.question-sidebar-item').forEach(item => {
        item.classList.remove('selected');
    });
    event.currentTarget.classList.add('selected');
};

window.viewAnswers = function(questionId) {
    console.log('Viewing answers for question:', questionId);
    switchTab('answers');
    setTimeout(() => selectQuestionForAnswers(questionId), 100);
};

window.selectSession = function(sessionId) {
    currentState.selectedSessionId = sessionId;
    loadSessionDetails(sessionId);
    
    // Update UI selection
    document.querySelectorAll('.session-card').forEach(card => {
        card.classList.remove('selected');
    });
    event.currentTarget.closest('.session-card').classList.add('selected');
};

window.addQuestionToSession = async function(questionId) {
    if (!currentState.selectedSessionId) {
        alert('Please select a session first');
        return;
    }
    
    try {
        await apiRequest(`/sessions/${currentState.selectedSessionId}/questions/${questionId}`, {
            method: 'POST'
        });
        alert('Question added to session!');
        await loadSessionDetails(currentState.selectedSessionId);
    } catch (error) {
        console.error('Failed to add question to session:', error);
        alert(`Failed to add question to session: ${error.message}`);
    }
};

window.removeQuestionFromSession = async function(sessionId, questionId) {
    try {
        await apiRequest(`/sessions/${sessionId}/questions/${questionId}`, {
            method: 'DELETE'
        });
        alert('Question removed from session!');
        await loadSessionDetails(sessionId);
    } catch (error) {
        console.error('Failed to remove question from session:', error);
        alert(`Failed to remove question from session: ${error.message}`);
    }
};

window.applyFilters = function() {
    loadQuestions();
};

// Tab Navigation
function setupTabNavigation() {
    const tabs = document.querySelectorAll('.tab-button');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.dataset.tab;
            switchTab(tabName);
        });
    });
}

function switchTab(tabName) {
    // Update active tab button
    document.querySelectorAll('.tab-button').forEach(tab => {
        tab.classList.remove('active');
        if (tab.dataset.tab === tabName) {
            tab.classList.add('active');
        }
    });
    
    // Show active tab pane
    document.querySelectorAll('.tab-pane').forEach(pane => {
        pane.classList.remove('active');
        if (pane.id === `${tabName}-tab`) {
            pane.classList.add('active');
        }
    });
}

window.addAnswerToQuestion = function(questionId) {
    console.log('Adding answer to question:', questionId);
    
    // Switch to the Answers tab first
    switchTab('answers');
    
    // After switching, select the question and show modal
    setTimeout(() => {
        currentState.selectedQuestionId = questionId;
        loadAnswers(questionId);
        
        // Show the answer modal
        setTimeout(() => {
            showAnswerModal();
        }, 300);
    }, 100);
};