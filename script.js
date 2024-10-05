const taskForm = document.getElementById('task-form');
const tasksList = document.getElementById('tasks');
const doneTasksList = document.getElementById('done-tasks');
const upcomingTasksList = document.getElementById('upcoming-tasks'); // Upcoming tasks list
const tabs = document.querySelectorAll('.tab');
const tabContents = document.querySelectorAll('.tab-content');

// Load tasks from Local Storage on page load
document.addEventListener('DOMContentLoaded', loadTasks);

taskForm.addEventListener('submit', function(e) {
    e.preventDefault();

    const taskName = document.getElementById('task-name').value;
    const taskDeadline = document.getElementById('task-deadline').value;
    const taskTime = document.getElementById('task-time').value; // Added time
    const taskType = document.getElementById('task-type').value; // Added task type

    if (taskName && taskDeadline) {
        const task = {
            name: taskName,
            deadline: taskDeadline,
            time: taskTime,
            type: taskType,
            done: false // Track if the task is done
        };

        // Save the task to Local Storage
        saveTask(task);

        // Reset the form
        taskForm.reset();
    } else {
        alert("Please fill out both fields.");
    }
});

function saveTask(task) {
    // Get existing tasks from Local Storage
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks.push(task); // Add the new task
    localStorage.setItem('tasks', JSON.stringify(tasks)); // Save back to Local Storage
    displayTasks(); // Update the task display
}

function loadTasks() {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks.forEach(task => {
        displayTask(task);
    });
}

function displayTasks() {
    // Clear the lists
    tasksList.innerHTML = '';
    doneTasksList.innerHTML = '';
    upcomingTasksList.innerHTML = '';

    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks.forEach(task => {
        displayTask(task);
    });
}

function displayTask(task) {
    const taskItem = document.createElement('li');
    taskItem.innerHTML = `
        <input type="checkbox" onchange="markAsDone(this)" ${task.done ? 'checked' : ''}>
        ${task.name} - Deadline: ${task.deadline} ${task.time} (${task.type})
    `;

    if (task.done) {
        doneTasksList.appendChild(taskItem); // Add to done tasks if marked as done
    } else {
        tasksList.appendChild(taskItem); // Add to main task list if not done
        upcomingTasksList.appendChild(taskItem.cloneNode(true)); // Add a copy of the task item to upcoming tasks
    }
}

function markAsDone(checkbox) {
    const taskItem = checkbox.parentElement;
    const taskName = taskItem.childNodes[1].nodeValue.trim(); // Get task name

    // Get tasks from Local Storage
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const updatedTasks = tasks.map(task => {
        if (task.name === taskName) {
            task.done = true; // Mark the task as done
            doneTasksList.appendChild(taskItem); // Move to done tasks list
            checkbox.checked = false; // Uncheck the checkbox
        }
        return task;
    });

    localStorage.setItem('tasks', JSON.stringify(updatedTasks)); // Update Local Storage
    displayTasks(); // Refresh the task display
}

// Tab functionality
function showTab(tabId) {
    tabs.forEach(tab => tab.classList.remove('active'));
    tabContents.forEach(content => content.classList.remove('active'));

    document.querySelector(`.tab-content#${tabId}`).classList.add('active');
    document.querySelector(`.tab.${tabId}`).classList.add('active');
}

// Initialize the default active tab
showTab('today');
