const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { createServer } = require('http');
const { Server } = require('socket.io');
const { connectMongoDB, connectMySQL } = require('./config/db');

dotenv.config();

// Connect to Databases
connectMongoDB();
connectMySQL();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "*", // Allow all origins for dev/mobile access
        methods: ["GET", "POST"]
    }
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Request Logger
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const aiRoutes = require('./routes/aiRoutes');
const addressRoutes = require('./routes/address');
const spinRoutes = require('./routes/spinRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const colorRoutes = require('./routes/colors');
const reviewRoutes = require('./routes/reviews');

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/game/spin', spinRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/colors', colorRoutes);
app.use('/api/vendors', require('./routes/vendorRoutes'));
app.use('/api/reviews', reviewRoutes);

// Basic Test Route
app.get('/', (req, res) => {
    res.json({ message: 'ChicPlay Fashion API is running 🚀' });
});

// Socket.io
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join_game', (userId) => {
        console.log(`User ${userId} joined the game zone`);
        // Join a room, sending updates, etc.
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('🔥 Global Error Handler caught an error:');
    console.error(err.stack);
    res.status(err.status || 500).json({
        message: err.message || 'Internal Server Error',
        error: err.message,
        stack: err.stack
    });
});

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
