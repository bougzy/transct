const User = require('../models/User');

const ensureApproved = async (req, res, next) => {
  const user = await User.findById(req.user.id);
  if (!user || !user.approved) {
    return res.status(403).json({ message: 'User not approved' });
  }
  next();
};

module.exports = ensureApproved;