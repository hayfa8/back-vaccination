import mongoose from "mongoose";
import { Child } from "./childModel.js";

export const vaccinSchema = new mongoose.Schema({
  identifiant: { type: String, required: true },
  date_de_creation: { type: String, required: true },
  nom: { type: String, required: true },
  type: { type: String, required: true },
  num_lot: { type: String, required: true },
  pays: { type: String, required: true },
  dosage: { type: Number, required: true },
  num_serie: { type: String, required: true },
  lieu_administration: { type: String, required: true },
  age: {
    type: [Number],
    required: true,
  },
  description: { type: String },
});

vaccinSchema.post('save', async (newVaccin, next) => {
  try {
    // Find all children
    const children = await Child.find();

    // Update child records with new vaccine 
    children.forEach(async (child) => {
      const hasExistingVaccine = child.vaccin.some(
        (vaccin) => vaccin.vaccinId.toString() === newVaccin._id.toString()
      );

      if (!hasExistingVaccine) {
        child.vaccin.push({ vaccinId: newVaccin._id, isVaccinated: false });
        await child.save();
      }
    });

    next();
  } catch (error) {
    console.error(error);
    next(error);
  }
});

export const Vaccin = mongoose.model('Vaccin', vaccinSchema);
