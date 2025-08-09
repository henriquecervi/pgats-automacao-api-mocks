/**
 * In-memory database configuration
 */

// In-memory data
const users = [];
const transactions = [];

// Function to reset data (useful for tests)
const resetDatabase = () => {
  users.length = 0;
  transactions.length = 0;
};

// Function to add sample users
const seedDatabase = () => {
  users.push({
    id: '1',
    username: 'admin',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
    email: 'admin@example.com',
    balance: 10000.00,
    beneficiaries: ['2']
  });
  
  users.push({
    id: '2',
    username: 'user1',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
    email: 'user1@example.com',
    balance: 5000.00,
    beneficiaries: []
  });
};

module.exports = {
  users,
  transactions,
  resetDatabase,
  seedDatabase
};