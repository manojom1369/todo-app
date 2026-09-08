// Local Storage Manager
const StorageManager = {
    STORAGE_KEY: 'todos',
    
    getTodos() {
        const todos = localStorage.getItem(this.STORAGE_KEY);
        return todos ? JSON.parse(todos) : [];
    },
    
    saveTodos(todos) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(todos));
    },
    
    addTodo(text) {
        const todos = this.getTodos();
        const newTodo = {
            id: Date.now(),
            text: text,
            completed: false,
            createdAt: new Date().toISOString()
        };
        todos.push(newTodo);
        this.saveTodos(todos);
        return newTodo;
    },
    
    removeTodo(id) {
        const todos = this.getTodos().filter(todo => todo.id !== id);
        this.saveTodos(todos);
    },
    
    updateTodo(id, text) {
        const todos = this.getTodos();
        const todo = todos.find(t => t.id === id);
        if (todo) {
            todo.text = text;
            this.saveTodos(todos);
        }
    },
    
    toggleTodo(id) {
        const todos = this.getTodos();
        const todo = todos.find(t => t.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            this.saveTodos(todos);
        }
    },
    
    clearCompleted() {
        const todos = this.getTodos().filter(todo => !todo.completed);
        this.saveTodos(todos);
    },
    
    deleteAll() {
        localStorage.removeItem(this.STORAGE_KEY);
    }
};

// UI Manager
const UIManager = {
    todoInput: document.getElementById('todoInput'),
    addBtn: document.getElementById('addBtn'),
    todoList: document.getElementById('todoList'),
    clearBtn: document.getElementById('clearBtn'),
    deleteAllBtn: document.getElementById('deleteAllBtn'),
    filterBtns: document.querySelectorAll('.filter-btn'),
    totalCount: document.getElementById('totalCount'),
    activeCount: document.getElementById('activeCount'),
    completedCount: document.getElementById('completedCount'),
    
    currentFilter: 'all',
    
    init() {
        this.addEventListeners();
        this.renderTodos();
        this.updateStats();
    },
    
    addEventListeners() {
        this.addBtn.addEventListener('click', () => this.handleAddTodo());
        this.todoInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleAddTodo();
        });
        
        this.clearBtn.addEventListener('click', () => this.handleClearCompleted());
        this.deleteAllBtn.addEventListener('click', () => this.handleDeleteAll());
        
        this.filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.filterBtns.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentFilter = e.target.dataset.filter;
                this.renderTodos();
            });
        });
    },
    
    handleAddTodo() {
        const text = this.todoInput.value.trim();
        if (text === '') {
            alert('Please enter a task!');
            return;
        }
        
        StorageManager.addTodo(text);
        this.todoInput.value = '';
        this.todoInput.focus();
        this.renderTodos();
        this.updateStats();
    },
    
    handleDeleteTodo(id) {
        if (confirm('Are you sure you want to delete this task?')) {
            StorageManager.removeTodo(id);
            this.renderTodos();
            this.updateStats();
        }
    },
    
    handleToggleTodo(id) {
        StorageManager.toggleTodo(id);
        this.renderTodos();
        this.updateStats();
    },
    
    handleEditTodo(id) {
        const todos = StorageManager.getTodos();
        const todo = todos.find(t => t.id === id);
        
        if (!todo) return;
        
        const newText = prompt('Edit task:', todo.text);
        if (newText !== null && newText.trim() !== '') {
            StorageManager.updateTodo(id, newText.trim());
            this.renderTodos();
        }
    },
    
    handleClearCompleted() {
        if (confirm('Clear all completed tasks?')) {
            StorageManager.clearCompleted();
            this.renderTodos();
            this.updateStats();
        }
    },
    
    handleDeleteAll() {
        if (confirm('Delete all tasks? This cannot be undone!')) {
            StorageManager.deleteAll();
            this.renderTodos();
            this.updateStats();
        }
    },
    
    getFilteredTodos() {
        const todos = StorageManager.getTodos();
        
        switch(this.currentFilter) {
            case 'active':
                return todos.filter(todo => !todo.completed);
            case 'completed':
                return todos.filter(todo => todo.completed);
            default:
                return todos;
        }
    },
    
    renderTodos() {
        const filteredTodos = this.getFilteredTodos();
        this.todoList.innerHTML = '';
        
        if (filteredTodos.length === 0) {
            this.todoList.innerHTML = `
                <div class="empty-state">
                    <p>No tasks yet. Add one to get started!</p>
                </div>
            `;
            return;
        }
        
        filteredTodos.forEach(todo => {
            const li = document.createElement('li');
            li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
            li.innerHTML = `
                <input 
                    type="checkbox" 
                    class="todo-checkbox" 
                    ${todo.completed ? 'checked' : ''}
                    onchange="UIManager.handleToggleTodo(${todo.id})"
                >
                <span class="todo-text">${this.escapeHtml(todo.text)}</span>
                <div class="action-buttons">
                    <button class="edit-btn" onclick="UIManager.handleEditTodo(${todo.id})">Edit</button>
                    <button class="delete-btn" onclick="UIManager.handleDeleteTodo(${todo.id})">Delete</button>
                </div>
            `;
            this.todoList.appendChild(li);
        });
    },
    
    updateStats() {
        const todos = StorageManager.getTodos();
        const completed = todos.filter(t => t.completed).length;
        const active = todos.length - completed;
        
        this.totalCount.innerHTML = `Total: <strong>${todos.length}</strong>`;
        this.activeCount.innerHTML = `Active: <strong>${active}</strong>`;
        this.completedCount.innerHTML = `Completed: <strong>${completed}</strong>`;
    },
    
    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }
};

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    UIManager.init();
});
