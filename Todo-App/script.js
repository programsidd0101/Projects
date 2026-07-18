// ==========================================
// DOM ELEMENTS
// ==========================================

const taskInput = document.getElementById('taskInput');
const addBtn = document.getElementById('addBtn');
const taskList = document.getElementById('taskList');
const emptyState = document.getElementById('emptyState');
const taskCounter = document.getElementById('taskCount');
const completedCounter = document.getElementById('completedCount');
const clearCompletedBtn = document.getElementById('clearCompletedBtn');

// ==========================================
// LOCAL STORAGE KEY
// ==========================================

const STORAGE_KEY = 'todoListTasks';

// ==========================================
// INITIALIZE APPLICATION
// ==========================================

/**
 * Initialize the application
 * Load tasks from localStorage and set up event listeners
 */
function init() {
    // Load tasks from localStorage
    loadTasks();

    // Add event listeners
    addBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTask();
        }
    });
    clearCompletedBtn.addEventListener('click', clearCompleted);

    // Update counter and UI on page load
    updateUI();
}

// ==========================================
// TASK MANAGEMENT FUNCTIONS
// ==========================================

/**
 * Add a new task
 * Prevents empty tasks and updates UI
 */
function addTask() {
    const taskText = taskInput.value.trim();

    // Validate: prevent empty tasks
    if (taskText === '') {
        taskInput.focus();
        return;
    }

    // Create task object
    const task = {
        id: Date.now(), // Use timestamp as unique ID
        text: taskText,
        completed: false,
        createdAt: new Date().toLocaleString()
    };

    // Add task to DOM
    addTaskToDOM(task);

    // Save to localStorage
    saveTasks();

    // Clear input and focus
    taskInput.value = '';
    taskInput.focus();

    // Update UI
    updateUI();
}

/**
 * Add task element to the DOM
 * @param {Object} task - The task object
 */
function addTaskToDOM(task) {
    // Create list item
    const li = document.createElement('li');
    li.className = 'task-item';
    li.id = `task-${task.id}`;

    if (task.completed) {
        li.classList.add('completed');
    }

    // Create task content
    li.innerHTML = `
        <input 
            type="checkbox" 
            class="task-checkbox" 
            ${task.completed ? 'checked' : ''}
            aria-label="Mark task as ${task.completed ? 'incomplete' : 'complete'}"
        >
        <span class="task-text">${escapeHtml(task.text)}</span>
        <button class="delete-btn" aria-label="Delete task: ${task.text}">
            Delete
        </button>
    `;

    // Add event listeners
    const checkbox = li.querySelector('.task-checkbox');
    const taskText = li.querySelector('.task-text');
    const deleteBtn = li.querySelector('.delete-btn');

    checkbox.addEventListener('change', () => toggleTask(task.id));
    taskText.addEventListener('click', () => toggleTask(task.id));
    deleteBtn.addEventListener('click', () => deleteTask(task.id));

    // Add to DOM
    taskList.appendChild(li);
}

/**
 * Toggle task completion status
 * @param {number} taskId - The task ID
 */
function toggleTask(taskId) {
    const tasks = getTasks();
    const task = tasks.find(t => t.id === taskId);

    if (task) {
        task.completed = !task.completed;
        saveTasks();
        updateUI();
    }
}

/**
 * Delete a task
 * @param {number} taskId - The task ID
 */
function deleteTask(taskId) {
    const taskElement = document.getElementById(`task-${taskId}`);

    // Add fade-out animation
    taskElement.style.animation = 'taskSlideOut 0.3s ease-out';
    taskElement.addEventListener('animationend', () => {
        taskElement.remove();

        // Update storage and UI
        const tasks = getTasks();
        const filteredTasks = tasks.filter(t => t.id !== taskId);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredTasks));
        updateUI();
    });
}

/**
 * Clear all completed tasks
 */
function clearCompleted() {
    const tasks = getTasks();
    const completedTasks = tasks.filter(t => t.completed);

    // Animate removal of completed tasks
    completedTasks.forEach(task => {
        const taskElement = document.getElementById(`task-${task.id}`);
        if (taskElement) {
            taskElement.style.animation = 'taskSlideOut 0.3s ease-out';
            taskElement.addEventListener('animationend', () => {
                taskElement.remove();
            });
        }
    });

    // Update storage
    const remainingTasks = tasks.filter(t => !t.completed);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(remainingTasks));

    // Update UI after animation
    setTimeout(() => {
        updateUI();
    }, 300);
}

// ==========================================
// LOCAL STORAGE FUNCTIONS
// ==========================================

/**
 * Get all tasks from localStorage
 * @returns {Array} Array of task objects
 */
function getTasks() {
    const tasks = localStorage.getItem(STORAGE_KEY);
    return tasks ? JSON.parse(tasks) : [];
}

/**
 * Save tasks to localStorage
 */
function saveTasks() {
    const tasks = getTasks();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

/**
 * Load tasks from localStorage and render them
 */
function loadTasks() {
    const tasks = getTasks();
    taskList.innerHTML = ''; // Clear existing tasks

    tasks.forEach(task => {
        addTaskToDOM(task);
    });
}

// ==========================================
// UI UPDATE FUNCTIONS
// ==========================================

/**
 * Update UI elements
 * - Update task counters
 * - Show/hide empty state
 * - Show/hide clear button
 */
function updateUI() {
    const tasks = getTasks();
    const completedTasks = tasks.filter(t => t.completed).length;
    const totalTasks = tasks.length;

    // Update counters
    taskCounter.textContent = totalTasks;
    completedCounter.textContent = completedTasks;

    // Show/hide empty state
    if (totalTasks === 0) {
        emptyState.classList.add('show');
    } else {
        emptyState.classList.remove('show');
    }

    // Show/hide clear completed button
    if (completedTasks > 0) {
        clearCompletedBtn.style.display = 'block';
    } else {
        clearCompletedBtn.style.display = 'none';
    }
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

/**
 * Escape HTML special characters to prevent XSS
 * @param {string} text - The text to escape
 * @returns {string} Escaped text
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ==========================================
// ADD MISSING CSS ANIMATION
// ==========================================

/**
 * Add taskSlideOut animation to CSS dynamically
 * This animation is used when deleting tasks
 */
const style = document.createElement('style');
style.textContent = `
    @keyframes taskSlideOut {
        from {
            opacity: 1;
            transform: translateX(0);
            max-height: 100px;
        }
        to {
            opacity: 0;
            transform: translateX(-100%);
            max-height: 0;
        }
    }
`;
document.head.appendChild(style);

// ==========================================
// START APPLICATION
// ==========================================

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
