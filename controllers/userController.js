const User = require('../models/User');

// Get details of the authenticated user
exports.getUserDetails = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({
      email: user.email,
      balance: user.balance,
      name: user.name,
      profits: user.profits,
    });
  } catch (error) {
    console.error('Error fetching user details:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all users with profits and additional details
exports.getAllUsersWithProfits = async (req, res) => {
  try {
    const users = await User.find({}, 'name email profits blocked');
    res.json(users);
  } catch (error) {
    console.error('Error fetching users with profits:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
