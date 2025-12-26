// API Configuration
const API_BASE = 'http://localhost:5000/api';
let currentPage = 1;
let currentStatus = '';

// Get token from localStorage
function getToken() {
    return localStorage.getItem('adminToken');
}

// API Headers
function getHeaders() {
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
    };
}

// Load Dashboard
async function loadDashboard() {
    try {
        const token = getToken();
        console.log('Token from storage:', token ? 'Present' : 'Missing');
        
        const response = await fetch(`${API_BASE}/admin/dashboard`, {
            headers: getHeaders()
        });

        console.log('Dashboard response status:', response.status);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('API Error:', errorData);
            throw new Error(errorData.message || `Failed to load dashboard (${response.status})`);
        }

        const data = await response.json();
        console.log('Dashboard data:', data);
        
        const dashboard = data.data;

        if (!dashboard) {
            throw new Error('No data received from API');
        }

        // Update stats
        document.getElementById('pendingCount').textContent = dashboard.pendingOrders || 0;
        document.getElementById('processingCount').textContent = dashboard.processingOrders || 0;
        document.getElementById('completedCount').textContent = dashboard.completedOrders || 0;
        document.getElementById('revenueCount').textContent = formatCurrency(dashboard.totalRevenue || 0);

        // Load recent orders
        loadRecentOrders(dashboard.recentOrders || []);
    } catch (error) {
        console.error('Error loading dashboard:', error);
        document.getElementById('pendingCount').textContent = '0';
        document.getElementById('processingCount').textContent = '0';
        document.getElementById('completedCount').textContent = '0';
        document.getElementById('revenueCount').textContent = 'Rp 0';
        document.getElementById('recentOrdersTable').innerHTML = `<tr><td colspan="6" class="text-center" style="color: red; padding: 20px;">Error: ${error.message}</td></tr>`;
    }
}

// Load Recent Orders
function loadRecentOrders(orders) {
    const tbody = document.getElementById('recentOrdersTable');
    
    if (!orders || orders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">No orders found</td></tr>';
        return;
    }

    tbody.innerHTML = orders.map(order => `
        <tr>
            <td><strong>${order.orderNumber}</strong></td>
            <td>${order.user?.fullName || 'N/A'}</td>
            <td>Rp ${formatNumber(order.finalTotal)}</td>
            <td><span class="status-badge status-${order.status}">${order.status.toUpperCase()}</span></td>
            <td>${formatDate(order.createdAt)}</td>
            <td>
                <button class="btn btn-primary btn-sm" onclick="openOrderDetail(${order.id})">
                    View
                </button>
            </td>
        </tr>
    `).join('');
}

// Load All Orders
async function loadAllOrders(page = 1, status = '') {
    try {
        let url = `${API_BASE}/admin/orders?page=${page}&limit=10`;
        if (status) url += `&status=${status}`;

        console.log('Fetching orders from:', url);

        const response = await fetch(url, {
            headers: getHeaders()
        });

        console.log('Orders response status:', response.status);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('API Error:', errorData);
            throw new Error(errorData.message || `Failed to load orders (${response.status})`);
        }

        const data = await response.json();
        console.log('Orders data:', data);
        
        const orders = data.data || [];
        const pagination = data.pagination || {};

        // Load orders table
        const tbody = document.getElementById('ordersTable');
        
        if (!orders || orders.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center">No orders found</td></tr>';
        } else {
            tbody.innerHTML = orders.map(order => `
                <tr>
                    <td><strong>${order.orderNumber}</strong></td>
                    <td>${order.user?.fullName || 'N/A'}</td>
                    <td>${order.user?.email || 'N/A'}</td>
                    <td>Rp ${formatNumber(order.finalTotal)}</td>
                    <td><span class="status-badge status-${order.status}">${order.status.toUpperCase()}</span></td>
                    <td>${formatDate(order.createdAt)}</td>
                    <td>
                        <button class="btn btn-primary btn-sm" onclick="openOrderDetail(${order.id})">
                            Edit
                        </button>
                    </td>
                </tr>
            `).join('');
        }

        // Load pagination
        loadPagination(pagination);
    } catch (error) {
        console.error('Error loading orders:', error);
        const tbody = document.getElementById('ordersTable');
        tbody.innerHTML = `<tr><td colspan="7" class="text-center" style="color: red; padding: 20px;">Error: ${error.message}</td></tr>`;
    }
}

