import { Admin } from "../Models/AdminModel.js";
import { Parent } from "../Models/ParentModel.js";
import { Doctor } from "../Models/DoctorModel.js";

import jwt from 'jsonwebtoken'

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email, password });

    if (!admin) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(admin._id);

    res.json({ message: 'Login successful', token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};



export const registerAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate email uniqueness
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const newAdmin = new Admin({
      email,
      password: password,
    });

    const token = generateToken(newAdmin._id);
    await newAdmin.save();

    res.status(201).json({ message: 'Admin registration successful', token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


export const getAdminDashboard = async (req, res) => {
    try {
      const [parentCount, doctorCount ] = await Promise.all([
        Doctor.countDocuments({ verified: true }),
        Parent.countDocuments({ verified: true }),
        // ajouter nb d'enfant
      ]);
  
      res.json({
        parentCount,
        doctorCount
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
  
  export const get_Non_Verified_Accounts = async (req, res) => {
    const parentUsers = await Parent.find({ verified: false });
    const doctorUsers = await Doctor.find({ verified: false });
    const nonVerifiedUsers = [...parentUsers, ...doctorUsers]; // Combine results
    res.json(nonVerifiedUsers);
  };

  export const get_Non_Verified_Doctors = async (req, res) => {
    const doctors = await Doctor.find({ verified: false });
    res.json(doctors);
  }
  
  export const get_Non_Verified_Parents = async (req, res) => {
    const parents = await Parent.find({ verified: false });
    res.json(parents);
  }
  
  
  export const Verify_Account = async (req, res) => {
    const userId = req.params.id;
  
    try {
      let updatedUser;
      if (userId) {

        updatedUser = await Promise.all([
          Parent.findByIdAndUpdate(userId, { verified: true }),
          Doctor.findByIdAndUpdate(userId, { verified: true }),
        ]).then(([parent, doctor]) => {
          return parent || doctor; 
        });
      }
  
      if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      res.json({ message: 'Account verified' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
  
  export const Reject_Account = async (req, res) => {
    const userId = req.params.id;
  
    try {
      let deletedUser;
      if (userId) {
        // Find parent or doctor by ID directly
        deletedUser = await Promise.all([
          Parent.findByIdAndDelete(userId),
          Doctor.findByIdAndDelete(userId),
        ]).then(([parent, doctor]) => {
          return parent || doctor; 
        });
      }
  
      if (!deletedUser) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      res.json({ message: 'Account rejected' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
  

  function generateToken(adminId) {
    const secretKey = process.env.JWT_SECRET; 
    const expiration = '1h';
  
    const payload = {
      adminId,
    };
  
    return jwt.sign(payload, secretKey, { expiresIn: expiration });
  }
  

