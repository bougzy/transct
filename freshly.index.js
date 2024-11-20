
// // Import dependencies
// const express = require('express');
// const mongoose = require('mongoose');
// const bodyParser = require('body-parser');
// const cors = require('cors');
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// const multer = require('multer');
// const path = require('path');
// const http = require('http');
// const socketIo = require('socket.io');
// const cron = require('node-cron');

// // Environment configuration (replace with dotenv for production)
// const PORT = process.env.PORT || 5000;
// const MONGO_URI = 'mongodb+srv://expenza:expenza@expenza.oygju.mongodb.net/expenza';
// const JWT_SECRET = 'aHSCWvC3Ol';

// // Initialize app and server
// const app = express();
// const server = http.createServer(app);
// const io = socketIo(server);

// // Middleware
// app.use(cors());
// app.use(bodyParser.json());
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// app.use(express.static('public'));  
// app.use(express.json());

// // MongoDB connection
// mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
//     .then(() => console.log('MongoDB connected successfully'))
//     .catch(err => console.error('MongoDB connection error:', err.message));

// // Schemas and Models
// const userSchema = new mongoose.Schema({
//     name: { type: String, required: true },
//     email: { type: String, required: true, unique: true },
//     password: { type: String, required: true },
//     balance: { type: Number, default: 0 },
//     profits: { type: Number, default: 0 },
//     profitsPaused: { type: Boolean, default: false },
//     notifications: [{ message: String, date: { type: Date, default: Date.now } }],
//     blocked: { type: Boolean, default: false },
//     approved: { type: Boolean, default: false }
// });
// const User = mongoose.model('User', userSchema);

// const transactionSchema = new mongoose.Schema({
//     userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
//     amount: { type: Number, required: true },
//     type: { type: String, enum: ['deposit', 'withdrawal'], required: true },
//     status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
//     proof: { type: String, default: null },
//     createdAt: { type: Date, default: Date.now },
// });
// const Transaction = mongoose.model('Transaction', transactionSchema);

// // JWT Middleware
// const authenticate = (req, res, next) => {
//     const authHeader = req.headers.authorization;
//     if (!authHeader) return res.status(401).json({ message: 'Authorization header missing' });

//     const token = authHeader.split(' ')[1];
//     if (!token) return res.status(401).json({ message: 'Token missing' });

//     jwt.verify(token, JWT_SECRET, (err, user) => {
//         if (err) return res.status(403).json({ message: 'Invalid or expired token' });
//         req.user = user;
//         next();
//     });
// };

// // File upload configuration
// const storage = multer.diskStorage({
//     destination: (req, file, cb) => cb(null, 'uploads/'),
//     filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
// });
// const upload = multer({ storage });

// // Helper Functions
// const emitNotification = (userId, message) => {
//     io.to(userId.toString()).emit('notification', { message });
// };

// const scheduleProfitIncrement = (user) => {
//     const task = cron.schedule('* * * * *', async () => {
//         const increment = Math.max(user.profits * 0.05, 10); // 5% or minimum of 10
//         user.profits += increment;
//         await user.save();
//         emitNotification(user._id, `Your profits have been updated! Current profits: $${user.profits.toFixed(2)}`);
//         io.to(user._id.toString()).emit('profitUpdate', { profits: user.profits });
//     });
//     task.start();
// };

// // Socket.io connection
// io.on('connection', (socket) => {
//     console.log('New client connected');
//     socket.on('join', (userId) => {
//         socket.join(userId);
//         console.log(`User ${userId} joined the room.`);
//     });
//     socket.on('disconnect', () => console.log('Client disconnected'));
// });

// // Routes

// // User Registration
// app.post('/api/users/register', async (req, res) => {
//     const { name, email, password } = req.body;
//     if (!name || !email || !password) {
//         return res.status(400).json({ message: 'Name, email, and password are required.' });
//     }
//     try {
//         const hashedPassword = await bcrypt.hash(password, 10);
//         const user = new User({ email, password: hashedPassword, name });
//         await user.save();
//         res.status(201).json({ message: 'User registered successfully' });
//     } catch (error) {
//         res.status(400).json({ message: error.message });
//     }
// });

