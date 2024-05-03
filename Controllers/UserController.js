import { Parent } from "../Models/ParentModel.js";
import { Doctor } from "../Models/DoctorModel.js";

import jwt from 'jsonwebtoken'
import bcrypt from "bcryptjs"
// import twilio from "twilio"
import { upload } from "../Middleware/UploadDiplome.js";

import { sendEmailConfirmation, SendEmailResetPassword, generateVerificationCode } from "../utils/SendEmail.js";


export const Parent_Registration = async (req, res) => {
  const { firstName, lastName, sex, ville, num_medical, email, password, childs_number, phone } = req.body;

  const existingUser = await Parent.findOne({ email });

  if (existingUser) {
    return res.status(400).json({ message: 'Email already exists' });
  }

  if (req.body.num_medical.toString().length !== 7) {
    return res.status(400).json({ message: 'num_medical must be 7 digits' });
  }

  const verificationCode = generateVerificationCode();

  const newParent = new Parent({
    firstName,
    lastName,
    sex,
    ville,
    num_medical,
    email,
    password: await hashPassword(password),
    childs_number,
    email_confirmation : false,
    verificationCode,
    phone
  });

  const defaultAvatarMale = process.env.DEFAULT_AVATAR_MALE; 
  const defaultAvatarFemale = process.env.DEFAULT_AVATAR_FEMALE; 
  if (sex === 'Homme') {
    newParent.avatar = Buffer.from(defaultAvatarMale, 'base64'); 
  } else {
    newParent.avatar = Buffer.from(defaultAvatarFemale, 'base64'); 
  }

  await newParent.save();
  // Generate token on successful registration
  const token = generateToken(newParent._id);
  
  try {
    await sendEmailConfirmation(newParent.email, newParent.verificationCode, newParent.firstName);
    res.json({ message: 'Registration successful, please check your email to verify' , token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

export const email_confirmation = async (req, res) => {
  const { verificationCode } = req.body;

  try {
    // Check for verification code in both Doctor and Parent models
    const [parent, doctor] = await Promise.all([
      Parent.findOne({ verificationCode }),
      Doctor.findOne({ verificationCode }),
    ]);

    if (!parent && !doctor) {
      return res.status(400).json({ message: 'Invalid verification code' });
    }

    // Update email_confirmation and verificationCode based on found model
    let updatedUser;
    if (parent) {
      parent.email_confirmation = true;
      parent.verificationCode = null;
      updatedUser = await parent.save();
    } else {
      doctor.email_confirmation = true;
      doctor.verificationCode = null;
      updatedUser = await doctor.save();
    }

    res.json({ message: 'Email verification successful' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};



export const Parent_login = async (req, res) => {
  const { email, password } = req.body;

  // Check for missing credentials
  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email and password' });
  }

  const parent = await Parent.findOne({ email });

  if (!parent) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  // Compare password hash
  const isMatch = await bcrypt.compare(password, parent.password);

  if (!isMatch) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  // Generate token on successful login
  const token = generateToken(parent._id);

  res.json({ message: 'Login successful', token });

}


export const Doctor_Registration = async (req, res) => {

  upload.single('diplomaUrl')(req, res, async (err) => { 
    if (err) {
      console.log(req.file);

      console.error(err);
      return res.status(500).json({ message: 'Error uploading diploma' });
    }

  const { firstName, lastName, sex, ville, specialite, phone, email, password, diplomaUrl  } = req.body;


  const existingDoctor = await Doctor.findOne({ email });

  if (existingDoctor) {
    return res.status(400).json({ message: 'Email already exists' });
  }

  if (!password) {
    return res.status(400).json({ message: 'Password is required' });
}

  const hashedPassword = await hashPassword(password); 

  const verificationCode = generateVerificationCode();
  
  const newDoctor = new Doctor({
    firstName,
    lastName,
    sex,
    ville,
    specialite,
    phone,
    email,
    password: hashedPassword,
    email_confirmation: false, 
    verificationCode
  });

  if (req.file) { 
    newDoctor.diplomaUrl = `uploads/${req.file.filename}`;
  }

  try {

    const defaultAvatarMale = process.env.DEFAULT_AVATAR_MALE; 
    const defaultAvatarFemale = process.env.DEFAULT_AVATAR_FEMALE; 

    if (sex === 'Homme') {
      newDoctor.avatar = Buffer.from(defaultAvatarMale, 'base64'); 
    } else {
      newDoctor.avatar = Buffer.from(defaultAvatarFemale, 'base64'); 
    }

    
    await newDoctor.save();

    // Generate token on successful registration
    const token = generateToken(newDoctor._id);
  
    await sendEmailConfirmation(newDoctor.email, verificationCode, newDoctor.firstName);

    res.json({ message: 'Registration successful, please check your email to verify' , token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred during registration' });
  }
})}



// Doctor Login
export const Doctor_Login = async (req, res) => {
  const { email, password } = req.body;

  // Check for missing credentials
  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email and password' });
  }

  const doctor = await Doctor.findOne({ email });

  if (!doctor) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  // Compare password hash securely
  const isMatch = await bcrypt.compare(password, doctor.password);

  if (!isMatch) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  const token = generateToken(doctor._id);

  res.json({ message: 'Login successful', token });
};


async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10); 
  return await bcrypt.hash(password, salt);
}

function generateToken(parentId) {
  const secretKey = process.env.JWT_SECRET; 
  const expiration = '1h';

  const payload = {
    parentId,
  };

  return jwt.sign(payload, secretKey, { expiresIn: expiration });
}

// forget password section //

export const forget_password = async (req, res) => {
  const { email } = req.body;

  try {
    // Find user by email in both Parent and Doctor models
    const [parent, doctor] = await Promise.all([
      Parent.findOne({ email }),
      Doctor.findOne({ email }),
    ]);

    // Check if user exists in either model
    if (!parent && !doctor) {
      return res.status(400).json({ message: 'Email not found' });
    }

    let user;
    let forgetPasswordCode;
    let passwordResetExpires;

    // Generate verification code, expiration time, and assign to user object
    if (parent) {
      user = parent;
      forgetPasswordCode = generateVerificationCode();
      user.forget_password_code = forgetPasswordCode;
      passwordResetExpires = Date.now() + 3600000; // 1 hour expiration
    } else {
      user = doctor;
      forgetPasswordCode = generateVerificationCode();
      user.forget_password_code = forgetPasswordCode;
      passwordResetExpires = Date.now() + 3600000;
    }

    user.passwordResetExpires = passwordResetExpires;

    await user.save();
    await SendEmailResetPassword(user.email, forgetPasswordCode, user.firstName);

    res.json({ message: 'Password reset instructions sent to your email' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};



export const reset_password = async (req, res) => {
  const { forget_password_code, newPassword } = req.body;

  try {
    // Find user by forget_password_code in both Parent and Doctor models
    const [parent, doctor] = await Promise.all([
      Parent.findOne({
        forget_password_code,
        passwordResetExpires: { $gt: Date.now() },
      }),
      Doctor.findOne({
        forget_password_code,
        passwordResetExpires: { $gt: Date.now() },
      }),
    ]);

    // Check if user exists with valid code in either model
    if (!parent && !doctor) {
      return res.status(400).json({ message: 'Invalid verification code or expired request' });
    }

    let user;

    if (parent) {
      user = parent;
    } else {
      user = doctor;
    }

    user.password = await hashPassword(newPassword);
    user.forget_password_code = null;
    user.passwordResetExpires = null;

    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


// export const forget_password_sms = async (req, res) => {
//   const { phone } = req.body;

//   try {
//     // Find user by phone number in both Parent and Doctor models
//     const [parent, doctor] = await Promise.all([
//       Parent.findOne({ phone }),
//       Doctor.findOne({ phone }),
//     ]);

//     // Check if user exists in either model
//     if (!parent && !doctor) {
//       return res.status(400).json({ message: 'Phone number not found' });
//     }

//     let user;
//     let forgetPasswordCode;
//     let passwordResetExpires;

//     // Generate verification code, expiration time, and assign to user object
//     if (parent) {
//       user = parent;
//     } else {
//       user = doctor;
//     }

//     forgetPasswordCode = generateVerificationCode();
//     user.forget_password_code = forgetPasswordCode;
//     passwordResetExpires = Date.now() + 3600000; // 1 hour expiration
//     user.passwordResetExpires = passwordResetExpires;

//     await user.save();

//     // Send SMS verification using Twilio
//     const client = twilio("AC1fda293c4e04c243801f37747cbcd7a1", "3e054ca9ae0872a117ed01fb17085a92");

//     try {
//       // Send SMS using Twilio
//       const message = await client.messages.create({
//         body: `Your password reset code is ${forgetPasswordCode}. This code expires in 1 hour.`,
//         to: `+216${phone}`, // format phone number for Twilio
//         from: process.env.TWILIO_PHONE_NUMBER 
//       });
  
//       console.log(`SMS sent to ${phone} with message sid: ${message.sid}`);
//       await user.save();
//       return res.status(200).json({ message: 'Verification code sent successfully' });
//     } catch (error) {
//       console.error('Error sending SMS:', error);
//       return res.status(500).json({ message: 'Failed to send verification code' });
//     }
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// };
