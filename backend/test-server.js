const http = require('http');

const baseUrl = 'http://localhost:5000';

console.log('🧪 Test du serveur Forum API\n');

// Test 1: Vérifier que le serveur répond
http.get(baseUrl, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    if (res.statusCode === 200) {
      console.log('✅ Serveur accessible');
      console.log('📝 Réponse:', JSON.parse(data).message);
      console.log('\n🎉 Le serveur fonctionne correctement !');
      console.log('\n📚 Prochaines étapes:');
      console.log('1. Ouvrir GUIDE_TEST.md pour voir comment tester l\'API');
      console.log('2. Utiliser Postman, Thunder Client ou le fichier test-requests.http');
      console.log('3. Commencer par créer un utilisateur avec POST /api/auth/register');
    } else {
      console.log('❌ Erreur:', res.statusCode);
    }
  });

}).on('error', (err) => {
  console.log('❌ Impossible de se connecter au serveur');
  console.log('💡 Vérifiez que le serveur est démarré avec: npm run dev');
  console.log('Erreur:', err.message);
});
