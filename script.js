const taskForm = document.getElementById('task-form');
const tasksList = document.getElementById('tasks');
const doneTasksList = document.getElementById('done-tasks');
const tabs = document.querySelectorAll('.tab');
const tabContents = document.querySelectorAll('.tab-content');

taskForm.addEventListener('submit', function(event) {
    event.preventDefault();

    const taskName = document.getElementById('task-name').value;
    const taskDeadline = document.getElementById('task-deadline').value;
    const taskTime = document.getElementById('task-time').value;
    const taskType = document.getElementById('task-type').value;

    const taskItem = document.createElement('li');
    taskItem.innerHTML = `
        <input type="checkbox" onchange="markAsDone(this)"> 
        ${taskName} - ${taskDeadline} ${taskTime} (${taskType})`;

    tasksList.appendChild(taskItem);

    // Clear input fields
    taskForm.reset();
});

function markAsDone(checkbox) {
    const taskItem = checkbox.parentElement;
    doneTasksList.appendChild(taskItem);
    checkbox.checked = false; // Uncheck the checkbox after moving it
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
