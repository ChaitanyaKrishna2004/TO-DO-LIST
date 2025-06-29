const API_URL = 'https://6860da0a8e7486408444276c.mockapi.io/To-Do-List';

const username = localStorage.getItem("username") || "User";
document.querySelector('.username').textContent = username;

const avatarUrl = `https://ui-avatars.com/api/?background=0D8ABC&color=fff&name=${encodeURIComponent(username)}`;
const avatarElement = document.querySelector('.user-avatar');
avatarElement.style.backgroundImage = `url(${avatarUrl})`;
avatarElement.style.backgroundSize = 'cover';
avatarElement.style.backgroundPosition = 'center';

avatarElement.textContent = '';

let tasks = [];

let currentTab = 'todo';
let taskIdCounter = 5;

function getAuthHeaders() {
    return {
        'Content-Type': 'application/json'
    };
}

async function fetchTasks() {
    try {
        const response = await fetch(API_URL, {
            method: 'GET',
            headers: getAuthHeaders()
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const fetchedTasks = await response.json();
        tasks = fetchedTasks;
        console.log('Tasks loaded from API:', tasks);
        updateCounts();
        renderTasks();
    } catch (error) {
        console.error('Error fetching tasks:', error);
        tasks = [
            {
                id: 1,
                title: "Do something nice for someone you care about",
                status: "todo",
                lastModified: new Date().toLocaleString()
            },
            {
                id: 2,
                title: "Memorize a poem",
                status: "todo",
                lastModified: new Date().toLocaleString()
            }
        ];
        console.log('Using fallback tasks');
        updateCounts();
        renderTasks();
    }
}

async function addTask() {
    const input = document.getElementById('taskInput');
    const title = input.value.trim();

    if (!title) return;

    const newTask = {
        title: title,
        status: 'todo',
        lastModified: new Date().toLocaleString()
    };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(newTask)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const createdTask = await response.json();
        tasks.push(createdTask);
    } catch (error) {
        console.error('Error adding task via API:', error);
        newTask.id = taskIdCounter++;
        tasks.push(newTask);
    }

    input.value = '';
    updateCounts();
    renderTasks();
}

async function updateTaskStatus(id, status) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    const updatedTask = {
        ...task,
        status: status,
        lastModified: new Date().toLocaleString()
    };

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT', 
            headers: getAuthHeaders(),
            body: JSON.stringify(updatedTask)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const serverTask = await response.json();
        const taskIndex = tasks.findIndex(t => t.id === id);
        if (taskIndex !== -1) {
            tasks[taskIndex] = serverTask;
        }
    } catch (error) {
        console.error('Error updating task via API:', error);
        const taskIndex = tasks.findIndex(t => t.id === id);
        if (taskIndex !== -1) {
            tasks[taskIndex] = updatedTask;
        }
    }

    updateCounts();
    renderTasks();
}

function completeTask(id) {
    updateTaskStatus(id, 'completed');
}

function archiveTask(id) {
    updateTaskStatus(id, 'archived');
}

async function deleteTask(id) {
    if (!confirm('Are you sure you want to delete this task?')) return;
    
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        tasks = tasks.filter(t => t.id !== id);
    } catch (error) {
        console.error('Error deleting task via API:', error);
        tasks = tasks.filter(t => t.id !== id);
    }
    
    updateCounts();
    renderTasks();
}

async function editTask(id, newTitle) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    const updatedTask = {
        ...task,
        title: newTitle,
        lastModified: new Date().toLocaleString()
    };

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PATCH',
            headers: getAuthHeaders(),
            body: JSON.stringify({ 
                title: newTitle,
                lastModified: updatedTask.lastModified
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const serverTask = await response.json();
        const taskIndex = tasks.findIndex(t => t.id === id);
        if (taskIndex !== -1) {
            tasks[taskIndex] = serverTask;
        }
    } catch (error) {
        console.error('Error editing task via API:', error);
        const taskIndex = tasks.findIndex(t => t.id === id);
        if (taskIndex !== -1) {
            tasks[taskIndex] = updatedTask;
        }
    }
    
    updateCounts();
    renderTasks();
}

