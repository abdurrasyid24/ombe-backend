const db = require('./models');

async function checkData() {
    try {
        const users = await db.User.findAll({ attributes: ['id', 'email', 'role'] });
        console.log('\n=== USERS ===');
        console.log(JSON.stringify(users, null, 2));

        const orders = await db.Order.findAll({
            attributes: ['id', 'orderNumber', 'totalAmount', 'discount', 'finalTotal', 'status']
        });
        console.log('\n=== ORDERS ===');
        console.log(`Total orders: ${orders.length}`);
        if (orders.length > 0) {
            orders.forEach(order => {
                console.log(`- Order ID ${order.id}: ${order.orderNumber}, Total=${order.totalAmount}, Final=${order.finalTotal}, Status=${order.status}`);
            });
        } else {
            console.log('⚠️  NO ORDERS FOUND IN DATABASE');
            console.log('You need to create sample orders first from the mobile/web app');
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

checkData();
