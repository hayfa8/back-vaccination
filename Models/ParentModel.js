import mongoose from "mongoose";

export const parentSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    sex: { type: String, enum: ['Femme', 'Homme'], required: true },
    ville: { type: String, required: true },
    num_medical: { type: Number, required: true, unique: true }, 
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, unique: true },
    childs_number: { type: Number, required: true },
    phone: { type: Number, required: true },
    role: { type: String, default: 'parent' },
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
  
  export const Parent = mongoose.model('Parent', parentSchema);
  