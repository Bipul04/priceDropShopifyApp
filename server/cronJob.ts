import cron from 'node-cron';

// Function to execute
function executeTask() {
    console.log('Running a task every day at 3 PM');
    // Your task logic here
}

// Schedule the cron job
cron.schedule('0 15 * * *', executeTask);
