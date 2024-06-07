import { Admin } from "../Models/AdminModel.js";
import { Parent } from "../Models/ParentModel.js";
import { Doctor } from "../Models/DoctorModel.js";
import { Vaccin } from "../Models/VaccinModel.js";
import jwt from 'jsonwebtoken'

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email, password });

    if (!admin) {
      return res.status(401).json({ message: 'Adresse e-mail ou mot de passe invalide' });
    }

    const token = generateToken(admin._id);

    res.json({ message: 'Connexion réussie', token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
};



export const registerAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

// pour valider l'email
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: 'L\'adresse e-mail existe déjà' });
    }

    const newAdmin = new Admin({
      email,
      password: password,
    });

    const token = generateToken(newAdmin._id);
    await newAdmin.save();

    res.status(201).json({ message: 'Inscription de l\'administrateur réussie', token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
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
      res.status(500).json({ message: 'Erreur interne du serveur' });
    }
  };
  
  export const get_Non_Verified_Accounts = async (req, res) => {
    const parentUsers = await Parent.find({ verified: false });
    const doctorUsers = await Doctor.find({ verified: false });
    const nonVerifiedUsers = [...parentUsers, ...doctorUsers]; // Combinez les résultats
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
        return res.status(404).json({ message: 'Utilisateur non trouvé' });
      }
  
      res.json({ message: 'Compte vérifié' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erreur interne du serveur' });
    }
  };
  
  export const Reject_Account = async (req, res) => {
    const userId = req.params.id;
  
    try {
      let deletedUser;
      if (userId) {
        // Trouver le parent ou le médecin par ID directement
        deletedUser = await Promise.all([
          Parent.findByIdAndDelete(userId),
          Doctor.findByIdAndDelete(userId),
        ]).then(([parent, doctor]) => {
          return parent || doctor; 
        });
      }
  
      if (!deletedUser) {
        return res.status(404).json({ message: 'Utilisateur non trouvé' });
      }
  
      res.json({ message: 'Compte rejeté' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erreur interne du serveur' });
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
  

  
  export const create_vaccin = async (req, res) => {
    try {
      const {
        identifiant,
        date_de_creation,
        nom,
        type,
        num_lot,
        pays,
        dosage,
        num_serie,
        lieu_administration,
        age,
        description,
      } = req.body;
  
      // Valider les champs requis
      if (!identifiant || !date_de_creation || !nom || !type || !num_lot || !pays || !dosage || !num_serie || !lieu_administration || !age) {
        return res.status(400).json({ message: 'Champs requis manquants' });
      }
  
      // Créer une nouvelle instance de vaccin
      const newVaccin = new Vaccin({
        identifiant,
        date_de_creation,
        nom,
        type,
        num_lot,
        pays,
        dosage,
        num_serie,
        lieu_administration,
        age,
        description,
      });
  

      await newVaccin.save();
  
      return res.status(201).json({ message: 'Vaccin créé avec succès', vaccin: newVaccin });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Erreur lors de la création du vaccin' });
    }
  };
  


export const get_vaccin = async (req, res) => {
  try {
    const { id } = req.params;

    const vaccin = await Vaccin.findById(id);

    if (!vaccin) {
      return res.status(404).json({ message: 'Vaccin non trouvé' });
    }

    return res.status(200).json(vaccin);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erreur lors de l\'obtention du vaccin' });
  }
};


export const get_all_vaccins = async (req, res) => {
  try {
    const vaccins = await Vaccin.find();

    return res.status(200).json(vaccins);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erreur lors de l\'obtention de tous les vaccins' });
  }
};


export const update_vaccin = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      identifiant,
      date_de_creation,
      nom,
      type,
      num_lot,
      pays,
      dosage,
      num_serie,
      lieu_administration,
      age,
      description,
    } = req.body;

    // Valider si un identifiant valide est fourni
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Identifiant de vaccin invalide' });
    }

    // Mettre à jour le document du vaccin
    const updatedVaccin = await Vaccin.findByIdAndUpdate(
      id,
      { $set: { // $set pour les mises à jour partielles
        identifiant,
        date_de_creation,
        nom,
        type,
        num_lot,
        pays,
        dosage,
        num_serie,
        lieu_administration,
        age,
        description,
      } },
      { new: true } // Renvoie le document mis à jour
    );

    if (!updatedVaccin) {
      return res.status(404).json({ message: 'Vaccin non trouvé' });
    }

    return res.status(200).json({ message: 'Vaccin mis à jour avec succès', vaccin: updatedVaccin });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erreur lors de la mise à jour du vaccin' });
  }
};


export const delete_vaccin = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedVaccin = await Vaccin.findByIdAndDelete(id);

    if (!deletedVaccin) {
      return res.status(404).json({ message: 'Vaccin non trouvé' });
    }

    return res.status(200).json({ message: 'Vaccin supprimé avec succès' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erreur lors de la suppression du vaccin' });
  }
};
