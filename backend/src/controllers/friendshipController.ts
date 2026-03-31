// Contrôleur de gestion des amis
// Gère l'envoi, l'acceptation, le refus de demandes d'ami
// ainsi que la suppression d'amis et la consultation des listes

// Importation du type Response d'Express pour typer les réponses HTTP
import { Response } from 'express';
// Importation de l'interface AuthRequest qui contient les infos de l'utilisateur authentifié
import { AuthRequest } from '../middleware/auth';
// Importation du modèle Friendship pour interagir avec la table friendships
import { FriendshipModel } from '../models/Friendship';

/**
 * Contrôleur pour envoyer une demande d'ami
 * Route: POST /api/friendships/request
 * Nécessite authentification
 *
 * Body: { receiverId: number }
 */
export const sendFriendRequest = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Récupération de l'ID de l'utilisateur connecté depuis req.user (ajouté par le middleware authenticate)
    const userId = req.user?.id;
    // Récupération de l'ID du destinataire depuis le corps de la requête
    const { receiverId } = req.body;

    // Vérification que l'utilisateur est bien authentifié
    if (!userId) {
      res.status(401).json({ message: 'Non authentifié' });
      return;
    }

    // Vérification que l'ID du destinataire est fourni
    if (!receiverId) {
      res.status(400).json({ message: 'ID du destinataire requis' });
      return;
    }

    // Empêcher un utilisateur de s'ajouter lui-même comme ami
    if (userId === receiverId) {
      res.status(400).json({ message: 'Vous ne pouvez pas vous ajouter vous-même' });
      return;
    }

    // Vérification qu'il n'existe pas déjà une demande entre ces deux utilisateurs
    // (dans un sens ou dans l'autre)
    const existingStatus = await FriendshipModel.getRequestStatus(userId, receiverId);
    if (existingStatus) {
      res.status(400).json({ message: 'Une demande existe déjà entre ces utilisateurs' });
      return;
    }

    // Création de la demande d'ami en base de données avec le statut 'pending'
    const requestId = await FriendshipModel.sendRequest(userId, receiverId);
    // Retour d'une réponse de succès avec le code 201 (Created)
    res.status(201).json({ message: 'Demande d\'ami envoyée', requestId });
  } catch (error) {
    // En cas d'erreur, logger l'erreur et retourner un code 500
    console.error('Erreur lors de l\'envoi de la demande:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

/**
 * Contrôleur pour accepter une demande d'ami
 * Route: POST /api/friendships/accept
 * Nécessite authentification
 *
 * Body: { requesterId: number } - ID de l'utilisateur qui avait envoyé la demande
 */
export const acceptFriendRequest = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // ID de l'utilisateur qui accepte la demande (celui qui a reçu la demande)
    const userId = req.user?.id;
    // ID de l'utilisateur qui a envoyé la demande
    const { requesterId } = req.body;

    // Vérification de l'authentification
    if (!userId) {
      res.status(401).json({ message: 'Non authentifié' });
      return;
    }

    // Vérification que l'ID du demandeur est fourni
    if (!requesterId) {
      res.status(400).json({ message: 'ID du demandeur requis' });
      return;
    }

    // Mise à jour du statut de la demande de 'pending' à 'accepted' en base de données
    await FriendshipModel.acceptRequest(requesterId, userId);
    // Retour d'une réponse de succès
    res.json({ message: 'Demande d\'ami acceptée' });
  } catch (error) {
    // Gestion des erreurs
    console.error('Erreur lors de l\'acceptation:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

/**
 * Contrôleur pour refuser une demande d'ami
 * Route: POST /api/friendships/reject
 * Nécessite authentification
 *
 * Body: { requesterId: number } - ID de l'utilisateur qui avait envoyé la demande
 */
export const rejectFriendRequest = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { requesterId } = req.body;

    if (!userId) {
      res.status(401).json({ message: 'Non authentifié' });
      return;
    }

    if (!requesterId) {
      res.status(400).json({ message: 'ID du demandeur requis' });
      return;
    }

    // Mise à jour du statut de 'pending' à 'rejected'
    await FriendshipModel.rejectRequest(requesterId, userId);
    res.json({ message: 'Demande d\'ami refusée' });
  } catch (error) {
    console.error('Erreur lors du refus:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

/**
 * Supprime un ami de la liste de l'utilisateur connecté
 * Route: DELETE /api/friendships/:friendId
 * Nécessite authentification
 *
 * Supprime la relation d'amitié dans les deux sens (peu importe qui avait initié)
 */
export const removeFriend = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    // L'ID de l'ami à supprimer est dans le paramètre d'URL
    const { friendId } = req.params;

    if (!userId) {
      res.status(401).json({ message: 'Non authentifié' });
      return;
    }

    await FriendshipModel.removeFriend(userId, parseInt(friendId));
    res.json({ message: 'Ami supprimé' });
  } catch (error) {
    console.error('Erreur lors de la suppression:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

/**
 * Récupère la liste des amis de l'utilisateur connecté (relations acceptées)
 * Route: GET /api/friendships/list
 * Nécessite authentification
 */
export const getFriends = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: 'Non authentifié' });
      return;
    }

    const friends = await FriendshipModel.getFriends(userId);
    res.json(friends);
  } catch (error) {
    console.error('Erreur lors de la récupération des amis:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

/**
 * Récupère les demandes d'ami reçues et en attente de réponse
 * Route: GET /api/friendships/pending
 * Nécessite authentification
 *
 * Ce sont les demandes où l'utilisateur est le destinataire et le statut est 'pending'
 */
export const getPendingRequests = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: 'Non authentifié' });
      return;
    }

    const requests = await FriendshipModel.getPendingRequests(userId);
    res.json(requests);
  } catch (error) {
    console.error('Erreur lors de la récupération des demandes:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

/**
 * Récupère les demandes d'ami envoyées et en attente de réponse
 * Route: GET /api/friendships/sent
 * Nécessite authentification
 *
 * Ce sont les demandes où l'utilisateur est le demandeur et le statut est 'pending'
 */
export const getSentRequests = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: 'Non authentifié' });
      return;
    }

    const requests = await FriendshipModel.getSentRequests(userId);
    res.json(requests);
  } catch (error) {
    console.error('Erreur lors de la récupération des demandes envoyées:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
