import { Child } from "../Models/childModel.js";
import { Meeting } from "../Models/MeetingModel.js";
import moment from "moment"

export const create_dossier = async (req, res) => {
    const { firstName, lastName, sex, birthday, weight, height, num_medical } = req.body;
  
    // Valider les données d'entrée
    if (!firstName || !lastName || !sex || !birthday || !weight || !height || !num_medical) {
      return res.status(400).json({ message: 'Champs requis manquants' });
    }
  
    try {
      const existingChild = await Child.findOne({ num_medical });
      if (existingChild) {
        return res.status(400).json({ message: 'Le numéro médical doit être unique' });
      }

      // Valider le format du numéro médical (7 chiffres)
      if (!/^\d{7}$/.test(num_medical)) {
        return res.status(400).json({ message: 'Le numéro médical doit être un nombre de 7 chiffres' });
      }

      const datePattern = /^\d{1,2}\/\d{1,2}\/\d{4}$/;
      if (!datePattern.test(birthday)) {
        return res.status(400).json({ message: 'Format de date invalide. Utilisez JJ/MM/AAAA.' });
      }

      const formatString = "DD/MM/YYYY";
      const birthdayDate = moment(birthday, formatString);
      const formattedDate = birthdayDate.format('DD/MM/YYYY');
  
      // Créer un nouveau document Child
      const child = new Child({
        firstName,
        lastName,
        sex,
        birthday: formattedDate,
        weight,
        height,
        num_medical,
      });
  
      await child.save();
  
      res.json({ message: 'Dossier médical créé avec succès' }); 
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erreur du serveur' });
    }
  };

export const update_dossier = async (req, res) => {
    const { childId } = req.params;
    const { ...updateData } = req.body; 
  
    if (!childId || Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: 'Champs requis manquants: au moins un champ de mise à jour' });
    }
  
    try {
      // Trouver l'enfant par ID
      const child = await Child.findById(childId);
      if (!child) {
        return res.status(404).json({ message: 'Enfant non trouvé' });
      }
  
      // Mettre à jour les champs pertinents de l'objet child
      Object.assign(child, updateData); // mettre à jour plusieurs champs
  
      // Valider le format du numéro médical mis à jour (si mis à jour)
      if (updateData.num_medical && !/^\d{7}$/.test(updateData.num_medical)) {
        return res.status(400).json({ message: 'Le numéro médical doit être un nombre de 7 chiffres' });
      }
  
      // Sauvegarder le document enfant mis à jour
      await child.save();
  
      res.json({ message: 'Dossier médical mis à jour avec succès' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erreur du serveur' });
    }
  };
  
export const get_Nb_enfants = async (req, res) => {
  try {
    const count = await Child.countDocuments();
    res.json({ message: 'Nombre total d\'enfants:', count });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur du serveur' });
  }
};

export const get_todays_meetings = async (req, res) => {
  const doctorId = req.params?.id;

  try {
    const today = moment().startOf('day');
    const formattedDate = today.format('DD/MM/YYYY'); 

    const meetings = await Meeting.find({
      doctorId,
      date: formattedDate
    });

    res.json({ meetings });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur du serveur' });
  }
};

export const get_child_vaccins_ByID = async (req, res) => {
  try {
    const { childId } = req.params;
    const child = await Child.findById(childId)

    if (!child) {
      return res.status(404).json({ message: "Enfant non trouvé" });
    }
    res.json(child.vaccin);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur du serveur" });
  }
};

export const update_VaccinationStatus_true = async (req, res) => {
  const { childId, vaccinId } = req.params;

  try {
    const updatedChild = await Child.findOneAndUpdate(
      { _id: childId, "vaccin.vaccinId": vaccinId }, 
      { $set: { "vaccin.$[].isVaccinated": true } } 
    );

    if (!updatedChild) {
      return res.status(400).json({ message: 'Enfant ou vaccin non trouvé' });
    }

    return res.status(200).json({ message: 'Statut de vaccination mis à jour avec succès' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erreur interne du serveur' });
  }
};

export const update_VaccinationStatus_false = async (req, res) => {
  const { childId, vaccinId } = req.params;

  try {
    const updatedChild = await Child.findOneAndUpdate(
      { _id: childId, "vaccin.vaccinId": vaccinId },
      { $set: { "vaccin.$[].isVaccinated": false } }
    );

    if (!updatedChild) {
      return res.status(400).json({ message: 'Enfant ou vaccin non trouvé' });
    }

    return res.status(200).json({ message: 'Statut de vaccination mis à jour avec succès' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erreur interne du serveur' });
  }
};

export const get_list_dossier = async (req, res) => {
    try {
      // Récupérer tous les documents enfant de la base de données
      const allChildren = await Child.find();
  
      // Vérifier si des enfants ont été trouvés
      if (!allChildren.length) {
        return res.status(204).json({ message: 'Aucun enfant trouvé' }); 
      }
  
      // Envoyer la liste de toutes les données des enfants dans la réponse
      res.json(allChildren);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erreur du serveur' });
    }
};

export const approve_meeting = async (req, res) => {
    const { meetingId } = req.params;
  
    try {
      const meeting = await Meeting.findById(meetingId);
  
      if (!meeting) {
        return res.status(404).json({ message: 'Réunion non trouvée' });
      }
  
      // Vérifier si la réunion est déjà approuvée
      if (meeting.status === 'approved') {
        return res.status(400).json({ message: 'Réunion déjà approuvée' });
      }
  
      // Mettre à jour le statut de la réunion en approuvé
      meeting.status = 'approved';
      await meeting.save();
  
      res.json({ message: 'Réunion approuvée avec succès', meeting });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erreur du serveur' });
    }
  };
  
export const decline_meeting = async (req, res) => {
    const { meetingId } = req.params;
    const { note } = req.body;
  
    // Valider les données d'entrée
    if (!note) {
      return res.status(400).json({ message: 'Champs requis manquants: note' });
    }

    try {
      // Trouver la réunion par ID 
      const meeting = await Meeting.findById(meetingId);
  
      if (!meeting) {
        return res.status(404).json({ message: 'Réunion non trouvée' });
      }
  
      // Vérifier si la réunion est déjà refusée ou approuvée
      if (meeting.status === 'declined' || meeting.status === 'approved') {
        return res.status(400).json({ message: 'Réunion déjà refusée ou approuvée' });
      }
  
      // Mettre à jour le statut de la réunion en refusé et ajouter une note
      meeting.status = 'declined';
      meeting.declineNote = note; 
      await meeting.save();
  
      res.json({ message: 'Réunion refusée avec succès', meeting });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erreur du serveur' });
    }
  };
