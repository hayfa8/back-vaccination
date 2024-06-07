import jwt from "jsonwebtoken";
import { Admin } from "../Models/AdminModel.js";

const JWT_SECRET = "M5ddT9kSz9Ahq1O"; 

export const verifyAdminToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Accès non autorisé' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const adminId = decoded.adminId;

    const admin = await Admin.findById(adminId); 

    if (!admin) {
      return res.status(403).json({ message: 'Interdit : Permissions insuffisantes' });
    }

    req.admin = admin; 
    next();
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Jeton invalide' });
  }
};
