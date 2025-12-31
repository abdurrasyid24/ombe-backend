const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const db = require('./models');
const errorHandler = require('./middleware/errorHandler');

// Load env vars
dotenv.config();

// Route files
const authRoutes = require('./routes/authRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enable CORS
app.use(cors());

// Serve static files (admin panel)
app.use(express.static('public'));

// Mount routers
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payment', require('./routes/paymentRoutes'));

// Health check route
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Ombe Coffee API is running',
        version: '1.0.0'
    });
});

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Test database connection and start server
db.sequelize.authenticate()
    .then(() => {
        console.log('✅ Database connected successfully');

        // Sync database (create tables if not exist, and alter if changed)
        return db.sequelize.sync({ alter: true });
    })
    .then(() => {
        console.log('✅ Database synced');

        app.listen(PORT, () => {
            console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
        });
    })
    .catch(err => {
        console.error('❌ Unable to connect to the database:', err);
        process.exit(1);
    });