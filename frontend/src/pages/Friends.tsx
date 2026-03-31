// Page de gestion des amis
// Permet de rechercher des utilisateurs, envoyer/accepter/refuser des demandes d'amitié
// et consulter ses amis, demandes reçues et demandes envoyées

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { friendService, Friend, User } from '../services/friendService';
import { User as UserIcon, UserPlus, Check, X, Trash2, Search, MessageCircle } from 'lucide-react';
import toast from 'react-hot-toast';

/**
 * Composant Friends : page de gestion des amis
 * Fonctionnalités :
 * - Rechercher des utilisateurs par nom ou email pour leur envoyer une demande
 * - Trois onglets : "Mes amis", "Demandes reçues", "Demandes envoyées"
 * - Accepter ou refuser des demandes d'amitié entrantes
 * - Supprimer un ami existant
 * - Accéder rapidement à la messagerie avec un ami
 *
 * Route protégée : accessible uniquement aux utilisateurs connectés
 */
export function Friends() {
  const navigate = useNavigate();

  // Liste des amis confirmés
  const [friends, setFriends] = useState<Friend[]>([]);
  // Demandes d'amitié reçues (en attente de réponse)
  const [pendingRequests, setPendingRequests] = useState<Friend[]>([]);
  // Demandes d'amitié envoyées (en attente d'acceptation)
  const [sentRequests, setSentRequests] = useState<Friend[]>([]);

  // États du formulaire de recherche d'utilisateurs
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [searching, setSearching] = useState(false);

  // État de chargement initial des données
  const [loading, setLoading] = useState(true);

  // Onglet actif : 'friends' | 'pending' | 'sent'
  const [activeTab, setActiveTab] = useState<'friends' | 'pending' | 'sent'>('friends');

  // Chargement des données au montage du composant
  useEffect(() => {
    loadData();
  }, []);

  /**
   * Charge en parallèle les amis, les demandes reçues et les demandes envoyées
   * Utilise Promise.all pour optimiser les appels réseau
   */
  const loadData = async () => {
    try {
      const [friendsData, pendingData, sentData] = await Promise.all([
        friendService.getFriends(),
        friendService.getPendingRequests(),
        friendService.getSentRequests(),
      ]);
      setFriends(friendsData);
      setPendingRequests(pendingData);
      setSentRequests(sentData);
    } catch (error) {
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Recherche des utilisateurs par nom d'utilisateur ou email
   * Appelle GET /api/users/search?q=...
   */
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      setSearching(true);
      const results = await friendService.searchUsers(searchQuery);
      setSearchResults(results);
      if (results.length === 0) {
        toast.error('Aucun utilisateur trouvé');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de la recherche');
    } finally {
      setSearching(false);
    }
  };

  /**
   * Envoie une demande d'amitié à un utilisateur trouvé dans la recherche
   * Réinitialise la recherche et recharge les données après envoi
   */
  const handleSendRequest = async (userId: number) => {
    try {
      await friendService.sendRequest(userId);
      toast.success('Demande envoyée !');
      setSearchQuery('');       // Vide le champ de recherche
      setSearchResults([]);     // Masque les résultats
      loadData();               // Rafraîchit les listes
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de l\'envoi');
    }
  };

  /**
   * Accepte une demande d'amitié reçue
   * @param requesterId - ID de l'utilisateur qui a envoyé la demande
   */
  const handleAccept = async (requesterId: number) => {
    try {
      await friendService.acceptRequest(requesterId);
      toast.success('Demande acceptée !');
      loadData(); // L'ami passe de "pending" à "friends"
    } catch (error) {
      toast.error('Erreur lors de l\'acceptation');
    }
  };

  /**
   * Refuse une demande d'amitié reçue
   * @param requesterId - ID de l'utilisateur dont on refuse la demande
   */
  const handleReject = async (requesterId: number) => {
    try {
      await friendService.rejectRequest(requesterId);
      toast.success('Demande refusée');
      loadData(); // La demande disparaît de la liste "pending"
    } catch (error) {
      toast.error('Erreur lors du refus');
    }
  };

  /**
   * Supprime un ami après confirmation de l'utilisateur
   * @param friendId - ID de l'ami à supprimer (user_id dans la relation d'amitié)
   */
  const handleRemove = async (friendId: number) => {
    if (!window.confirm('Supprimer cet ami ?')) return;

    try {
      await friendService.removeFriend(friendId);
      toast.success('Ami supprimé');
      loadData(); // L'ami disparaît de la liste "friends"
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
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
        <div className="max-w-4xl mx-auto">

          {/* Section recherche d'utilisateurs */}
          <div className="bg-white rounded-lg shadow-md p-8 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <UserPlus className="w-8 h-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">Rechercher des amis</h1>
            </div>

            {/* Formulaire de recherche par nom d'utilisateur ou email */}
            <form onSubmit={handleSearch} className="flex gap-2 mb-4">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher par nom d'utilisateur ou email..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <button
                type="submit"
                disabled={searching}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-50"
              >
                <Search className="w-5 h-5" />
                {searching ? 'Recherche...' : 'Rechercher'}
              </button>
            </form>

            {/* Résultats de la recherche : liste d'utilisateurs avec bouton "Ajouter" */}
            {searchResults.length > 0 && (
              <div className="space-y-2 mt-4">
                <h3 className="font-semibold text-gray-700 mb-2">Résultats de recherche :</h3>
                {searchResults.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                  >
                    <div className="flex items-center gap-4">
                      {/* Avatar personnalisé ou icône par défaut */}
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.username}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                          <UserIcon className="w-6 h-6 text-blue-600" />
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-gray-900">{user.username}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                        {/* Bio optionnelle affichée si disponible */}
                        {user.bio && <p className="text-sm text-gray-600 mt-1">{user.bio}</p>}
                      </div>
                    </div>
                    {/* Bouton d'envoi de demande d'amitié */}
                    <button
                      onClick={() => handleSendRequest(user.id)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                    >
                      <UserPlus className="w-5 h-5" />
                      Ajouter
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section onglets : Mes amis / Demandes reçues / Demandes envoyées */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">

            {/* Barre d'onglets avec indicateur visuel (fond bleu = actif) */}
            <div className="flex border-b">
              <button
                onClick={() => setActiveTab('friends')}
                className={`flex-1 px-6 py-4 font-semibold transition ${
                  activeTab === 'friends'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                Mes amis ({friends.length})
              </button>
              <button
                onClick={() => setActiveTab('pending')}
                className={`flex-1 px-6 py-4 font-semibold transition ${
                  activeTab === 'pending'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                Demandes reçues ({pendingRequests.length})
              </button>
              <button
                onClick={() => setActiveTab('sent')}
                className={`flex-1 px-6 py-4 font-semibold transition ${
                  activeTab === 'sent'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                Demandes envoyées ({sentRequests.length})
              </button>
            </div>

            <div className="p-6">

              {/* Onglet "Mes amis" : liste des amis confirmés */}
              {activeTab === 'friends' && (
                <div className="space-y-4">
                  {friends.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">Aucun ami pour le moment</p>
                  ) : (
                    friends.map((friend) => (
                      <div
                        key={friend.id}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                      >
                        <div className="flex items-center gap-4">
                          {/* Avatar de l'ami */}
                          {friend.avatar ? (
                            <img
                              src={friend.avatar}
                              alt={friend.username}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                              <UserIcon className="w-6 h-6 text-blue-600" />
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-gray-900">{friend.username}</p>
                            <p className="text-sm text-gray-500">@{friend.username}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {/* Bouton "Message" : redirige vers la page de messagerie */}
                          <button
                            onClick={() => navigate('/messages')}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                          >
                            <MessageCircle className="w-5 h-5" />
                            Message
                          </button>
                          {/* Bouton de suppression de l'ami (avec confirmation) */}
                          <button
                            onClick={() => handleRemove(friend.user_id)}
                            className="text-red-600 hover:text-red-700 p-2"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Onglet "Demandes reçues" : demandes en attente d'acceptation/refus */}
              {activeTab === 'pending' && (
                <div className="space-y-4">
                  {pendingRequests.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">Aucune demande en attente</p>
                  ) : (
                    pendingRequests.map((request) => (
                      <div
                        key={request.id}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                      >
                        <div className="flex items-center gap-4">
                          {/* Avatar de l'utilisateur qui a envoyé la demande */}
                          {request.avatar ? (
                            <img
                              src={request.avatar}
                              alt={request.username}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                              <UserIcon className="w-6 h-6 text-blue-600" />
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-gray-900">{request.username}</p>
                            <p className="text-sm text-gray-500">ID: {request.user_id}</p>
                          </div>
                        </div>
                        {/* Boutons Accepter (vert) et Refuser (rouge) */}
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAccept(request.user_id)}
                            className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 transition"
                          >
                            <Check className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleReject(request.user_id)}
                            className="bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 transition"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Onglet "Demandes envoyées" : demandes en attente de réponse de l'autre côté */}
              {activeTab === 'sent' && (
                <div className="space-y-4">
                  {sentRequests.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">Aucune demande envoyée</p>
                  ) : (
                    sentRequests.map((request) => (
                      <div
                        key={request.id}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                      >
                        <div className="flex items-center gap-4">
                          {/* Avatar du destinataire de la demande */}
                          {request.avatar ? (
                            <img
                              src={request.avatar}
                              alt={request.username}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                              <UserIcon className="w-6 h-6 text-blue-600" />
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-gray-900">{request.username}</p>
                            <p className="text-sm text-gray-500">ID: {request.user_id}</p>
                          </div>
                        </div>
                        {/* Badge indiquant que la demande est en attente de réponse */}
                        <span className="text-sm text-gray-500 bg-yellow-100 px-3 py-1 rounded-full">
                          En attente
                        </span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
