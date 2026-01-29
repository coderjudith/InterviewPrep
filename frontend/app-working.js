// Configuration
const API_BASE_URL = 'http://localhost:3001/api';
let currentState = {
    selectedQuestionId: null,
    selectedSessionId: null,
    categories: [],
    companies: [],
    roles: [],
    questions: [],
    sessions: []
};

// ==================== GLOBAL FUNCTIONS ====================

// Modal functions
window.showQuestionModal = function(question = null) {
    console.log('showQuestionModal called', question);
    
    if (question) {
        document.getElementById('questionModalTitle').textContent = 'Edit Question';
        document.getElementById('questionId').value = question.id;
        document.getElementById('questionText').value = question.question_text;
        document.getElementById('categorySelect').value = question.category_id || '';
        document.getElementById('companySelect').value = question.company_id || '';
        document.getElementById('roleSelect').value = question.role_id || '';
    } else {
        document.getElementById('questionModalTitle').textContent = 'Add New Question';
        document.getElementById('questionId').value = '';
        document.getElementById('questionText').value = '';
        document.getElementById('categorySelect').value = '';
        document.getElementById('companySelect').value = '';
        document.getElementById('roleSelect').value = '';
    }
    openModal('questionModal');
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
            apiRequest('/categories'),
            apiRequest('/companies'),
            apiRequest('/roles'),
            apiRequest('/questions'),
            apiRequest('/sessions')
        ]);
        
        currentState.categories = categories;
        currentState.companies = companies;
        currentState.roles = roles;
        currentState.questions = questions;
        currentState.sessions = sessions;
        
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
        
        const queryString = query.toString();
        const endpoint = queryString ? `/questions?${queryString}` : '/questions';
        
        currentState.questions = await apiRequest(endpoint);
        renderQuestions();
        renderQuestionsForAnswers();
    } catch (error) {
        console.error('Failed to load questions:', error);
    }
}

async function loadAnswers(questionId) {
    try {
        console.log(`Loading answers for question ${questionId}`);
        const answers = await apiRequest(`/answers/question/${questionId}`);
        renderAnswers(answers);
        
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
        const [session, questions] = await Promise.all([
            apiRequest(`/sessions/${sessionId}`),
            apiRequest(`/questions/session/${sessionId}`)
        ]);
        
        renderSessionDetails(session, questions);
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
                ${currentState.selectedSessionId ? `
                    <button class="btn btn-sm btn-primary" onclick="addQuestionToSession(${question.id})">
                        <i class="fas fa-plus"></i> Add to Session
                    </button>
                ` : ''}
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

function renderSessionDetails(session, questions) {
    const sessionDetails = document.getElementById('sessionDetails');
    if (!sessionDetails) return;
    
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
            
            <div class="session-questions">
                <h4 style="color: #475569; margin-bottom: 15px;">Questions (${questions.length})</h4>
                ${questions.length ? questions.map(q => `
                    <div class="session-question-item">
                        <div>
                            <div style="font-weight: 600; margin-bottom: 5px;">${q.question_text}</div>
                            <div style="font-size: 0.9rem; color: #64748b;">
                                ${q.category_name ? `Category: ${q.category_name}` : ''}
                            </div>
                        </div>
                        <button class="btn btn-sm btn-danger" onclick="removeQuestionFromSession(${session.id}, ${q.id})">
                            <i class="fas fa-times"></i> Remove
                        </button>
                    </div>
                `).join('') : `
                    <div class="empty-state" style="padding: 30px;">
                        <i class="fas fa-question-circle fa-2x"></i>
                        <p>No questions in this session yet</p>
                    </div>
                `}
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
    
    const questionData = {
        question_text: document.getElementById('questionText').value.trim(),
        category_id: document.getElementById('categorySelect').value || null,
        company_id: document.getElementById('companySelect').value || null,
        role_id: document.getElementById('roleSelect').value || null
    };
    
    console.log('Question data:', questionData);
    
    if (!questionData.question_text) {
        alert('Question text is required');
        return;
    }
    
    try {
        const questionId = document.getElementById('questionId').value;
        if (questionId) {
            // Update question
            await apiRequest(`/questions/${questionId}`, {
                method: 'PUT',
                body: JSON.stringify(questionData)
            });
            alert('Question updated successfully!');
        } else {
            // Create question
            await apiRequest('/questions', {
                method: 'POST',
                body: JSON.stringify(questionData)
            });
            alert('Question added successfully!');
        }
        
        closeModal('questionModal');
        await loadAllData();
        
    } catch (error) {
        console.error('Failed to save question:', error);
        alert(`Failed to save question: ${error.message}`);
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
    
    try {
        await apiRequest(`/${type}s/${id}`, { method: 'DELETE' });
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