// Configuration de la connexion à la base de données MySQL
// Utilise mysql2/promise pour bénéficier des promesses nativement (async/await)

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Chargement des variables d'environnement (DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD)
dotenv.config();

/**
 * Création d'un pool de connexions MySQL
 * Un pool réutilise les connexions existantes au lieu d'en créer une nouvelle à chaque requête,
 * ce qui améliore les performances et réduit la charge sur le serveur MySQL.
 */
const pool = mysql.createPool({
  host: process.env.DB_HOST,                        // Adresse du serveur MySQL
  port: parseInt(process.env.DB_PORT || '3306'),    // Port MySQL (3306 par défaut)
  database: process.env.DB_NAME,                    // Nom de la base de données
  user: process.env.DB_USER,                        // Nom d'utilisateur MySQL
  password: process.env.DB_PASSWORD,               // Mot de passe MySQL
  waitForConnections: true,                         // Mettre les requêtes en file d'attente si toutes les connexions sont occupées
  connectionLimit: 10,                              // Nombre maximum de connexions simultanées dans le pool
  queueLimit: 0                                     // 0 = file d'attente illimitée
});

// Vérification immédiate de la connexion au démarrage de l'application
// Si la connexion échoue (mauvaises credentials, serveur injoignable), le processus s'arrête
pool.getConnection()
  .then(() => {
    console.log('MySQL Database connected successfully');
  })
  .catch((err) => {
    console.error('Error connecting to MySQL database:', err);
    // Arrêt du serveur si la base de données est inaccessible (inutile de continuer sans BDD)
    process.exit(-1);
  });

// Export du pool pour être utilisé dans tous les modèles
export default pool;
