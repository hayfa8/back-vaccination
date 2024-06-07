import { Doctor } from "../Models/DoctorModel.js";
import { Parent } from "../Models/ParentModel.js";
import { Child } from "../Models/childModel.js";
import { Meeting } from "../Models/MeetingModel.js";
import moment from "moment";

export const assign_child_to_parent = async (req, res) => {
  const { num_medical } = req.body;
  const { parentId } = req.params;

  // Valider les inputs
  if (!num_medical) {
    return res.status(400).json({ message: 'Champs requis manquant : num_medical' });
  }

  try {
    // Trouver l'enfant par num_medical
    const child = await Child.findOne({ num_medical });
    if (!child) {
      return res.status(404).json({ message: 'Enfant non trouvé' });
    }

    // Trouver le parent par ID
    const parent = await Parent.findById(parentId);
    if (!parent) {
      return res.status(404).json({ message: 'Parent non trouvé' });
    }

    // Vérifier si l'enfant est déjà assigné à un autre parent
    if (child.parentId) {
      return res.status(409).json({ message: 'Enfant déjà assigné à un autre parent' });
    }

    // Mettre à jour l'ID du parent de l'enfant
    child.parentId = parent._id;

    const updatedChild = await child.save();

    res.json({ message: 'Parent assigné à l\'enfant avec succès', child: updatedChild });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const get_all_doctors_names = async (req, res) => {
  try {
    // Récupérer tous les médecins
    const doctors = await Doctor.find({}, { firstName: 1, lastName: 1, _id: 1 });
    res.status(200).json({ doctors });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la récupération des médecins" });
  }
};

export const get_childs = async (req, res) => {
  const { parentId } = req.params;

  // Valider les inputs
  if (!parentId) {
    return res.status(400).json({ message: 'Champs requis manquant : parentId' });
  }

  try {
    // Trouver le parent par ID
    const parent = await Parent.findById(parentId);
    if (!parent) {
      return res.status(404).json({ message: 'Parent non trouvé' });
    }

    // Récupérer tous les enfants assignés au parent
    const children = await Child.find({ parentId: parent._id });

    // Vérifier si le parent a des enfants assignés
    if (!children.length) {
      return res.status(204).json({ message: 'Aucun enfant assigné à ce parent' });
    }

    // Envoyer la liste des enfants assignés
    res.json(children);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const create_meeting = async (req, res) => {
  const { childId, doctorId, date, note } = req.body;

  // Valider les données d'entrée
  if (!childId || !doctorId || !date || !note) {
    return res.status(400).json({ message: 'Champs requis manquants' });
  }

  try {
    // Valider le format de la date (JJ/MM/AAAA)
    const datePattern = /^\d{1,2}\/\d{2}\/\d{4}$/;
    if (!datePattern.test(date)) {
      return res.status(400).json({ message: 'Format de date invalide. Utilisez JJ/MM/AAAA.' });
    }

    const meetingDate = moment(date, "DD/MM/YYYY").startOf('day');
    const now = moment().startOf('day');

    if (meetingDate.isBefore(now)) {
      return res.status(400).json({ message: 'La date de la réunion ne peut pas être dans le passé' });
    }

    // Trouver l'enfant et le médecin par leurs IDs
    const child = await Child.findById(childId);
    if (!child) {
      return res.status(404).json({ message: 'Enfant non trouvé' });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: 'Médecin non trouvé' });
    }

    const formattedDate = meetingDate.format('DD/MM/YYYY');

    // Créer un nouvel objet meeting
    const meeting = new Meeting({
      childId: child._id,
      doctorId: doctor._id,
      date: formattedDate,
      note,
      status: 'pending', // Statut initial en attente de l'approbation du médecin
    });

    // Enregistrer la nouvelle réunion
    const savedMeeting = await meeting.save();

    // Envoyer la réponse avec les détails de la réunion créée
    res.status(201).json({ message: 'Demande de réunion envoyée avec succès', meeting: savedMeeting });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const update_meeting = async (req, res) => {
  const { meetingId } = req.params;
  const { childId, doctorId, date, note } = req.body;

  // Valider les données d'entrée
  if (date && !(new Date(date) instanceof Date)) {
    return res.status(400).json({ message: 'Format de date invalide' });
  }

  try {
    // Trouver la réunion par ID
    const meeting = await Meeting.findById(meetingId);

    if (!meeting) {
      return res.status(404).json({ message: 'Réunion non trouvée' });
    }

    meeting.childId = childId || meeting.childId; // Mettre à jour seulement si fourni
    meeting.doctorId = doctorId || meeting.doctorId; // Mettre à jour seulement si fourni

    if (note) {
      meeting.note = note;
    }

    if (date) {
      // Valider le format (JJ/MM/AAAA)
      const datePattern = /^\d{1,2}\/\d{1,2}\/\d{4}$/;
      if (!datePattern.test(date)) {
        return res.status(400).json({ message: 'Format de date invalide. Utilisez JJ/MM/AAAA.' });
      }

      const formatString = "DD/MM/YYYY";
      const meetingDate = moment(date, formatString);
      const formattedDate = meetingDate.format('DD/MM/YYYY');

      const now = moment().startOf('day');

      if (meetingDate.isBefore(now)) {
        return res.status(400).json({ message: 'La date de la réunion ne peut pas être dans le passé' });
      }

      meeting.date = formattedDate;
    }

    // Valider l'existence de l'enfant et du médecin avant d'enregistrer
    if (childId) {
      const child = await Child.findById(childId);
      if (!child) {
        return res.status(404).json({ message: 'Enfant non trouvé' });
      }
    }

    if (doctorId) {
      const doctor = await Doctor.findById(doctorId);
      if (!doctor) {
        return res.status(404).json({ message: 'Médecin non trouvé' });
      }
    }

    // Enregistrer la réunion mise à jour
    await meeting.save();
    res.json({ message: 'Réunion mise à jour avec succès', meeting });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const get_all_meetings = async (req, res) => {
  try {
    // Trouver toutes les réunions et remplir les données de l'enfant et du médecin
    const meetings = await Meeting.find();

    res.json({ meetings });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

const getMeetingsByStatus = async (req, res, status) => {
  try {
    // Trouver les réunions avec le statut spécifié
    const meetings = await Meeting.find({ status });
    res.json({ meetings });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const get_pending_meetings = async (req, res) => {
  getMeetingsByStatus(req, res, 'pending');
};

export const get_declined_meetings = async (req, res) => {
  getMeetingsByStatus(req, res, 'declined');
};

export const get_approved_meetings = async (req, res) => {
  getMeetingsByStatus(req, res, 'approved');
};