// // User Login
// app.post('/api/users/login', async (req, res) => {
//     const { email, password } = req.body;
//     try {
//         const user = await User.findOne({ email });
//         if (!user || !(await bcrypt.compare(password, user.password))) {
//             return res.status(401).json({ message: 'Invalid email or password' });
//         }
//         const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' });
//         res.json({ token });
//     } catch (error) {
//         res.status(500).json({ message: 'Server error', error: error.message });
//     }
// });

// // Admin Dashboard Data
// app.get('/api/admin/dashboard', async (req, res) => {
//     try {
//         const pendingDeposits = await Transaction.find({ type: 'deposit', status: 'pending' }).populate('userId');
//         const pendingWithdrawals = await Transaction.find({ type: 'withdrawal', status: 'pending' }).populate('userId');
//         const allUsers = await User.find({});
//         res.json({ pendingDeposits, pendingWithdrawals, allUsers });
//     } catch (error) {
//         res.status(500).json({ message: 'Server error', error: error.message });
//     }
// });

// // Other routes: Deposits, User Details, Profit Updates, etc.

// // Server Start
// server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));






const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const cron = require('node-cron');

// Initialize app
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static('uploads'));
app.use(express.static('public'));  
app.use(express.json());

// MongoDB connection
mongoose.connect('mongodb+srv://expenza:expenza@expenza.oygju.mongodb.net/expenza', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('MongoDB connected successfully');
})
.catch(err => {
  console.error('MongoDB connection error:', err.message);
});

// User Schema
// User Schema
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    balance: { type: Number, default: 0 },
    profits: { type: Number, default: 0 },
    profitsPaused: { type: Boolean, default: false },
    notifications: [{ message: String, date: { type: Date, default: Date.now } }],
    blocked: { type: Boolean, default: false },
    approved: { type: Boolean, default: false } 
   
});


const User = mongoose.model('User', userSchema);

// Transaction Schema
const transactionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    amount: { type: Number, required: true },
    type: { type: String, enum: ['deposit', 'withdrawal'], required: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    proof: { type: String, default: null },
    createdAt: { type: Date, default: Date.now },
});

const Transaction = mongoose.model('Transaction', transactionSchema);



// Middleware for verifying JWT tokens
const authenticate = (req, res, next) => {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ message: 'Authorization header missing' });
    }

    const token = authHeader.split(' ')[1]; // Format: 'Bearer token_value'

    if (!token) {
        return res.status(401).json({ message: 'Token missing' });
    }

    // Verify the token
    jwt.verify(token, 'aHSCWvC3Ol', (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid or expired token' }); // Return 403 if token is not valid
        }

        req.user = user; // Attach decoded user information to request object
        next(); // Proceed to the next middleware or route handler
    });
};

// Middleware to verify if a user is approved
const ensureApproved = async (req, res, next) => {
    const user = await User.findById(req.user.id);
    if (!user || !user.approved) {
      return res.status(403).json({ message: 'User not approved' });
    }
    next();
  };

// File upload configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

const upload = multer({ storage });

// Helper Functions
const emitNotification = (userId, message) => {
    io.to(userId.toString()).emit('notification', { message });
};


// Socket connection handling
io.on('connection', (socket) => {
    console.log('New client connected');

    // Handle user-specific socket room
    socket.on('join', (userId) => {
        socket.join(userId);
        console.log(`User ${userId} joined the room.`);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});


// Function to schedule profit increments with a steady increase
const scheduleProfitIncrement = (user) => {
    const task = cron.schedule('* * * * *', async () => {
        const percentageIncrement = user.profits * 0.05; // 5% profit increment
        const minimumIncrement = 10; // Set a minimum increment (adjust as needed)

        // Choose the greater value between percentage-based increment and the minimum increment
        const increment = Math.max(percentageIncrement, minimumIncrement);

        // Apply the increment to the user's profits
        user.profits += increment;
        await user.save();

        emitNotification(user._id, `Your profits have been updated! Current profits: $${user.profits.toFixed(2)}`);

        // Emit updated profits to WebSocket
        io.to(user._id.toString()).emit('profitUpdate', { profits: user.profits });
    });
    task.start();
};


//User Registration
app.post('/api/users/register', async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Name, email, and password are required.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    try {
        const user = new User({ email, password: hashedPassword, name });
        await user.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});


// User Login
app.post('/api/users/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user._id }, 'aHSCWvC3Ol', { expiresIn: '1h' });
    res.json({ token });
});

// Get user details, including profits
app.get('/api/users/me', authenticate, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Respond with the required user details
        res.json({
            email: user.email,
            balance: user.balance,
            name: user.name,
            profits: user.profits
        });
    } catch (error) {
        // Handle server errors
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});


