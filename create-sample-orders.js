const db = require('./models');

async function createSampleOrders() {
    try {
        console.log('Creating sample orders...');

        // First, let's check the current order structure
        const orders = await db.sequelize.query(`
            SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'orders' AND TABLE_SCHEMA = DATABASE()
            ORDER BY ORDINAL_POSITION
        `);
        console.log('\nOrder table columns:', orders[0].map(col => col.COLUMN_NAME));

        // Create sample orders
        const order1 = await db.Order.create({
            orderNumber: 'OMB-20241226-001',
            userId: 2, // williams
            totalAmount: 150000,
            discount: 10000,
            finalTotal: 140000,
            couponCode: null,
            status: 'pending',
            paymentMethod: 'bank_transfer',
            deliveryAddress: 'Jl. Contoh No. 123, Jakarta',
            notes: 'Tolong cepat dikirim'
        });
        console.log('✅ Order 1 created:', order1.orderNumber);

        const order2 = await db.Order.create({
            orderNumber: 'OMB-20241226-002',
            userId: 3, // roberto
            totalAmount: 200000,
            discount: 0,
            finalTotal: 200000,
            couponCode: null,
            status: 'processing',
            paymentMethod: 'e_wallet',
            deliveryAddress: 'Jl. Maju Jaya No. 456, Jakarta',
            notes: null
        });
        console.log('✅ Order 2 created:', order2.orderNumber);

        const order3 = await db.Order.create({
            orderNumber: 'OMB-20241226-003',
            userId: 4, // alice
            totalAmount: 180000,
            discount: 20000,
            finalTotal: 160000,
            couponCode: 'PROMO20',
            status: 'completed',
            paymentMethod: 'credit_card',
            deliveryAddress: 'Jl. Bagus No. 789, Jakarta',
            notes: 'Barang sudah dikirim'
        });
        console.log('✅ Order 3 created:', order3.orderNumber);

        // Now create some order items
        const product1 = await db.Product.findByPk(1);
        const product2 = await db.Product.findByPk(2);
        const product3 = await db.Product.findByPk(3);

        if (product1) {
            await db.OrderItem.create({
                orderId: order1.id,
                productId: product1.id,
                quantity: 2
            });
        }

        if (product2) {
            await db.OrderItem.create({
                orderId: order2.id,
                productId: product2.id,
                quantity: 1
            });
            await db.OrderItem.create({
                orderId: order2.id,
                productId: product3.id,
                quantity: 3
            });
        }

        if (product1 && product3) {
            await db.OrderItem.create({
                orderId: order3.id,
                productId: product1.id,
                quantity: 1
            });
            await db.OrderItem.create({
                orderId: order3.id,
                productId: product3.id,
                quantity: 2
            });
        }

        console.log('\n✅ Sample orders created successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating orders:', error.message);
        console.error(error);
        process.exit(1);
    }
}

createSampleOrders();
