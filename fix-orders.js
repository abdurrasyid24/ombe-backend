const db = require('./models');

async function fixOrders() {
    try {
        console.log('🔄 Updating orders to set finalTotal...');
        
        // Update all orders where finalTotal is null
        const result = await db.sequelize.query(`
            UPDATE orders 
            SET finalTotal = totalAmount 
            WHERE finalTotal IS NULL OR finalTotal = 0
        `);
        
        console.log(`✅ Updated ${result[1]} orders`);
        
        // Verify
        const orders = await db.Order.findAll({
            attributes: ['id', 'orderNumber', 'totalAmount', 'finalTotal', 'status']
        });
        
        console.log('\n=== UPDATED ORDERS ===');
        orders.forEach(order => {
            console.log(`- Order ${order.id}: Total=${order.totalAmount}, Final=${order.finalTotal}`);
        });
        
        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

fixOrders();
