const db = require('./models');

async function fixEnum() {
    try {
        await db.sequelize.authenticate();
        console.log('Connected to database.');

        console.log('Modifying ENUM column...');
        // Standard MySQL Syntax for modifying ENUM
        await db.sequelize.query(`
            ALTER TABLE orders 
            MODIFY COLUMN status ENUM('pending', 'paid', 'processing', 'completed', 'cancelled') 
            DEFAULT 'pending';
        `);

        console.log('✅ Successfully updated orders table status ENUM.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error updating database:', error);
        process.exit(1);
    }
}

fixEnum();
