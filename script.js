document.getElementById('task-form').addEventListener('submit', function(e) {
    e.preventDefault();

    const taskName = document.getElementById('task-name').value;
    const taskDeadline = document.getElementById('task-deadline').value;
    const taskTime = document.getElementById('task-time').value;
    const taskType = document.getElementById('task-type').value;

    if (taskName && taskDeadline && taskTime && taskType) {
        const deadlineDateTime = new Date(`${taskDeadline}T${taskTime}`);
        const reminders = getReminders(deadlineDateTime, taskType);

        const taskItem = document.createElement('li');
        taskItem.textContent = `${taskName} - Deadline: ${taskDeadline} ${taskTime} - Reminders: ${reminders.join(', ')}`;
        document.getElementById('tasks').appendChild(taskItem);

        document.getElementById('task-form').reset();
    } else {
        alert("Please fill out all fields.");
    }
});

function getReminders(deadline, taskType) {
    const reminders = [];
    const oneDay = 24 * 60 * 60 * 1000; // One day in milliseconds

    switch (taskType) {
        case 'large':
            reminders.push(new Date(deadline.getTime() - 7 * oneDay).toLocaleString());
            reminders.push(new Date(deadline.getTime() - 2 * oneDay).toLocaleString());
            break;
        case 'medium':
            reminders.push(new Date(deadline.getTime() - 3 * oneDay).toLocaleString());
            break;
        case 'small':
            reminders.push(new Date(deadline.getTime() - 1 * oneDay).toLocaleString());
            break;
        case 'group':
            const daysInAdvance = Math.floor(Math.random() * (5 - 3 + 1)) + 3; // Random between 3 and 5 days
            reminders.push(new Date(deadline.getTime() - daysInAdvance * oneDay).toLocaleString());
            break;
        default:
            break;
    }
    
    return reminders.map(date => date.replace(',', ' at ')); // Format reminders
}
