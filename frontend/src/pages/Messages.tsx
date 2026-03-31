// Page de messagerie privée
// Interface de chat entre utilisateurs amis avec liste de conversations et affichage des messages

import React, { useEffect, useState } from 'react';
import { messageService, Conversation, Message } from '../services/messageService';
import { friendService, Friend } from '../services/friendService';
import { useAuth } from '../context/AuthContext';
import { Send, User, Clock, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';

/**
 * Composant Messages : interface de messagerie privée style chat
 * Fonctionnalités :
 * - Liste des conversations existantes dans le panneau gauche
 * - Affichage des messages de la conversation sélectionnée dans le panneau droit
 * - Envoi de nouveaux messages
 * - Démarrage d'une nouvelle conversation avec un ami (via liste déroulante)
 * - Badge de comptage des messages non lus sur chaque conversation
 * - Alignement des messages : droite = envoyés, gauche = reçus (style WhatsApp)
 *
 * Route protégée : accessible uniquement aux utilisateurs connectés
 */
export function Messages() {
  // Utilisateur connecté (pour distinguer ses messages des messages reçus)
  const { user } = useAuth();

  // Liste des conversations (une par interlocuteur)
  const [conversations, setConversations] = useState<Conversation[]>([]);
  // Liste des amis (pour démarrer de nouvelles conversations)
  const [friends, setFriends] = useState<Friend[]>([]);
  // Conversation actuellement sélectionnée dans le panneau gauche
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  // Messages de la conversation sélectionnée
  const [messages, setMessages] = useState<Message[]>([]);
  // Contenu du champ de saisie du nouveau message
  const [newMessage, setNewMessage] = useState('');
  // État de chargement initial
  const [loading, setLoading] = useState(true);
  // Affiche/masque la liste des amis pour démarrer une nouvelle conversation
  const [showFriendsList, setShowFriendsList] = useState(false);

  // Chargement des conversations et de la liste d'amis au montage
  useEffect(() => {
    loadConversations();
    loadFriends();
  }, []);

  // Recharge les messages chaque fois que la conversation sélectionnée change
  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.user_id);
    }
  }, [selectedConversation]);

  /**
   * Charge la liste des conversations de l'utilisateur connecté
   * Chaque conversation contient le dernier message et le nombre de non-lus
   */
  const loadConversations = async () => {
    try {
      const data = await messageService.getConversations();
      setConversations(data);
    } catch (error) {
      toast.error('Erreur lors du chargement des conversations');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Charge la liste des amis pour le panneau "Nouvelle conversation"
   * Erreur silencieuse (console) pour ne pas bloquer le reste de la page
   */
  const loadFriends = async () => {
    try {
      const data = await friendService.getFriends();
      setFriends(data);
    } catch (error) {
      console.error('Erreur lors du chargement des amis');
    }
  };

  /**
   * Charge tous les messages échangés avec un utilisateur donné
   * @param userId - ID de l'interlocuteur dont on veut voir la conversation
   */
  const loadMessages = async (userId: number) => {
    try {
      const data = await messageService.getConversation(userId);
      setMessages(data);
    } catch (error) {
      toast.error('Erreur lors du chargement des messages');
    }
  };

  /**
   * Envoie un nouveau message à l'interlocuteur de la conversation sélectionnée
   * Recharge les messages et la liste des conversations après envoi
   */
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    // Ne rien faire si le message est vide ou aucune conversation sélectionnée
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      await messageService.sendMessage(selectedConversation.user_id, newMessage);
      setNewMessage('');                                         // Vide le champ de saisie
      loadMessages(selectedConversation.user_id);               // Rafraîchit les messages
      loadConversations();                                        // Met à jour le dernier message affiché
    } catch (error) {
      toast.error('Erreur lors de l\'envoi du message');
    }
  };

  /**
   * Démarre une nouvelle conversation avec un ami depuis la liste déroulante
   * Crée un objet Conversation temporaire côté client pour sélectionner l'ami
   * sans attendre qu'une vraie conversation existe en base
   * @param friend - L'ami avec qui démarrer la conversation
   */
  const startConversationWithFriend = (friend: Friend) => {
    // Construction d'un objet Conversation virtuel pour initialiser la vue
    const newConv: Conversation = {
      user_id: friend.user_id,
      username: friend.username,
      avatar: friend.avatar,
      last_message: '',                          // Vide car pas encore de messages
      last_message_time: new Date().toISOString(),
      unread_count: 0
    };
    setSelectedConversation(newConv);
    setShowFriendsList(false); // Masque la liste des amis
    setMessages([]);           // Vide les messages précédents
  };

  /**
   * Formate une date ISO en heure:minutes (format court pour l'interface de chat)
   */
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Affichage du spinner pendant le chargement initial
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Messages</h1>

          {/* Conteneur principal de l'interface de chat (hauteur fixe 600px) */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden" style={{ height: '600px' }}>
            <div className="flex h-full">

              {/* Panneau gauche : liste des conversations */}
              <div className="w-1/3 border-r border-gray-200 overflow-y-auto">

                {/* Bouton pour afficher/masquer la liste des amis */}
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                  <button
                    onClick={() => setShowFriendsList(!showFriendsList)}
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
                  >
                    <UserPlus className="w-5 h-5" />
                    Nouvelle conversation
                  </button>
                </div>

                {/* Liste déroulante des amis (visible quand showFriendsList = true) */}
                {showFriendsList && friends.length > 0 && (
                  <div className="border-b-4 border-blue-200">
                    <div className="p-2 bg-blue-50 text-sm font-semibold text-blue-900">
                      Vos amis :
                    </div>
                    {friends.map((friend) => (
                      <div
                        key={friend.user_id}
                        onClick={() => startConversationWithFriend(friend)}
                        className="p-4 border-b border-gray-200 cursor-pointer hover:bg-blue-50 transition"
                      >
                        <div className="flex items-center gap-2">
                          <User className="w-5 h-5 text-gray-600" />
                          <span className="font-semibold text-gray-900">{friend.username}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Message d'invitation ou liste des conversations existantes */}
                {conversations.length === 0 && !showFriendsList ? (
                  <div className="p-8 text-center text-gray-500">
                    <p className="mb-2">Aucune conversation</p>
                    <p className="text-sm">Cliquez sur "Nouvelle conversation" pour commencer</p>
                  </div>
                ) : (
                  conversations.map((conv) => (
                    <div
                      key={conv.user_id}
                      onClick={() => setSelectedConversation(conv)}
                      // Fond bleu si cette conversation est sélectionnée
                      className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition ${
                        selectedConversation?.user_id === conv.user_id ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <User className="w-5 h-5 text-gray-600" />
                          <span className="font-semibold text-gray-900">{conv.username}</span>
                        </div>
                        {/* Badge rouge avec le nombre de messages non lus */}
                        {conv.unread_count > 0 && (
                          <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                            {conv.unread_count}
                          </span>
                        )}
                      </div>
                      {/* Aperçu du dernier message (tronqué si trop long) */}
                      <p className="text-sm text-gray-600 truncate">{conv.last_message}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatDate(conv.last_message_time)}
                      </p>
                    </div>
                  ))
                )}
              </div>

              {/* Panneau droit : zone d'affichage et d'envoi des messages */}
              <div className="flex-1 flex flex-col">
                {selectedConversation ? (
                  <>
                    {/* En-tête de la conversation avec le nom de l'interlocuteur */}
                    <div className="p-4 border-b border-gray-200 bg-gray-50">
                      <div className="flex items-center gap-2">
                        <User className="w-6 h-6 text-gray-600" />
                        <span className="font-semibold text-gray-900">
                          {selectedConversation.username}
                        </span>
                      </div>
                    </div>

                    {/* Zone de défilement des messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          // Alignement : droite si l'utilisateur est l'expéditeur, gauche sinon
                          className={`flex ${
                            message.sender_id === user?.id ? 'justify-end' : 'justify-start'
                          }`}
                        >
                          {/* Bulle de message avec couleur selon l'expéditeur */}
                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                              message.sender_id === user?.id
                                ? 'bg-blue-600 text-white'   // Messages envoyés : bleu
                                : 'bg-gray-200 text-gray-900' // Messages reçus : gris
                            }`}
                          >
                            <p>{message.content}</p>
                            {/* Horodatage du message avec couleur adaptée */}
                            <p
                              className={`text-xs mt-1 ${
                                message.sender_id === user?.id ? 'text-blue-100' : 'text-gray-500'
                              }`}
                            >
                              {formatDate(message.created_at)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Formulaire d'envoi de message */}
                    <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder="Écrivez votre message..."
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        {/* Bouton d'envoi avec icône avion */}
                        <button
                          type="submit"
                          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                        >
                          <Send className="w-5 h-5" />
                        </button>
                      </div>
                    </form>
                  </>
                ) : (
                  /* Placeholder quand aucune conversation n'est sélectionnée */
                  <div className="flex-1 flex items-center justify-center text-gray-500">
                    Sélectionnez une conversation
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
