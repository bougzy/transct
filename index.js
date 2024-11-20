const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const userRoutes = require('./routes/userRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const buildingRoutes = require('./routes/buildingRoutes');
const planRoutes = require('./routes/planRoutes');
const rateLimit = require('express-rate-limit');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');



const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(cors());
app.use(bodyParser.json());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'public')));

mongoose.connect('mongodb+srv://expenza:expenza@expenza.oygju.mongodb.net/expenza', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.error('MongoDB connection error:', err.message));

io.on('connection', (socket) => {
  console.log('New client connected');
  socket.on('join', (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined the room.`);
  });
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});



// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/buildings', buildingRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);


const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests, please try again later.',
  });
  
  app.use(limiter);


io.on('connection', (socket) => {
    console.log('New client connected');
  
    socket.on('join', (userId) => {
      socket.join(userId);
      console.log(`User ${userId} joined the room.`);
    });
  
    socket.on('send-notification', (data) => {
      const { userId, message } = data;
      io.to(userId).emit('notification', message);
    });
  
    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });
  });

server.listen(5000, () => {
  console.log('Server is running on port 5000');
});