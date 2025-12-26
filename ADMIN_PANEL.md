# Admin Panel & API Documentation

## Access Admin Panel
**URL:** `http://localhost:5000/admin`
**Login URL:** `http://localhost:5000/admin/login`

### Demo Admin Account
- **Email:** `admin@ombe.com`
- **Password:** `admin123`

---

## Admin API Endpoints

### 1. Get Dashboard Statistics
Mendapatkan statistik dashboard termasuk total order, pending, processing, completed, dan revenue.

**Endpoint:** `GET /api/admin/dashboard`

**Access:** Admin Only (Protected by JWT)

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Example Request:**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/admin/dashboard
```

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "totalOrders": 25,
    "pendingOrders": 5,
    "processingOrders": 8,
    "completedOrders": 10,
    "cancelledOrders": 2,
    "totalRevenue": 2500000,
    "recentOrders": [
      {
        "id": 1,
        "orderNumber": "OMB-20231215-123456",
        "userId": 2,
        "totalAmount": 100000,
        "finalTotal": 95000,
        "discount": 5000,
        "status": "pending",
        "paymentMethod": "bank_transfer",
        "createdAt": "2023-12-15T10:30:00Z",
        "User": {
          "id": 2,
          "name": "John Doe",
          "email": "john@example.com"
        },
        "OrderItems": [
          {
            "id": 1,
            "orderId": 1,
            "productId": 1,
            "quantity": 2
          }
        ]
      }
    ]
  }
}
```

---

### 2. Get All Orders (with Filters & Pagination)
Mendapatkan semua order dengan opsi filter berdasarkan status dan pagination.

**Endpoint:** `GET /api/admin/orders`

**Access:** Admin Only (Protected by JWT)

**Query Parameters:**
- `status` (optional): Filter by status - `pending`, `processing`, `completed`, `cancelled`
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Example Request:**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:5000/api/admin/orders?status=pending&page=1&limit=10"
```

**Response Success (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "orderNumber": "OMB-20231215-123456",
      "userId": 2,
      "totalAmount": 100000,
      "finalTotal": 95000,
      "discount": 5000,
      "status": "pending",
      "paymentMethod": "bank_transfer",
      "createdAt": "2023-12-15T10:30:00Z",
      "updatedAt": "2023-12-15T10:30:00Z",
      "User": {
        "id": 2,
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "081234567890"
      },
      "OrderItems": [
        {
          "id": 1,
          "orderId": 1,
          "productId": 1,
          "quantity": 2,
          "Product": {
            "id": 1,
            "name": "Espresso",
            "price": 50000
          }
        }
      ]
    }
  ],
  "pagination": {
    "total": 25,
    "currentPage": 1,
    "totalPages": 3
  }
}
```

---

### 3. Get Order Detail
Mendapatkan detail order spesifik dengan semua informasi customer dan items.

**Endpoint:** `GET /api/admin/orders/:id`

**Access:** Admin Only (Protected by JWT)

**URL Parameters:**
- `id` (required): Order ID

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Example Request:**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/admin/orders/1
```

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "orderNumber": "OMB-20231215-123456",
    "userId": 2,
    "totalAmount": 100000,
    "finalTotal": 95000,
    "discount": 5000,
    "couponCode": null,
    "status": "pending",
    "paymentMethod": "bank_transfer",
    "deliveryAddress": "Jl. Contoh No. 123, Jakarta",
    "createdAt": "2023-12-15T10:30:00Z",
    "updatedAt": "2023-12-15T10:30:00Z",
    "User": {
      "id": 2,
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "081234567890"
    },
    "OrderItems": [
      {
        "id": 1,
        "orderId": 1,
        "productId": 1,
        "quantity": 2,
        "createdAt": "2023-12-15T10:30:00Z",
        "Product": {
          "id": 1,
          "name": "Espresso",
          "price": 50000,
          "image": "https://example.com/espresso.jpg"
        }
      }
    ]
  }
}
```

**Response Error (404):**
```json
{
  "success": false,
  "message": "Order not found"
}
```

---

### 4. Update Order Status
Mengubah status order (ubah dari pending → processing → completed atau ke cancelled).

**Endpoint:** `PUT /api/admin/orders/:id/status`

**Access:** Admin Only (Protected by JWT)

**URL Parameters:**
- `id` (required): Order ID

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "status": "processing"
}
```

**Valid Status Values:**
- `pending` - Order baru/menunggu
- `processing` - Sedang diproses
- `completed` - Selesai
- `cancelled` - Dibatalkan

**Example Request:**
```bash
curl -X PUT \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "processing"}' \
  http://localhost:5000/api/admin/orders/1/status
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Order status updated from pending to processing",
  "data": {
    "id": 1,
    "orderNumber": "OMB-20231215-123456",
    "userId": 2,
    "totalAmount": 100000,
    "finalTotal": 95000,
    "discount": 5000,
    "status": "processing",
    "paymentMethod": "bank_transfer",
    "deliveryAddress": "Jl. Contoh No. 123, Jakarta",
    "createdAt": "2023-12-15T10:30:00Z",
    "updatedAt": "2023-12-15T11:45:00Z"
  }
}
```

**Response Error - Invalid Status (400):**
```json
{
  "success": false,
  "message": "Invalid status. Must be one of: pending, processing, completed, cancelled"
}
```

**Response Error - Order Not Found (404):**
```json
{
  "success": false,
  "message": "Order not found"
}
```

**Response Error - Access Denied (403):**
```json
{
  "success": false,
  "message": "Access denied. Admin privileges required.",
  "status": 403
}
```

---

## Admin Panel Features

### Dashboard
- Menampilkan statistik order (pending, processing, completed, cancelled)
- Menampilkan total revenue
- Menampilkan 10 order terbaru

### Manage Orders
- Melihat semua order dengan tabel lengkap
- Filter order berdasarkan status
- Pagination untuk navigasi order
- Melihat detail order
- Mengubah status order langsung dari modal

### Order Detail Modal
- Informasi lengkap tentang order
- Data customer (nama, email, telepon, alamat)
- Detail pembayaran dan total
- Daftar produk yang dipesan
- Tombol untuk mengubah status order

---

## Important Notes

1. **Authentication**: Semua endpoint admin memerlukan JWT token yang valid. Token didapat dari login.
2. **Authorization**: Hanya user dengan role 'admin' yang bisa mengakses admin endpoints.
3. **Token Storage**: Admin panel menyimpan token di localStorage untuk persistensi session.
4. **Status Workflow**: Biasanya status berubah: pending → processing → completed (atau cancelled kapan saja)
5. **Real-time Update**: Setelah mengubah status, data akan langsung diperbarui di dashboard
6. **No Delete**: Admin tidak bisa menghapus order, hanya bisa mengubah status menjadi cancelled

---

## Error Handling

Semua error response mengikuti format:

```json
{
  "success": false,
  "message": "Error description"
}
```

### Status Code Reference
- `200` - Success
- `400` - Bad request (invalid data)
- `401` - Unauthorized (token tidak valid)
- `403` - Forbidden (tidak punya akses)
- `404` - Not found (order/resource tidak ditemukan)
- `500` - Server error