// Deposit Transaction
app.post('/api/transactions/deposit', authenticate, upload.single('proofOfPayment'), async (req, res) => {
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
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


// Approve Deposit
app.post('/api/admin/transactions/approve-deposit/:id', async (req, res) => {
    const transactionId = req.params.id;
    const transaction = await Transaction.findById(transactionId);

    if (transaction && transaction.type === 'deposit' && transaction.status === 'pending') {
        const user = await User.findById(transaction.userId);
        user.balance += transaction.amount;
        user.profits += transaction.amount * 0.05; // Initial 5% profit on approved deposit
        await user.save();

        user.notifications.push({
            message: `Your deposit of $${transaction.amount} has been approved. Your balance and profits have been updated!`,
        });
        await user.save();

        transaction.status = 'approved';
        await transaction.save();

        emitNotification(user._id, `Your deposit of $${transaction.amount} has been approved. Your balance and profits have been updated!`);
        scheduleProfitIncrement(user); // Start the task for the user

        return res.status(200).json(transaction);
    }
    return res.status(400).json({ message: 'Transaction not found or already processed' });
});

// Get User Transactions
app.get('/api/admin/transactions/:userId', async (req, res) => {
    try {
        const transactions = await Transaction.find({ userId: req.params.userId });
        res.json(transactions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Admin Deposit Route
app.post('/api/admin/deposit/:userId', async (req, res) => {
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






app.get('/api/admin/dashboard', async (req, res) => {
    try {
        const pendingDeposits = await Transaction.find({ type: 'deposit', status: 'pending' }).populate('userId');
        const pendingWithdrawals = await Transaction.find({ type: 'withdrawal', status: 'pending' }).populate('userId');
        const allUsers = await User.find({});

        res.json({
            pendingDeposits,
            pendingWithdrawals,
            allUsers
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});


// Get All Users for Admin
app.get('/api/admin/users', async (req, res) => {
    try {
        // Fetch all users excluding sensitive information (like passwords)
        const users = await User.find({}, '-password');
        
        // Check if users were found
        if (!users.length) {
            return res.status(404).json({ message: 'No users found.' });
        }

        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});





// Fetch all users with their profits
app.get('/api/admin/users/profits', async (req, res) => {
    try {
        // Assuming you have a middleware that checks if the user is an admin
        const users = await User.find({}, 'name email profits blocked'); // Exclude sensitive data
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});


// Endpoint to get all plans and calculate profits
app.get('/api/plans', async (req, res) => {
    const { percentage } = req.query; // User-defined percentage from query parameters

    if (!percentage || isNaN(percentage)) {
        return res.status(400).json({ message: 'Percentage is required and must be a number.' });
    }

    try {
        const plans = await Plan.find({});
        const plansWithProfit = plans.map(plan => {
            const profit = (plan.baseAmount * (percentage / 100));
            return {
                name: plan.name,
                baseAmount: plan.baseAmount,
                profit: profit.toFixed(2), // Format profit to 2 decimal places
                duration: plan.duration,
                description: plan.description,
            };
        });

        res.json(plansWithProfit);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get All Users' Profits
app.get('/api/admin/users/profits',  async (req, res) => {
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

// Increase Specific User's Profits
app.post('/api/admin/users/profit/:userId',  async (req, res) => {
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



// Start server
server.listen(5000, () => {
    console.log('Server is running on port 5000');
});

