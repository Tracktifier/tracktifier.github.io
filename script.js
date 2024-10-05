document.getElementById('task-form').addEventListener('submit', function(e) {
    e.preventDefault();

    const taskName = document.getElementById('task-name').value;
    const taskDeadline = document.getElementById('task-deadline').value;

    if (taskName && taskDeadline) {
        const taskItem = document.createElement('li');
        taskItem.textContent = `${taskName} - Deadline: ${taskDeadline}`;
        document.getElementById('tasks').appendChild(taskItem);

        document.getElementById('task-form').reset();
    } else {
        alert("Please fill out both fields.");
    }
});
