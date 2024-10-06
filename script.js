const taskForm = document.getElementById('task-form');
const tasksList = document.getElementById('tasks'); // Today's tasks
const doneTasksList = document.getElementById('done-tasks');
const missedTasksList = document.getElementById('missed-tasks'); // Missed tasks list
const upcomingTasksList = document.getElementById('upcoming-tasks'); // Upcoming tasks list
const nextWeekList = document.getElementById('next-week-tasks'); // Next week tasks list
const nextMonthList = document.getElementById('next-month-tasks'); // Next month tasks list
const tabs = document.querySelectorAll('.tab');
const tabContents = document.querySelectorAll('.tab-content');

// Request notification permissions on page load
document.addEventListener('DOMContentLoaded', function() {
    if (Notification.permission !== "granted") {
        Notification.requestPermission().then(permission => {
            if (permission === "granted") {
                console.log("Notifications permission granted.");
            } else {
                console.log("Notifications permission denied.");
            }
        });
    }
});

// Load tasks from Local Storage on page load
document.addEventListener('DOMContentLoaded', loadTasks);


taskForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const taskName = document.getElementById('task-name').value;
    const taskDeadline = document.getElementById('task-deadline').value;
    const taskTime = document.getElementById('task-time').value; // Added time
    const taskType = document.getElementById('task-type').value; // Added task type

    if (taskName && taskDeadline && taskTime && taskType) {
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
        alert("Please fill out all fields.");
    }
});

function saveTask(task) {
    // Get existing tasks from Local Storage
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks.push(task); // Add the new task
    localStorage.setItem('tasks', JSON.stringify(tasks)); // Save back to Local Storage
    displayTasks(); // Update the task display

    // Set up notifications for the new task
    scheduleNotification(task);
}

function loadTasks() {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks.forEach(task => {
        displayTask(task);
        // Schedule notifications for each task
        if (!task.done) {
            scheduleNotification(task);
        }
    });
}

function displayTasks() {
    // Clear the lists
    tasksList.innerHTML = '';
    doneTasksList.innerHTML = '';
    missedTasksList.innerHTML = ''; // Clear missed tasks list
    upcomingTasksList.innerHTML = '';
    nextWeekList.innerHTML = ''; // Clear next week tasks list
    nextMonthList.innerHTML = ''; // Clear next month tasks list

    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const currentDateTime = new Date(); // Get current date and time

    tasks.forEach(task => {
        const taskDeadlineDateTime = new Date(`${task.deadline}T${task.time}`); // Create a Date object for the task's deadline
        const taskElement = createTaskElement(task); // Create task element once

        if (task.done) {
            doneTasksList.appendChild(taskElement); // Add to done tasks if marked as done
        } else {
            const daysUntilDeadline = (taskDeadlineDateTime - currentDateTime) / (1000 * 60 * 60 * 24); // Calculate the days difference

            if (taskDeadlineDateTime < currentDateTime) {
                // If the task's deadline is missed
                missedTasksList.appendChild(taskElement); // Add to missed tasks
            } else if (daysUntilDeadline <= 7) {
                nextWeekList.appendChild(taskElement.cloneNode(true)); // Add to next week tasks if within 7 days
            } else if (daysUntilDeadline <= 30) {
                nextMonthList.appendChild(taskElement.cloneNode(true)); // Add to next month tasks if within 30 days
            } else {
                tasksList.appendChild(taskElement); // Add to main task list if not done
                upcomingTasksList.appendChild(taskElement.cloneNode(true)); // Add a copy to upcoming tasks
            }
        }
    });
}

function createTaskElement(task) {
    const taskItem = document.createElement('li');
    taskItem.innerHTML = `
        <input type="checkbox" onchange="markAsDone(this)" ${task.done ? 'checked' : ''}>
        ${task.name} - Deadline: ${task.deadline} ${task.time} (${task.type})
        <button class="delete-button" onclick="deleteTask('${task.name}')">Delete</button>
    `;
    return taskItem;
}

function markAsDone(checkbox) {
    const taskItem = checkbox.parentElement;
    const taskName = taskItem.childNodes[1].nodeValue.trim(); // Get task name

    // Get tasks from Local Storage
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const updatedTasks = tasks.map(task => {
        if (task.name === taskName) {
            task.done = !task.done; // Toggle the task as done or not
        }
        return task;
    });

    localStorage.setItem('tasks', JSON.stringify(updatedTasks)); // Update Local Storage
    displayTasks(); // Refresh the task display
}

function deleteTask(taskName) {
    // Get tasks from Local Storage
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const updatedTasks = tasks.filter(task => task.name !== taskName); // Remove the task

    localStorage.setItem('tasks', JSON.stringify(updatedTasks)); // Update Local Storage
    displayTasks(); // Refresh the task display
}

// Tab functionality
function showTab(tabId) {
    tabs.forEach(tab => tab.classList.remove('active')); // Remove active class from all tabs
    tabContents.forEach(content => content.classList.remove('active')); // Hide all tab contents

    // Add active class to the clicked tab and its corresponding content
    document.querySelector(`.tab-content#${tabId}`).classList.add('active');
    document.querySelector(`.tab.${tabId}`).classList.add('active');
}

// Initialize the default active tab
showTab('today');

// Schedule notifications for tasks
function scheduleNotification(task) {
    const currentDateTime = new Date();
    const taskDeadlineDateTime = new Date(`${task.deadline}T${task.time}`);
    const timeUntilDeadline = taskDeadlineDateTime - currentDateTime;

    let notificationTime = 0;

    switch (task.type) {
        case 'large':
            notificationTime = timeUntilDeadline - 7 * 24 * 60 * 60 * 1000; // 1 week before
            break;
        case 'medium':
            notificationTime = timeUntilDeadline - 3 * 24 * 60 * 60 * 1000; // 3 days before
            break;
        case 'small':
            notificationTime = timeUntilDeadline - 24 * 60 * 60 * 1000; // 1 day before
            break;
        case 'group':
            notificationTime = timeUntilDeadline - 5 * 24 * 60 * 60 * 1000; // 3-5 days before
            break;
        default:
            return;
    }

    if (notificationTime > 0) {
        setTimeout(() => {
            showNotification(task);
        }, notificationTime);
    }
}

// Display notifications
function showNotification(task) {
    if (Notification.permission === 'granted') {
        new Notification(`Upcoming Task: ${task.name}`, {
            body: `Deadline: ${task.deadline} at ${task.time} (${task.type})`,
            icon: 'notification-icon.png' // Set the path to your notification icon
        });
    }
}