// Load Pagination
function loadPagination(pagination) {
    const paginationDiv = document.getElementById('pagination');
    
    if (pagination.totalPages <= 1) {
        paginationDiv.innerHTML = '';
        return;
    }

    let html = '';

    // Previous button
    if (pagination.currentPage > 1) {
        html += `<button onclick="goToPage(${pagination.currentPage - 1})">Previous</button>`;
    }

    // Page numbers
    for (let i = 1; i <= pagination.totalPages; i++) {
        if (i === pagination.currentPage) {
            html += `<button class="active">${i}</button>`;
        } else {
            html += `<button onclick="goToPage(${i})">${i}</button>`;
        }
    }

    // Next button
    if (pagination.currentPage < pagination.totalPages) {
        html += `<button onclick="goToPage(${pagination.currentPage + 1})">Next</button>`;
    }

    paginationDiv.innerHTML = html;
}

// Go to page
function goToPage(page) {
    currentPage = page;
    loadAllOrders(page, currentStatus);
}

// Open Order Detail Modal
async function openOrderDetail(orderId) {
    try {
        console.log('Opening order detail for ID:', orderId);
        
        const response = await fetch(`${API_BASE}/admin/orders/${orderId}`, {
            headers: getHeaders()
        });

        console.log('Order detail response status:', response.status);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('API Error:', errorData);
            throw new Error(errorData.message || `Failed to load order (${response.status})`);
        }

        const data = await response.json();
        console.log('Order detail data:', data);
        
        showOrderDetailModal(data);
    } catch (error) {
        console.error('Error loading order:', error);
        alert('Failed to load order details: ' + error.message);
    }
}

// Show Order Detail Modal
async function showOrderDetailModal(promise) {
    const data = await promise;
    const order = data.data;

    const modal = document.getElementById('orderModal');
    const content = document.getElementById('orderDetailContent');

    const itemsHTML = (order.items || []).map(item => `
        <tr>
            <td>${item.product?.name || 'N/A'}</td>
            <td>${item.quantity}</td>
            <td>Rp ${formatNumber(item.product?.price || 0)}</td>
            <td>Rp ${formatNumber((item.product?.price || 0) * item.quantity)}</td>
        </tr>
    `).join('');

    content.innerHTML = `
        <div class="order-detail">
            <div>
                <div class="detail-group">
                    <h3>Order Information</h3>
                    <div class="detail-row">
                        <span class="detail-label">Order Number:</span>
                        <span class="detail-value"><strong>${order.orderNumber}</strong></span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Order Date:</span>
                        <span class="detail-value">${formatDate(order.createdAt)}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Current Status:</span>
                        <span class="detail-value"><span class="status-badge status-${order.status}">${order.status.toUpperCase()}</span></span>
                    </div>
                </div>

                <div class="detail-group">
                    <h3>Customer Information</h3>
                    <div class="detail-row">
                        <span class="detail-label">Name:</span>
                        <span class="detail-value">${order.user?.fullName || order.user?.name || 'N/A'}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Email:</span>
                        <span class="detail-value">${order.user?.email || 'N/A'}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Phone:</span>
                        <span class="detail-value">${order.user?.phone || 'N/A'}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Delivery Address:</span>
                        <span class="detail-value">${order.deliveryAddress || 'N/A'}</span>
                    </div>
                </div>
            </div>

            <div>
                <div class="detail-group">
                    <h3>Payment & Amount</h3>
                    <div class="detail-row">
                        <span class="detail-label">Payment Method:</span>
                        <span class="detail-value">${order.paymentMethod || 'N/A'}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Subtotal:</span>
                        <span class="detail-value">Rp ${formatNumber(order.totalAmount)}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Discount:</span>
                        <span class="detail-value">- Rp ${formatNumber(order.discount || 0)}</span>
                    </div>
                    <div class="detail-row" style="border-top: 1px solid #eee; padding-top: 10px; margin-top: 10px;">
                        <span class="detail-label"><strong>Final Total:</strong></span>
                        <span class="detail-value"><strong>Rp ${formatNumber(order.finalTotal)}</strong></span>
                    </div>
                </div>
            </div>

            <div class="detail-group" style="grid-column: 1 / -1;">
                <h3>Order Items</h3>
                <table class="items-table">
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>Quantity</th>
                            <th>Unit Price</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsHTML}
                    </tbody>
                </table>
            </div>

            <div class="status-update-section">
                <h3>Update Order Status</h3>
                <p style="color: #666; margin-bottom: 15px;">Select the new status for this order:</p>
                <div class="status-options">
                    <button class="status-btn status-pending-btn" onclick="updateOrderStatus(${order.id}, 'pending')" ${order.status === 'pending' ? 'disabled' : ''}>
                        <i class="fas fa-clock"></i> Pending
                    </button>
                    <button class="status-btn status-processing-btn" onclick="updateOrderStatus(${order.id}, 'processing')" ${order.status === 'processing' ? 'disabled' : ''}>
                        <i class="fas fa-spinner"></i> Processing
                    </button>
                    <button class="status-btn status-completed-btn" onclick="updateOrderStatus(${order.id}, 'completed')" ${order.status === 'completed' ? 'disabled' : ''}>
                        <i class="fas fa-check-circle"></i> Completed
                    </button>
                    <button class="status-btn status-cancelled-btn" onclick="updateOrderStatus(${order.id}, 'cancelled')" ${order.status === 'cancelled' ? 'disabled' : ''}>
                        <i class="fas fa-times-circle"></i> Cancelled
                    </button>
                </div>
            </div>
        </div>
    `;

    modal.classList.add('active');
}

