import moment from 'moment';

// Calculate child's age in months
export const ageInMonths = (birthDate) => {
  const birthMoment = moment(birthDate, "DD/MM/YYYY");
  const todayMoment = moment();
  const ageDiff = todayMoment.diff(birthMoment, 'months', true);
  return Math.floor(ageDiff);
};

export const calculateScheduleDate = (birthDate, vaccineAge) => {
  const birthMoment = moment(birthDate, "DD/MM/YYYY");
  const upcomingDates = [];
  
  // Calculate current age in months
  const currentAgeInMonths = ageInMonths(birthDate);

  // Find upcoming vaccine dates
  for (let age of vaccineAge) {
    if (age > currentAgeInMonths) {
      const vaccineDate = birthMoment.clone().add(age, 'months').format("DD/MM/YYYY");
      upcomingDates.push(vaccineDate);
    }
  }

  return upcomingDates;
}

const birthDate = '18/05/2023';
const vaccineAge = [2, 4, 13];

const upcomingDates = calculateScheduleDate(birthDate, vaccineAge);
console.log(upcomingDates);
