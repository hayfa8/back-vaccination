import mongoose from "mongoose";

export const doctorSchema = new mongoose.Schema({
    firstName: { type: String , required: true, },
    lastName: { type: String, required: true, },
    sex: { type: String, enum: ['Femme', 'Homme'], required: true },
    ville: { type: String, required: true },
    specialite: { type: String, required: true, },
    diplomaUrl: { type: String, required: true },
    phone: { type: Number, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true,  unique: true },
    role: { type: String, default: 'doctor' },
    verified: { type: Boolean, default: false },
    verificationCode: { type: String, default: null },
    email_confirmation: { type: String, default: false },
    forget_password_code: {type: String, default: null},
    passwordResetExpires: {type: String, default: null},
    avatar: {
      type: Buffer, 
      required: false, 
    },
  });
  
  export const Doctor = mongoose.model('Doctor', doctorSchema);