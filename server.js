const app = require('./app');

const PORT = process.env.PORT || 3000;

// Iniciar servidor
const server = app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════════╗
║                    🏦 BANCO API                          ║
╠══════════════════════════════════════════════════════════╣
║  Server running on port: ${PORT.toString().padEnd(29, ' ')} ║
║  URL: http://localhost:${PORT.toString().padEnd(33, ' ')}     ║
║  Documentation: http://localhost:${PORT}/api-docs${' '.repeat(10)} ║
║                                                                    ║
║  Status: ✅ Ready to receive requests                             ║
╚═══════════════════════════════════════════════════════════
  `);
  
  console.log('📋 Available Endpoints:');
  console.log('   🔐 POST /auth/register - Register user');
  console.log('   🔑 POST /auth/login - Login');
  console.log('   ✅ GET  /auth/verify - Verify token');
  console.log('   👥 GET  /users - List users');
  console.log('   👤 GET  /users/me - My profile');
  console.log('   💰 GET  /users/balance - Check balance');
  console.log('   💸 POST /transactions/transfer - Transfer');
  console.log('   📊 GET  /transactions/statement - Statement');
  console.log('   📄 GET  /api-docs - Swagger Documentation');
  console.log('   ❤️  GET  /health - API Status');
  console.log('');
  console.log('👨‍💻 Example Users:');
  console.log('   Username: admin | Password: password | Balance: $ 10,000.00');
  console.log('   Username: user1 | Password: password | Balance: $ 5,000.00');
  console.log('');
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('📴 Received SIGTERM signal. Shutting down server gracefully...');
  server.close(() => {
    console.log('✅ Server shut down successfully.');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\n📴 Received SIGINT signal (Ctrl+C). Shutting down server gracefully...');
  server.close(() => {
    console.log('✅ Server shut down successfully.');
    process.exit(0);
  });
});

// Uncaught error handling
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught error:', error);
  console.log('📴 Shutting down application due to critical error...');
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled promise rejection at:', promise, 'reason:', reason);
  console.log('📴 Shutting down application due to rejected promise...');
  process.exit(1);
});

module.exports = server;