function renderTasks() {
    const taskList = document.getElementById('taskList');
    const emptyState = document.getElementById('emptyState');

    const filteredTasks = tasks.filter(task => task.status === currentTab);

    if (filteredTasks.length === 0) {
        taskList.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }

    taskList.style.display = 'flex';
    emptyState.style.display = 'none';

    taskList.innerHTML = filteredTasks.map(task => `
        <div class="task-item" data-id="${task.id}">
            <div class="task-content">
                <div class="task-title">${task.title}</div>
                <div class="task-meta">Last modified at: ${task.lastModified}</div>
            </div>
            <div class="task-actions">
                ${getTaskActions(task)}
            </div>
        </div>
    `).join('');
}

function getTaskActions(task) {
    switch(task.status) {
        case 'todo':
            return `
                <button class="action-btn complete-btn" onclick="completeTask(${task.id})">
                    Mark it as completed
                </button>
                <button class="action-btn archive-btn" onclick="archiveTask(${task.id})">
                    📁 Archive
                </button>
                <button class="action-btn edit-btn" onclick="startEdit(${task.id})">
                    ✏️ Edit
                </button>
                <button class="action-btn delete-btn" onclick="deleteTask(${task.id})">
                    🗑️ Delete
                </button>
            `;
        case 'completed':
            return `
                <button class="action-btn archive-btn" onclick="archiveTask(${task.id})">
                    📁 Archive
                </button>
                <button class="action-btn delete-btn" onclick="deleteTask(${task.id})">
                    🗑️ Delete
                </button>
            `;
        case 'archived':
            return `
                <button class="action-btn delete-btn" onclick="deleteTask(${task.id})">
                    🗑️ Delete
                </button>
            `;
        default:
            return '';
    }
}

function updateCounts() {
    document.getElementById('todoCount').textContent = tasks.filter(t => t.status === 'todo').length;
    document.getElementById('completedCount').textContent = tasks.filter(t => t.status === 'completed').length;
    document.getElementById('archivedCount').textContent = tasks.filter(t => t.status === 'archived').length;
}

function startEdit(id) {
    const taskItem = document.querySelector(`[data-id="${id}"]`);
    const taskTitle = taskItem.querySelector('.task-title');
    const currentTitle = taskTitle.textContent;
    
    taskTitle.innerHTML = `
        <input type="text" class="edit-input" value="${currentTitle}" 
               onblur="saveEdit(${id})" 
               onkeypress="handleEditKeypress(event, ${id})">
    `;
    
    const input = taskTitle.querySelector('.edit-input');
    input.focus();
    input.select();
}

function saveEdit(id) {
    const taskItem = document.querySelector(`[data-id="${id}"]`);
    const input = taskItem.querySelector('.edit-input');
    const newTitle = input.value.trim();
    
    if (newTitle && newTitle !== input.defaultValue) {
        editTask(id, newTitle);
    } else {
        renderTasks(); 
    }
}

function handleEditKeypress(event, id) {
    if (event.key === 'Enter') {
        saveEdit(id);
    } else if (event.key === 'Escape') {
        renderTasks();
    }
}

document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', function() {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        this.classList.add('active');
        currentTab = this.dataset.tab;
        renderTasks();
    });
});

document.getElementById('taskInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        addTask();
    }
});

document.querySelector('.sign-out-btn').addEventListener('click', function() {
    localStorage.removeItem('username');
    localStorage.removeItem('authToken');
    localStorage.clear();
    
    window.location.href = "index.html";
});

document.addEventListener('DOMContentLoaded', function() {
    fetchTasks();
});


document.addEventListener("DOMContentLoaded", function() {
    const signOutBtn = document.querySelector(".sign-out-btn");
    if (signOutBtn) {
        signOutBtn.addEventListener("click", function() {
            localStorage.removeItem("username");
            window.location.href = "index.html"; 
        });
    }
});
