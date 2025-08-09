const userRepository = require('../repositories/userRepository');

class UserService {
  /**
   * Get all users
   */
  getAllUsers() {
    return userRepository.findAll();
  }

  /**
   * Get user by ID
   */
  getUserById(id) {
    const user = userRepository.findById(id);
    if (!user) {
      throw new Error('User not found');
    }

    // Return user without password
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Update user data
   */
  updateUser(id, updates) {
    // Do not allow direct update of sensitive fields
    const allowedFields = ['email', 'beneficiaries'];
    const filteredUpdates = {};
    
    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        filteredUpdates[field] = updates[field];
      }
    }

    if (Object.keys(filteredUpdates).length === 0) {
      throw new Error('No valid fields provided for update');
    }

    const updatedUser = userRepository.update(id, filteredUpdates);
    if (!updatedUser) {
      throw new Error('User not found');
    }

    // Return user without password
    const { password, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  }

  /**
   * Add beneficiary
   */
  addBeneficiary(userId, beneficiaryId) {
    const user = userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const beneficiary = userRepository.findById(beneficiaryId);
    if (!beneficiary) {
      throw new Error('Beneficiary user not found');
    }

    if (userId.toString() === beneficiaryId.toString()) {
      throw new Error('Cannot add yourself as a beneficiary');
    }

    if (user.beneficiaries.includes(beneficiaryId.toString())) {
      throw new Error('User is already in the beneficiaries list');
    }

    const updatedBeneficiaries = [...user.beneficiaries, beneficiaryId.toString()];
    const updatedUser = userRepository.update(userId, { beneficiaries: updatedBeneficiaries });

    const { password, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  }

  /**
   * Remove beneficiary
   */
  removeBeneficiary(userId, beneficiaryId) {
    const user = userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (!user.beneficiaries.includes(beneficiaryId.toString())) {
      throw new Error('User is not in the beneficiaries list');
    }

    const updatedBeneficiaries = user.beneficiaries.filter(id => id !== beneficiaryId.toString());
    const updatedUser = userRepository.update(userId, { beneficiaries: updatedBeneficiaries });

    const { password, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  }

  /**
   * Get user balance
   */
  getUserBalance(userId) {
    const user = userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    return {
      message: 'Balance retrieved successfully',
      balance: user.balance
    };
  }
}

module.exports = new UserService();