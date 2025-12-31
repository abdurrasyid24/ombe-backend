const db = require('./models');

async function findLatestPendingOrder() {
    try {
        await db.sequelize.authenticate();
        const order = await db.Order.findOne({
            where: { status: 'pending' },
            order: [['createdAt', 'DESC']]
        });

        if (order) {
            console.log(`LATEST_ORDER_NUMBER:${order.orderNumber}`);
            console.log(`LATEST_ORDER_ID:${order.id}`);
        } else {
            console.log('NO_PENDING_ORDER_FOUND');
        }
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

findLatestPendingOrder();
