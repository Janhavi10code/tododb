const API_URL = 'http://localhost:8080/api/tasks';

document.addEventListener('DOMContentLoaded', () => {
    fetchTasks();

    document.getElementById('task-form').addEventListener('submit', async (e) => {
        e.preventDefault();

        // Request notification permission immediately when user interacts (browser requires user gesture)
        if ("Notification" in window && Notification.permission === "default") {
            await Notification.requestPermission();
        }

        const title = document.getElementById('task-title').value;
        const description = document.getElementById('task-desc').value;
        const timeInput = document.getElementById('task-time').value;

        const task = {
            title,
            description,
            completed: false,
            reminderTime: timeInput ? timeInput : null
        };

        await createTask(task);
        document.getElementById('task-form').reset();
    });



    // Check for upcoming tasks every 10 seconds
    setInterval(checkReminders, 10000);
});

async function fetchTasks() {
    try {
        const response = await fetch(API_URL);
        const tasks = await response.json();
        renderTasks(tasks);
    } catch (error) {
        console.error('Error fetching tasks:', error);
    }
}

async function createTask(task) {
    try {
        await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(task)
        });
        fetchTasks();

        if (Notification.permission === "granted") {
            new Notification("Task Created", {
                body: `Task "${task.title}" has been created successfully!`,
                icon: "https://cdn-icons-png.flaticon.com/512/1077/1077114.png"
            });
        }
    } catch (error) {
        console.error('Error creating task:', error);
    }
}

async function toggleTaskStatus(id, task) {
    try {
        task.completed = !task.completed;
        await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(task)
        });
        fetchTasks();
    } catch (error) {
        console.error('Error updating task:', error);
    }
}

async function deleteTask(id) {
    try {
        await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });
        fetchTasks();
    } catch (error) {
        console.error('Error deleting task:', error);
    }
}

function renderTasks(tasks) {
    const container = document.getElementById('tasks-container');
    container.innerHTML = '';

    tasks.forEach(task => {
        const div = document.createElement('div');
        div.className = `task-item ${task.completed ? 'completed' : ''}`;

        const dateStr = task.reminderTime ? new Date(task.reminderTime).toLocaleString() : 'No reminder';

        div.innerHTML = `
            <div class="task-content">
                <span class="task-title">${task.title}</span>
                <span class="task-desc">${task.description || ''}</span>
                <span class="task-time">⏰ ${dateStr}</span>
            </div>
            <div class="task-actions">
                <button onclick='toggleTaskStatus(${task.id}, ${JSON.stringify(task)})'>${task.completed ? '❌' : '✅'}</button>
                <button onclick="deleteTask(${task.id})">🗑️</button>
            </div>
        `;
        container.appendChild(div);
    });
}

const notifiedTasks = new Set();

async function checkReminders() {
    if (Notification.permission !== "granted") return;

    try {
        const response = await fetch(API_URL);
        const tasks = await response.json();
        const now = new Date();

        tasks.forEach(task => {
            if (!task.completed && task.reminderTime) {
                const reminderTime = new Date(task.reminderTime);

                // If current time is past or equal to reminder time, and we haven't notified yet
                if (now.getTime() >= reminderTime.getTime() && !notifiedTasks.has(task.id)) {
                    new Notification("Task Reminder", {
                        body: `${task.title} is due now!`,
                        icon: "https://cdn-icons-png.flaticon.com/512/1077/1077114.png"
                    });
                    notifiedTasks.add(task.id);
                }
            }
        });
    } catch (error) {
        console.error('Error checking reminders:', error);
    }
}
