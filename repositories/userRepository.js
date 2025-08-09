const { users } = require('../config/database');

class UserRepository {
  /**
   * Find all users
   */
  findAll() {
    return users.map(user => ({
      id: user.id,
      username: user.username,
      email: user.email,
      balance: user.balance,
      beneficiaries: user.beneficiaries
    }));
  }

  /**
   * Find user by ID
   */
  findById(id) {
    if (!id) {
      throw new Error('User not found');
    }
    const user = users.find(user => user.id === id.toString());
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  /**
   * Find user by username
   */
  findByUsername(username) {
    return users.find(user => user.username === username);
  }

  /**
   * Find user by email
   */
  findByEmail(email) {
    return users.find(user => user.email === email);
  }

  /**
   * Create new user
   */
  create(userData) {
    const newUser = {
      id: users.length > 0 ? (Math.max(...users.map(u => parseInt(u.id))) + 1).toString() : '1',
      ...userData,
      balance: userData.balance || 0,
      beneficiaries: userData.beneficiaries || []
    };
    
    users.push(newUser);
    return newUser;
  }

  /**
   * Update user
   */
  update(id, updates) {
    const userIndex = users.findIndex(user => user.id === id.toString());
    if (userIndex === -1) {
      return null;
    }

    users[userIndex] = { ...users[userIndex], ...updates };
    return users[userIndex];
  }

  /**
   * Delete user
   */
  delete(id) {
    const userIndex = users.findIndex(user => user.id === id.toString());
    if (userIndex === -1) {
      return false;
    }

    users.splice(userIndex, 1);
    return true;
  }

  /**
   * Check if user is in beneficiaries list
   */
  isBeneficiary(userId, beneficiaryId) {
    const user = this.findById(userId);
    return user && user.beneficiaries.includes(beneficiaryId.toString());
  }
}

module.exports = new UserRepository();