// Update Order Status
async function updateOrderStatus(orderId, newStatus) {
    if (!confirm(`Are you sure you want to change the status to ${newStatus.toUpperCase()}?`)) {
        return;
    }

    try {
        console.log('Updating order', orderId, 'to status:', newStatus);

        const response = await fetch(`${API_BASE}/admin/orders/${orderId}/status`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify({ status: newStatus })
        });

        console.log('Update response status:', response.status);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('API Error:', errorData);
            throw new Error(errorData.message || `Failed to update status (${response.status})`);
        }

        const data = await response.json();
        console.log('Update response:', data);
        
        alert('Order status updated successfully!');

        // Reload the order detail
        openOrderDetail(orderId);

        // Reload orders list if on orders page
        const ordersView = document.getElementById('ordersView');
        if (ordersView && ordersView.style.display !== 'none') {
            loadAllOrders(currentPage, currentStatus);
        }

        // Reload dashboard
        const dashboardView = document.getElementById('dashboardView');
        if (dashboardView && dashboardView.style.display !== 'none') {
            loadDashboard();
        }
    } catch (error) {
        console.error('Error updating order status:', error);
        alert('Failed to update order status: ' + error.message);
    }
}

// Format Currency
function formatCurrency(value) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(value);
}

// Format Number
function formatNumber(value) {
    return new Intl.NumberFormat('id-ID', {
        minimumFractionDigits: 0
    }).format(value);
}

// Format Date
function formatDate(dateString) {
    const options = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('id-ID', options);
}

// Load All Users
async function loadAllUsers(page = 1) {
    try {
        const response = await fetch(`${API_BASE}/admin/users?page=${page}&limit=10`, {
            headers: getHeaders()
        });

        if (!response.ok) {
            throw new Error(`Failed to load users (${response.status})`);
        }

        const data = await response.json();
        const users = data.data || [];
        const pagination = data.pagination || {};

        const tbody = document.getElementById('usersTable');
        
        if (!users || users.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" class="text-center">No users found</td></tr>';
        } else {
            tbody.innerHTML = users.map(user => `
                <tr>
                    <td>${user.id}</td>
                    <td><strong>${user.username}</strong></td>
                    <td>${user.email}</td>
                    <td>${user.fullName || 'N/A'}</td>
                    <td>${user.phone || 'N/A'}</td>
                    <td><span class="badge" style="background: ${user.role === 'admin' ? '#ff9800' : '#4caf50'}; color: white; padding: 4px 8px; border-radius: 3px; font-size: 12px;">${user.role.toUpperCase()}</span></td>
                    <td><span class="badge" style="background: ${user.isActive ? '#4caf50' : '#f44336'}; color: white; padding: 4px 8px; border-radius: 3px; font-size: 12px;">${user.isActive ? 'ACTIVE' : 'INACTIVE'}</span></td>
                    <td>${formatDate(user.createdAt)}</td>
                </tr>
            `).join('');
        }

        // Load pagination
        loadPagination(pagination, 'loadAllUsers', 'usersPagination');
    } catch (error) {
        console.error('Error loading users:', error);
        const tbody = document.getElementById('usersTable');
        tbody.innerHTML = `<tr><td colspan="8" class="text-center" style="color: red; padding: 20px;">Error: ${error.message}</td></tr>`;
    }
}

