const cron = require('node-cron');
const Case = require('./../models/Case');

const initCronJobs = () => {
    // This tells it to run every single minute!
    cron.schedule('* * * * *', async () => {
        console.log("Running Pendency Check..."); 

        try {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            const delayedCases = await Case.find({
                caseStatus: 'Open',
                createdAt: { $lt: thirtyDaysAgo }
            });

            if (delayedCases.length > 0) {
                console.log(`⚠️ Alert: Found ${delayedCases.length} delayed cases.`);
                
                delayedCases.forEach(c => {
                    console.log(`[REMINDER SENT] Case ${c.caseNumber} is pending for over 30 days. Investigator: ${c.createdBy}`);
                });
            } else {
                console.log("✅ No delayed cases found.");
            }

        } catch (error) {
            console.error("Error running cron job:", error);
        }
    });
};

module.exports = initCronJobs;