const express = require('express');
const User = require('../models/User');

const router = express.Router();

// Route to get all users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('name email balance profits');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Route to approve a user
router.post('/approve/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.approved = true;
    await user.save();
    res.json({ message: 'User approved successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


// Get All Users' Profits
router.get('/api/admin/users/profits',  async (req, res) => {
    try {
        // Check if the requesting user is an admin (you may want to implement a role-checking mechanism)
        if (!req.user.isAdmin) {
            return res.status(403).json({ message: 'Access denied. Admins only.' });
        }

        const users = await User.find({}, 'name email profits'); // Fetch users with their profits
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});


// Fetch all users with their profits
router.get('/api/admin/users/profits', async (req, res) => {
    try {
        // Assuming you have a middleware that checks if the user is an admin
        const users = await User.find({}, 'name email profits blocked'); // Exclude sensitive data
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Increase Specific User's Profits
router.post('/api/admin/users/profit/:userId',  async (req, res) => {
    const { amount } = req.body;
    const userId = req.params.userId;

    // Validate amount
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
        return res.status(400).json({ message: 'Invalid amount.' });
    }

    try {
        // Find the user by userId
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Update the user's profits
        user.profits += parsedAmount;
        await user.save();

        // Emit notification to the user about the profit increase
        emitNotification(userId, `Your profits have been manually updated by an admin. Current profits: $${user.profits.toFixed(2)}`);

        res.status(200).json({ message: 'User profits updated successfully', profits: user.profits });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});



// Pause or resume a specific user's profit calculation
router.post('/api/admin/users/:userId/pause-profit', async (req, res) => {
    try {
        // Assuming you have a middleware that checks if the user is an admin
        const { userId } = req.params;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Toggle the paused state for profit calculation
        user.profitPaused = !user.profitPaused; // Toggle the paused state
        await user.save();

        const status = user.profitPaused ? 'paused' : 'resumed';
        res.status(200).json({ message: `User's profit calculation has been ${status}.` });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});



// Admin Deposit Route
router.post('/api/admin/deposit/:userId', async (req, res) => {
    const { amount } = req.body;
    const userId = req.params.userId; // Get userId from the URL parameter

    // Validate amount
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
        return res.status(400).json({ message: 'Invalid amount.' });
    }

    try {
        // Create a new deposit transaction
        const transaction = new Transaction({
            userId: userId,
            amount: parsedAmount,
            type: 'deposit',
            status: 'approved', // Automatically approve for admin deposits
        });

        // Save the transaction
        await transaction.save();

        // Update user's balance
        const user = await User.findById(userId);
        user.balance += parsedAmount; // Update the user's balance
        await user.save();

        // Emit notification to the user about the deposit
        emitNotification(userId, `Your account has been credited with $${parsedAmount}.`); 
        
        res.status(201).json(transaction);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


// Get User Transactions
router.get('/api/admin/transactions/:userId', async (req, res) => {
    try {
        const transactions = await Transaction.find({ userId: req.params.userId });
        res.json(transactions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Approve Withdrawal
router.post('/api/admin/transactions/approve-withdrawal/:id', async (req, res) => {
    const transactionId = req.params.id;
    const transaction = await Transaction.findById(transactionId).populate('userId');

    if (transaction && transaction.type === 'withdrawal' && transaction.status === 'pending') {
        const user = transaction.userId;

        // Check if user has sufficient balance
        if (user.balance < Math.abs(transaction.amount)) {
            return res.status(400).json({ message: 'Insufficient balance for this withdrawal.' });
        }

        // Deduct the withdrawal amount from the user's balance
        user.balance -= Math.abs(transaction.amount);
        await user.save();

        // Update transaction status to approved
        transaction.status = 'approved';
        await transaction.save();

        emitNotification(user._id, `Your withdrawal of $${Math.abs(transaction.amount)} has been approved. Your current balance: $${user.balance.toFixed(2)}`);

        return res.status(200).json(transaction);
    }

    return res.status(400).json({ message: 'Transaction not found or already processed' });
});



module.exports = router;