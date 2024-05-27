import mongoose from "mongoose";
import moment from 'moment';
import { Vaccin } from "./VaccinModel.js";

const childSchema = new mongoose.Schema({
  sex: {
    type: String,
    enum: ["Femme", "Homme"],
    required: true,
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,  
  },
  birthday: {
    type: String,
    required: true,
  },
  weight: {
    type: Number,
    required: true,
  },
  height: {
    type: Number,
    required: true,
  },
  num_medical: {
    type: Number,
    required: true,
    unique: true,
  },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Parent',
  },
  vaccin: {
    type: [ 
      {
        vaccinId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Vaccin',
          required: true,
        },
        isVaccinated: {
          type: Boolean,
          default: false, 
        },
      },
    ],
  },
});

childSchema.pre('save', async function (next) {
  const child = this;

  // Calculate child's age in months
  const ageInMonths = (birthDate) => {
    const birthMoment = moment(birthDate, "DD/MM/YYYY");
    const todayMoment = moment();
    const ageDiff = todayMoment.diff(birthMoment, 'months', true);
    return Math.floor(ageDiff);
  };

  const calculatedAge = ageInMonths(child.birthday);

  // Find vaccines applicable for child's age group (greater than or equal)
  const relevantVaccines = await Vaccin.find({ age: { $gte: calculatedAge } });

  // Create the vaccins object with retrieved vaccine IDs and initial false isVaccinated
  child.vaccin = relevantVaccines.map(vaccin => ({
    vaccinId: vaccin._id, // Use the retrieved vaccine's _id
    isVaccinated: false,
  }));

  next();
});

export const Child = mongoose.model("Child", childSchema);
