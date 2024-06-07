import { Parent } from "../Models/ParentModel.js";
import { Doctor } from "../Models/DoctorModel.js";

import jwt from 'jsonwebtoken'
import bcrypt from "bcryptjs"
// import twilio from "twilio"
import { upload } from "../Middleware/UploadDiplome.js";

import { sendEmailConfirmation, SendEmailResetPassword, generateVerificationCode } from "../utils/SendEmail.js";


export const Parent_Registration = async (req, res) => {
  const { firstName, lastName, sex, ville, email, password, phone } = req.body;

  const existingUser = await Parent.findOne({ email });

  if (existingUser) {
    return res.status(400).json({ message: 'L\'email existe déjà' });
  }
  const verificationCode = generateVerificationCode();

  const newParent = new Parent({
    firstName,
    lastName,
    sex,
    ville,
    email,
    password: await hashPassword(password),
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
  // Générer un jeton lors de l'inscription réussie
  const token = generateToken(newParent._id);
  
  try {
    await sendEmailConfirmation(newParent.email, verificationCode, newParent.firstName);
    res.json({ message: 'Inscription réussie, veuillez vérifier votre email' , token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
}

export const email_confirmation = async (req, res) => {
  const { verificationCode } = req.body;

  try {
    // Vérifier le code de vérification dans les modèles à la fois de Doctor et de Parent
    const [parent, doctor] = await Promise.all([
      Parent.findOne({ verificationCode }),
      Doctor.findOne({ verificationCode }),
    ]);

    if (!parent && !doctor) {
      return res.status(400).json({ message: 'Code de vérification invalide' });
    }

    // Mettre à jour la confirmation par e-mail et le code de vérification en fonction du modèle trouvé
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

    res.json({ message: 'Vérification de l\'email réussie' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
};



export const Parent_login = async (req, res) => {
  const { email, password } = req.body;

  // Vérifier les informations d'identification manquantes
  if (!email || !password) {
    return res.status(400).json({ message: 'Veuillez fournir l\'email et le mot de passe' });
  }

  const parent = await Parent.findOne({ email });

  if (!parent) {
    return res.status(401).json({ message: 'Email ou mot de passe invalide' });
  }

  // Comparer le hachage du mot de passe
  const isMatch = await bcrypt.compare(password, parent.password);

  if (!isMatch) {
    return res.status(401).json({ message: 'Email ou mot de passe invalide' });
  }

  // Générer un jeton en cas de connexion réussie
  const token = generateToken(parent._id);

  res.json({ message: 'Connexion réussie', token });

}


export const Doctor_Registration = async (req, res) => {

  upload.single('diplomaUrl')(req, res, async (err) => { 
    if (err) {
      console.log(req.file);

      console.error(err);
      return res.status(500).json({ message: 'Erreur lors du téléchargement du diplôme' });
    }

  const { firstName, lastName, sex, ville, specialite, phone, email, password, diplomaUrl  } = req.body;


  const existingDoctor = await Doctor.findOne({ email });

  if (existingDoctor) {
    return res.status(400).json({ message: 'L\'email existe déjà' });
  }

  if (!password) {
    return res.status(400).json({ message: 'Le mot de passe est requis' });
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

    // Générer un jeton aprés l'inscription
    const token = generateToken(newDoctor._id);
  
    await sendEmailConfirmation(newDoctor.email, verificationCode, newDoctor.firstName);

    res.json({ message: 'Inscription réussie, veuillez vérifier votre email' , token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Une erreur s\'est produite lors de l\'inscription' });
  }
})}



// Connexion du médecin
export const Doctor_Login = async (req, res) => {
  const { email, password } = req.body;

  // Vérifier les identifiants manquants
  if (!email || !password) {
    return res.status(400).json({ message: 'Veuillez fournir l\'email et le mot de passe' });
  }

  const doctor = await Doctor.findOne({ email });

  if (!doctor) {
    return res.status(401).json({ message: 'Email ou mot de passe invalide' });
  }

  // Comparer de manière sécurisée le hachage du mot de passe
  const isMatch = await bcrypt.compare(password, doctor.password);

  if (!isMatch) {
    return res.status(401).json({ message: 'Email ou mot de passe invalide' });
  }

  const token = generateToken(doctor._id);

  res.json({ message: 'Connexion réussie', token });
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

// Section de récupération de mot de passe//

export const forget_password = async (req, res) => {
  const { email } = req.body;

  try {
    // Trouver l'utilisateur par e-mail dans les modèles Parent et Doctor
    const [parent, doctor] = await Promise.all([
      Parent.findOne({ email }),
      Doctor.findOne({ email }),
    ]);

    // Vérifier si l'utilisateur existe dans l'un des deux modèles
    if (!parent && !doctor) {
      return res.status(400).json({ message: 'Email non trouvé' });
    }

    let user;
    let forgetPasswordCode;
    let passwordResetExpires;

    // Générer le code de vérification, le temps d'expiration, et l'attribuer à l'objet utilisateur
    if (parent) {
      user = parent;
      forgetPasswordCode = generateVerificationCode();
      user.forget_password_code = forgetPasswordCode;
      passwordResetExpires = Date.now() + 3600000; // Expiration d'une heure
    } else {
      user = doctor;
      forgetPasswordCode = generateVerificationCode();
      user.forget_password_code = forgetPasswordCode;
      passwordResetExpires = Date.now() + 3600000;
    }

    user.passwordResetExpires = passwordResetExpires;

    await user.save();
    await SendEmailResetPassword(user.email, forgetPasswordCode, user.firstName);

    res.json({ message: 'Les instructions pour réinitialiser le mot de passe ont été envoyées à votre email' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
};



export const reset_password = async (req, res) => {
  const { forget_password_code, newPassword } = req.body;

  try {
    // Trouver l'utilisateur par le code de réinitialisation de mot de passe dans les modèles Parent et Doctor
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

    // Vérifier si l'utilisateur existe avec un code valide dans l'un des modèles
    if (!parent && !doctor) {
      return res.status(400).json({ message: 'Code de vérification invalide ou demande expirée' });
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

    res.json({ message: 'Réinitialisation du mot de passe réussie' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
};


// export const forget_password_sms = async (req, res) => {
//   const { phone } = req.body;

//   try {
//     // Trouver l'utilisateur par numéro de téléphone dans les modèles Parent et Doctor
//     const [parent, doctor] = await Promise.all([
//       Parent.findOne({ phone }),
//       Doctor.findOne({ phone }),
//     ]);

//     // Vérifier si l'utilisateur existe dans l'un des deux modèles
//     if (!parent && !doctor) {
//       return res.status(400).json({ message: 'Numéro de téléphone introuvable' });
//     }

//     let user;
//     let forgetPasswordCode;
//     let passwordResetExpires;

//     // Générer un code de vérification, définir le temps d'expiration et l'assigner à l'objet utilisateur
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

//     // Envoyer une vérification par SMS en utilisant Twilio
//     const client = twilio("AC1fda293c4e04c243801f37747cbcd7a1", "3e054ca9ae0872a117ed01fb17085a92");

//     try {
//       // Envoyer un SMS en utilisant Twilio
//       const message = await client.messages.create({
//         body: `Votre code de réinitialisation de mot de passe est ${forgetPasswordCode}. Ce code expire dans 1 heure.`,
//         to: `+216${phone}`, // format phone number for Twilio
//         from: process.env.TWILIO_PHONE_NUMBER 
//       });
  
//       console.log(`SMS envoyé à ${phone} avec l'identifiant de message: ${message.sid}`);
//       await user.save();
//       return res.status(200).json({ message: 'Code de vérification envoyé avec succès' });
//     } catch (error) {
//       console.error('Erreur lors de l\'envoi du SMS:', error);
//       return res.status(500).json({ message: 'Échec de l\'envoi du code de vérification' });
//     }
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Erreur interne du serveur' });
//   }
// };
