const Transaction = require('../models/Transaction');
const User = require('../models/User');

exports.deposit = async (req, res) => {
  const { amount } = req.body;
  if (!req.file) {
    return res.status(400).json({ message: 'Proof of payment is required.' });
  }

  const parsedAmount = parseFloat(amount);
  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    return res.status(400).json({ message: 'Invalid amount.' });
  }

  try {
    const transaction = new Transaction({
      userId: req.user.id,
      amount: parsedAmount,
      proof: req.file.path,
      type: 'deposit',
    });
    await transaction.save();

    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

exports.withdraw = async (req, res) => {
  const { amount } = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (user.balance < amount) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    const transaction = new Transaction({
      userId: req.user.id,
      amount: -parseFloat(amount),
      type: 'withdrawal',
    });
    await transaction.save();

    user.balance -= parseFloat(amount);
    await user.save();

    res.status(201).json(transaction);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};