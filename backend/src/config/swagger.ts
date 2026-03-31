import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Forum API',
      version: '1.0.0',
      description: 'API REST pour application forum avec système d\'amis et messagerie privée',
      contact: {
        name: 'Abdelmoughite SEDRY et Aymène NAOURA',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000/api',
        description: 'Serveur de développement',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    tags: [
      { name: 'Auth', description: 'Authentification et gestion de compte' },
      { name: 'Posts', description: 'Gestion des posts' },
      { name: 'Comments', description: 'Gestion des commentaires' },
      { name: 'Users', description: 'Gestion des utilisateurs' },
      { name: 'Friendships', description: 'Système d\'amitié' },
      { name: 'Messages', description: 'Messagerie privée' },
      { name: 'Admin', description: 'Administration (réservé aux admins)' },
    ],
  },
  apis: ['./src/routes/*.ts', './dist/routes/*.js'],
};

export const swaggerSpec = swaggerJsdoc(options);