// Load All Products
async function loadAllProducts(page = 1) {
    try {
        const response = await fetch(`${API_BASE}/admin/products?page=${page}&limit=10`, {
            headers: getHeaders()
        });

        if (!response.ok) {
            throw new Error(`Failed to load products (${response.status})`);
        }

        const data = await response.json();
        const products = data.data || [];
        const pagination = data.pagination || {};

        const tbody = document.getElementById('productsTable');
        
        if (!products || products.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" class="text-center">No products found</td></tr>';
        } else {
            tbody.innerHTML = products.map(product => `
                <tr>
                    <td>${product.id}</td>
                    <td><strong>${product.name}</strong></td>
                    <td>${product.category?.name || 'N/A'}</td>
                    <td>Rp ${formatNumber(product.price)}</td>
                    <td>${product.stock}</td>
                    <td><span class="badge" style="background: ${product.isFeatured ? '#2196f3' : '#ccc'}; color: white; padding: 4px 8px; border-radius: 3px; font-size: 12px;">${product.isFeatured ? 'YES' : 'NO'}</span></td>
                    <td><span class="badge" style="background: ${product.isActive ? '#4caf50' : '#f44336'}; color: white; padding: 4px 8px; border-radius: 3px; font-size: 12px;">${product.isActive ? 'ACTIVE' : 'INACTIVE'}</span></td>
                    <td>${formatDate(product.createdAt)}</td>
                </tr>
            `).join('');
        }

        // Load pagination
        loadPagination(pagination, 'loadAllProducts', 'productsPagination');
    } catch (error) {
        console.error('Error loading products:', error);
        const tbody = document.getElementById('productsTable');
        tbody.innerHTML = `<tr><td colspan="8" class="text-center" style="color: red; padding: 20px;">Error: ${error.message}</td></tr>`;
    }
}

// Load Pagination with dynamic callback
function loadPagination(pagination, callback, elementId) {
    const paginationDiv = document.getElementById(elementId);
    
    if (pagination.totalPages <= 1) {
        paginationDiv.innerHTML = '';
        return;
    }

    let html = '';

    // Previous button
    if (pagination.currentPage > 1) {
        html += `<button onclick="${callback}(${pagination.currentPage - 1})">Previous</button>`;
    }

    // Page numbers
    for (let i = 1; i <= pagination.totalPages; i++) {
        if (i === pagination.currentPage) {
            html += `<button class="active">${i}</button>`;
        } else {
            html += `<button onclick="${callback}(${i})">${i}</button>`;
        }
    }

    // Next button
    if (pagination.currentPage < pagination.totalPages) {
        html += `<button onclick="${callback}(${pagination.currentPage + 1})">Next</button>`;
    }

    paginationDiv.innerHTML = html;
}

// Navigation
document.addEventListener('DOMContentLoaded', function() {
    // Load dashboard by default
    loadDashboard();

    // Sidebar navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();

            // Remove active class from all links
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            
            // Add active class to clicked link
            this.classList.add('active');

            // Hide all views
            document.getElementById('dashboardView').style.display = 'none';
            document.getElementById('ordersView').style.display = 'none';
            document.getElementById('usersView').style.display = 'none';
            document.getElementById('productsView').style.display = 'none';

            // Show selected view
            const href = this.getAttribute('href');
            if (href === '/admin') {
                document.getElementById('dashboardView').style.display = 'block';
                loadDashboard();
            } else if (href === '/admin/orders') {
                document.getElementById('ordersView').style.display = 'block';
                currentPage = 1;
                loadAllOrders(1, '');
            } else if (href === '/admin/users') {
                document.getElementById('usersView').style.display = 'block';
                loadAllUsers(1);
            } else if (href === '/admin/products') {
                document.getElementById('productsView').style.display = 'block';
                loadAllProducts(1);
            }
        });
    });

    // Status filter
    document.getElementById('statusFilter')?.addEventListener('change', function() {
        currentStatus = this.value;
        currentPage = 1;
        loadAllOrders(1, currentStatus);
    });

    // Search filter
    let searchTimeout;
    document.getElementById('searchInput')?.addEventListener('input', function() {
        clearTimeout(searchTimeout);
        const searchTerm = this.value.trim();
        
        if (searchTerm.length === 0) {
            currentPage = 1;
            loadAllOrders(1, currentStatus);
            return;
        }

        // If you want to implement search, you would need to add a search endpoint
        // For now, just filter client-side or reload with current filters
    });

    // Modal close button
    document.querySelector('.modal-close')?.addEventListener('click', function() {
        document.getElementById('orderModal').classList.remove('active');
    });

    // Close modal when clicking outside
    document.getElementById('orderModal')?.addEventListener('click', function(e) {
        if (e.target === this) {
            this.classList.remove('active');
        }
    });

    // Logout button
    document.getElementById('logoutBtn')?.addEventListener('click', function() {
        if (confirm('Are you sure you want to logout?')) {
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminUser');
            window.location.href = '/admin/login';
        }
    });
});
