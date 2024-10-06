const taskForm = document.getElementById('task-form');
const tasksList = document.getElementById('tasks'); // Your tasks
const doneTasksList = document.getElementById('done-tasks');
const missedTasksList = document.getElementById('missed-tasks'); // Missed tasks list
const upcomingTasksList = document.getElementById('upcoming-tasks'); // Upcoming tasks list
const nextWeekList = document.getElementById('next-week-tasks'); // This week tasks list
const nextMonthList = document.getElementById('next-month-tasks'); // This month tasks list
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
    
    // Load tasks from Local Storage on page load
    loadTasks();
});

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
        // Schedule notifications for each task
        if (!task.done) {
            scheduleNotification(task);
        }
    });
    
    // Call displayTasks to render the loaded tasks
    displayTasks(tasks);
}

function displayTasks(tasks) {
    // Clear the lists
    tasksList.innerHTML = '';
    doneTasksList.innerHTML = '';
    missedTasksList.innerHTML = ''; // Clear missed tasks list
    upcomingTasksList.innerHTML = '';
    nextWeekList.innerHTML = ''; // Clear next week tasks list
    nextMonthList.innerHTML = ''; // Clear next month tasks list

    const currentDateTime = new Date(); // Get current date and time

    tasks.forEach(task => {
        const taskDeadlineDateTime = new Date(`${task.deadline}T${task.time}`); // Create a Date object for the task's deadline
        const taskElement = createTaskElement(task); // Create task element once

        if (task.done) {
            doneTasksList.appendChild(taskElement); // Add to done tasks if marked as done
        } else {
            const daysUntilDeadline = Math.floor((taskDeadlineDateTime - currentDateTime) / (1000 * 60 * 60 * 24)); // Calculate the days difference

            // Add to "Your Tasks" tab
            tasksList.appendChild(taskElement.cloneNode(true)); // Add to main task list

            // Check if the task's deadline is missed
            if (taskDeadlineDateTime < currentDateTime) {
                missedTasksList.appendChild(taskElement.cloneNode(true)); // Add to missed tasks
            } 
            // Check if the task's deadline is within this week
            else if (daysUntilDeadline >= 0 && daysUntilDeadline < 7) {
                nextWeekList.appendChild(taskElement.cloneNode(true)); // Add to this week's tasks if within 7 days
            } 
            // Check if the task's deadline is within this month
            else if (daysUntilDeadline >= 7 && daysUntilDeadline < 30) {
                nextMonthList.appendChild(taskElement.cloneNode(true)); // Add to this month's tasks if within 30 days
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
    displayTasks(updatedTasks); // Refresh the task display
}

function deleteTask(taskName) {
    // Get tasks from Local Storage
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const updatedTasks = tasks.filter(task => task.name !== taskName); // Remove the task

    localStorage.setItem('tasks', JSON.stringify(updatedTasks)); // Update Local Storage
    displayTasks(updatedTasks); // Refresh the task display
}

// Tab functionality
function showTab(tabId) {
    tabs.forEach(tab => tab.classList.remove('active')); // Remove active class from all tabs
    tabContents.forEach(content => content.classList.remove('active')); // Hide all tab contents

    // Add active class to the clicked tab and its corresponding content
    document.querySelector(`.tab-content#${tabId}`).classList.add('active');
    document.querySelector(`.tab#${tabId}`).classList.add('active');
}

// Scheduling notifications for tasks
function scheduleNotification(task) {
    const taskDeadlineDateTime = new Date(`${task.deadline}T${task.time}`);
    let notificationTime;

    switch (task.type) {
        case 'large':
            notificationTime = new Date(taskDeadlineDateTime.getTime() - (24 * 60 * 60 * 1000)); // 1 day before
            break;
        case 'medium':
            notificationTime = new Date(taskDeadlineDateTime.getTime() - (3 * 60 * 60 * 1000)); // 3 hours before
            break;
        case 'small':
            notificationTime = new Date(taskDeadlineDateTime.getTime() - (1 * 60 * 60 * 1000)); // 1 hour before
            break;
        case 'group':
            notificationTime = new Date(taskDeadlineDateTime.getTime() - (5 * 24 * 60 * 60 * 1000)); // 5 days before
            break;
        default:
            return;
    }

    // Debugging log
    console.log(`Task: ${task.name}, Notification Time: ${notificationTime}, Current Time: ${new Date()}`);

    // Schedule the notification only if the calculated notification time is in the future
    if (notificationTime > new Date()) {
        const timeout = notificationTime.getTime() - Date.now();
        setTimeout(() => {
            new Notification("Tracktifier Reminder", {
                body: `${task.name} is due soon!`,
                icon: 'icon.png'
            });
        }, timeout);
    } else {
        console.log(`Notification for ${task.name} is set in the past and will not be scheduled.`);
    }
}
