import cron from "node-cron";
import moment from 'moment';
import { Child } from "../Models/childModel.js";
import { sendPushNotification } from "../Controllers/NotificationController.js";
import { calculateScheduleDate } from "./calculateScheduleDate.js";

// Define the cron job
const startCronJob = () => {
  cron.schedule('* * * * *', async () => {
    try {
      console.log("Cron job started");
      
      // Fetch children and populate the vaccinId reference
      const children = await Child.find().populate('vaccin.vaccinId');
      console.log(`Found ${children.length} children`);

      for (const child of children) {
        console.log(`Processing child: ${child.firstName} ${child.lastName}, Birthday: ${child.birthday}`);
        
        // Get the vaccination ages
        const vaccineAges = child.vaccin.map(vaccin => vaccin.vaccinId.age).flat();
        console.log(`Vaccine ages for ${child.firstName} ${child.lastName}: ${vaccineAges}`);
        
        const upcomingDates = calculateScheduleDate(child.birthday, vaccineAges);
        console.log(`Upcoming vaccination dates: ${upcomingDates}`);

        for (const upcomingDate of upcomingDates) {
          const reminderDate = moment(upcomingDate, "DD/MM/YYYY").subtract(2, 'days').format("DD/MM/YYYY");
          const today = moment().format("DD/MM/YYYY");

          console.log(`Upcoming Date: ${upcomingDate}, Reminder Date: ${reminderDate}, Today: ${today}`);

          if (reminderDate === today) {
            console.log(`Sending notification to parent of child: ${child.firstName} ${child.lastName}`);
            // Call the function to send the notification
            await sendPushNotification(child.parentId, `Reminder: Your child ${child.firstName} ${child.lastName} has a vaccination on ${upcomingDate}`);
          }
        }
      }

      console.log("Cron job completed");
    } catch (error) {
      console.error("Error scheduling reminders:", error);
    }
  });
};

export { startCronJob };
