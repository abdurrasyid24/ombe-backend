# Ombe Coffee API Documentation

Base URL: `http://localhost:5000/api`

## Daftar Isi
- [Authentication](#authentication)
- [Categories](#categories)
- [Products](#products)
- [Orders](#orders)

---

## Authentication

### 1. Register User
Mendaftarkan pengguna baru.

**Endpoint:** `POST /api/auth/register`

**Access:** Public

**Request Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123",
  "fullName": "John Doe",
  "phone": "081234567890",
  "address": "Jl. Contoh No. 123, Jakarta"
}
```

**Response Success (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "fullName": "John Doe",
    "phone": "081234567890",
    "address": "Jl. Contoh No. 123, Jakarta",
    "role": "user"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### 2. Login User
Login untuk mendapatkan token authentication.

**Endpoint:** `POST /api/auth/login`

**Access:** Public

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "fullName": "John Doe",
    "role": "user"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### 3. Logout User
Logout dari sistem.

**Endpoint:** `POST /api/auth/logout`

**Access:** Private (memerlukan token)

**Headers:**
```
Authorization: Bearer <token>
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

---

### 4. Get Current User Profile
Mendapatkan informasi profil user yang sedang login.

**Endpoint:** `GET /api/auth/me`

**Access:** Private

**Headers:**
```
Authorization: Bearer <token>
```

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "fullName": "John Doe",
    "phone": "081234567890",
    "address": "Jl. Contoh No. 123, Jakarta",
    "role": "user"
  }
}
```

---

### 5. Update Profile
Update profil user yang sedang login.

**Endpoint:** `PUT /api/auth/profile`

**Access:** Private

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "fullName": "John Doe Updated",
  "phone": "081234567891",
  "address": "Jl. Baru No. 456, Bandung"
}
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "fullName": "John Doe Updated",
    "phone": "081234567891",
    "address": "Jl. Baru No. 456, Bandung",
    "role": "user"
  }
}
```

---

### 6. Change Password
Mengubah password user yang sedang login.

**Endpoint:** `PUT /api/auth/change-password`

**Access:** Private

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "currentPassword": "password123",
  "newPassword": "newpassword123"
}
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

---

### 7. Get All Users (Admin Only)
Mendapatkan semua user yang terdaftar.

**Endpoint:** `GET /api/auth/users`

**Access:** Admin Only

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response Success (200):**
```json
{
  "success": true,
  "count": 10,
  "data": [
    {
      "id": 1,
      "username": "johndoe",
      "email": "john@example.com",
      "fullName": "John Doe",
      "role": "user"
    }
  ]
}
```

---

### 8. Get User by ID (Admin Only)
Mendapatkan detail user berdasarkan ID.

**Endpoint:** `GET /api/auth/users/:id`

**Access:** Admin Only

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "fullName": "John Doe",
    "phone": "081234567890",
    "address": "Jl. Contoh No. 123, Jakarta",
    "role": "user"
  }
}
```

---

### 9. Update User (Admin Only)
Update informasi user tertentu.

**Endpoint:** `PUT /api/auth/users/:id`

**Access:** Admin Only

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "fullName": "John Doe Updated",
  "role": "admin"
}
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "fullName": "John Doe Updated",
    "role": "admin"
  }
}
```

---

### 10. Delete User (Admin Only)
Menghapus user dari sistem.

**Endpoint:** `DELETE /api/auth/users/:id`

**Access:** Admin Only

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

---

## Categories

### 1. Get All Categories
Mendapatkan semua kategori produk.

**Endpoint:** `GET /api/categories`

**Access:** Public

**Query Parameters:**
- `active` (optional): Filter by status (true/false)

**Response Success (200):**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "id": 1,
      "name": "Coffee",
      "description": "All types of coffee beverages",
      "image": "https://cloudinary.com/...",
      "isActive": true,
      "createdAt": "2023-12-01T00:00:00.000Z",
      "updatedAt": "2023-12-01T00:00:00.000Z"
    }
  ]
}
```

---

### 2. Get Single Category
Mendapatkan detail kategori berdasarkan ID.

**Endpoint:** `GET /api/categories/:id`

**Access:** Public

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Coffee",
    "description": "All types of coffee beverages",
    "image": "https://cloudinary.com/...",
    "isActive": true,
    "createdAt": "2023-12-01T00:00:00.000Z",
    "updatedAt": "2023-12-01T00:00:00.000Z"
  }
}
```

---

### 3. Get Category Products
Mendapatkan semua produk dalam kategori tertentu.

**Endpoint:** `GET /api/categories/:id/products`

**Access:** Public

**Response Success (200):**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "id": 1,
      "name": "Cappuccino",
      "description": "Classic Italian coffee with steamed milk",
      "price": 35000,
      "image": "https://cloudinary.com/...",
      "stock": 100,
      "categoryId": 1,
      "isFeatured": true,
      "isAvailable": true
    }
  ]
}
```

---

### 4. Create Category (Admin Only)
Membuat kategori baru.

**Endpoint:** `POST /api/categories`

**Access:** Admin Only

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "name": "Tea",
  "description": "Various tea beverages",
  "image": "https://cloudinary.com/..."
}
```

**Response Success (201):**
```json
{
  "success": true,
  "message": "Category created successfully",
  "data": {
    "id": 2,
    "name": "Tea",
    "description": "Various tea beverages",
    "image": "https://cloudinary.com/...",
    "isActive": true
  }
}
```

---

### 5. Update Category (Admin Only)
Update informasi kategori.

**Endpoint:** `PUT /api/categories/:id`

**Access:** Admin Only

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "name": "Premium Coffee",
  "description": "Premium coffee beverages"
}
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Category updated successfully",
  "data": {
    "id": 1,
    "name": "Premium Coffee",
    "description": "Premium coffee beverages",
    "image": "https://cloudinary.com/...",
    "isActive": true
  }
}
```

---

### 6. Delete Category (Admin Only)
Menghapus kategori dari sistem.

**Endpoint:** `DELETE /api/categories/:id`

**Access:** Admin Only

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Category deleted successfully"
}
```

---

### 7. Deactivate Category (Admin Only)
Menonaktifkan kategori.

**Endpoint:** `PUT /api/categories/:id/deactivate`

**Access:** Admin Only

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Category deactivated successfully",
  "data": {
    "id": 1,
    "name": "Coffee",
    "isActive": false
  }
}
```

---

### 8. Activate Category (Admin Only)
Mengaktifkan kembali kategori.

**Endpoint:** `PUT /api/categories/:id/activate`

**Access:** Admin Only

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Category activated successfully",
  "data": {
    "id": 1,
    "name": "Coffee",
    "isActive": true
  }
}
```

---

### 9. Get Category Stats (Admin Only)
Mendapatkan statistik kategori.

**Endpoint:** `GET /api/categories/:id/stats`

**Access:** Admin Only

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "categoryId": 1,
    "categoryName": "Coffee",
    "totalProducts": 10,
    "totalOrders": 50,
    "totalRevenue": 5000000
  }
}
```

---

## Products

### 1. Get All Products
Mendapatkan semua produk.

**Endpoint:** `GET /api/products`

**Access:** Public

**Query Parameters:**
- `categoryId` (optional): Filter by category
- `search` (optional): Search by product name
- `minPrice` (optional): Minimum price filter
- `maxPrice` (optional): Maximum price filter
- `available` (optional): Filter by availability (true/false)

**Response Success (200):**
```json
{
  "success": true,
  "count": 10,
  "data": [
    {
      "id": 1,
      "name": "Cappuccino",
      "description": "Classic Italian coffee with steamed milk",
      "price": 35000,
      "image": "https://cloudinary.com/...",
      "stock": 100,
      "categoryId": 1,
      "isFeatured": true,
      "isAvailable": true,
      "category": {
        "id": 1,
        "name": "Coffee"
      }
    }
  ]
}
```

---

### 2. Get Single Product
Mendapatkan detail produk berdasarkan ID.

**Endpoint:** `GET /api/products/:id`

**Access:** Public

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Cappuccino",
    "description": "Classic Italian coffee with steamed milk",
    "price": 35000,
    "image": "https://cloudinary.com/...",
    "stock": 100,
    "categoryId": 1,
    "isFeatured": true,
    "isAvailable": true,
    "category": {
      "id": 1,
      "name": "Coffee",
      "description": "All types of coffee beverages"
    }
  }
}
```

---

### 3. Get Featured Products
Mendapatkan produk-produk unggulan.

**Endpoint:** `GET /api/products/featured/list`

**Access:** Public

**Response Success (200):**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "id": 1,
      "name": "Cappuccino",
      "description": "Classic Italian coffee with steamed milk",
      "price": 35000,
      "image": "https://cloudinary.com/...",
      "isFeatured": true,
      "isAvailable": true
    }
  ]
}
```

---

### 4. Create Product (Admin Only)
Membuat produk baru.

**Endpoint:** `POST /api/products`

**Access:** Admin Only

**Headers:**
```
Authorization: Bearer <admin_token>
Content-Type: multipart/form-data
```

**Request Body (multipart/form-data):**
```
name: Latte
description: Espresso with steamed milk
price: 30000
categoryId: 1
stock: 50
isFeatured: true
image: [file upload]
```

**Response Success (201):**
```json
{
  "success": true,
  "message": "Product created successfully",
  "data": {
    "id": 2,
    "name": "Latte",
    "description": "Espresso with steamed milk",
    "price": 30000,
    "image": "https://cloudinary.com/...",
    "stock": 50,
    "categoryId": 1,
    "isFeatured": true,
    "isAvailable": true
  }
}
```

---

### 5. Update Product (Admin Only)
Update informasi produk.

**Endpoint:** `PUT /api/products/:id`

**Access:** Admin Only

**Headers:**
```
Authorization: Bearer <admin_token>
Content-Type: multipart/form-data
```

**Request Body (multipart/form-data):**
```
name: Premium Latte
price: 40000
stock: 75
image: [file upload] (optional)
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Product updated successfully",
  "data": {
    "id": 2,
    "name": "Premium Latte",
    "description": "Espresso with steamed milk",
    "price": 40000,
    "image": "https://cloudinary.com/...",
    "stock": 75,
    "categoryId": 1,
    "isFeatured": true,
    "isAvailable": true
  }
}
```

---

### 6. Delete Product (Admin Only)
Menghapus produk dari sistem.

**Endpoint:** `DELETE /api/products/:id`

**Access:** Admin Only

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Product deleted successfully"
}
```

---

## Orders

### 1. Get All Orders
Mendapatkan semua order (user melihat order sendiri, admin melihat semua).

**Endpoint:** `GET /api/orders`

**Access:** Private

**Headers:**
```
Authorization: Bearer <token>
```

**Response Success (200):**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "id": 1,
      "orderNumber": "OMB-ABCD1234-XYZ",
      "userId": 1,
      "totalAmount": 70000,
      "status": "pending",
      "notes": "Extra hot please",
      "deliveryAddress": "Jl. Contoh No. 123, Jakarta",
      "createdAt": "2023-12-01T10:00:00.000Z",
      "user": {
        "id": 1,
        "username": "johndoe",
        "email": "john@example.com",
        "fullName": "John Doe"
      },
      "items": [
        {
          "id": 1,
          "orderId": 1,
          "productId": 1,
          "quantity": 2,
          "price": 35000,
          "subtotal": 70000,
          "product": {
            "id": 1,
            "name": "Cappuccino",
            "image": "https://cloudinary.com/...",
            "price": 35000
          }
        }
      ]
    }
  ]
}
```

---

### 2. Get Single Order
Mendapatkan detail order berdasarkan ID.

**Endpoint:** `GET /api/orders/:id`

**Access:** Private

**Headers:**
```
Authorization: Bearer <token>
```

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "orderNumber": "OMB-ABCD1234-XYZ",
    "userId": 1,
    "totalAmount": 70000,
    "status": "pending",
    "notes": "Extra hot please",
    "deliveryAddress": "Jl. Contoh No. 123, Jakarta",
    "createdAt": "2023-12-01T10:00:00.000Z",
    "user": {
      "id": 1,
      "username": "johndoe",
      "email": "john@example.com",
      "fullName": "John Doe"
    },
    "items": [
      {
        "id": 1,
        "orderId": 1,
        "productId": 1,
        "quantity": 2,
        "price": 35000,
        "subtotal": 70000,
        "product": {
          "id": 1,
          "name": "Cappuccino",
          "image": "https://cloudinary.com/...",
          "price": 35000
        }
      }
    ]
  }
}
```

---

### 3. Create Order
Membuat order baru.

**Endpoint:** `POST /api/orders`

**Access:** Private

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "items": [
    {
      "productId": 1,
      "quantity": 2
    },
    {
      "productId": 2,
      "quantity": 1
    }
  ],
  "notes": "Extra hot please",
  "deliveryAddress": "Jl. Contoh No. 123, Jakarta"
}
```

**Response Success (201):**
```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "id": 1,
    "orderNumber": "OMB-ABCD1234-XYZ",
    "userId": 1,
    "totalAmount": 95000,
    "status": "pending",
    "notes": "Extra hot please",
    "deliveryAddress": "Jl. Contoh No. 123, Jakarta",
    "items": [
      {
        "productId": 1,
        "quantity": 2,
        "price": 35000,
        "subtotal": 70000
      },
      {
        "productId": 2,
        "quantity": 1,
        "price": 25000,
        "subtotal": 25000
      }
    ]
  }
}
```

---

### 4. Update Order Status (Admin Only)
Update status order.

**Endpoint:** `PUT /api/orders/:id/status`

**Access:** Admin Only

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "status": "processing"
}
```

**Status yang valid:**
- `pending` - Order baru dibuat
- `processing` - Order sedang diproses
- `completed` - Order selesai
- `cancelled` - Order dibatalkan

**Response Success (200):**
```json
{
  "success": true,
  "message": "Order status updated successfully",
  "data": {
    "id": 1,
    "orderNumber": "OMB-ABCD1234-XYZ",
    "status": "processing"
  }
}
```

---

### 5. Cancel Order
Membatalkan order (user hanya bisa membatalkan order sendiri).

**Endpoint:** `PUT /api/orders/:id/cancel`

**Access:** Private

**Headers:**
```
Authorization: Bearer <token>
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Order cancelled successfully",
  "data": {
    "id": 1,
    "orderNumber": "OMB-ABCD1234-XYZ",
    "status": "cancelled"
  }
}
```

---

### 6. Delete Order (Admin Only)
Menghapus order dari sistem.

**Endpoint:** `DELETE /api/orders/:id`

**Access:** Admin Only

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Order deleted successfully"
}
```

---

## Error Responses

Semua endpoint dapat mengembalikan error response dengan format berikut:

### Error 400 - Bad Request
```json
{
  "success": false,
  "message": "Please provide all required fields"
}
```

### Error 401 - Unauthorized
```json
{
  "success": false,
  "message": "Not authorized to access this route"
}
```

### Error 403 - Forbidden
```json
{
  "success": false,
  "message": "User role 'user' is not authorized to access this route"
}
```

### Error 404 - Not Found
```json
{
  "success": false,
  "message": "Resource not found"
}
```

### Error 500 - Internal Server Error
```json
{
  "success": false,
  "message": "Server Error"
}
```

---

## Langkah-Langkah Penggunaan

### 1. Testing dengan Postman/Thunder Client

#### A. Setup Environment
1. Buat environment baru di Postman
2. Tambahkan variable:
   - `base_url`: `http://localhost:5000/api`
   - `token`: (akan diisi setelah login)

#### B. Flow User Biasa
1. **Register**: `POST {{base_url}}/auth/register`
2. **Login**: `POST {{base_url}}/auth/login` → Simpan token yang didapat
3. **Lihat Profile**: `GET {{base_url}}/auth/me`
4. **Lihat Kategori**: `GET {{base_url}}/categories`
5. **Lihat Produk**: `GET {{base_url}}/products`
6. **Buat Order**: `POST {{base_url}}/orders`
7. **Lihat Order Saya**: `GET {{base_url}}/orders`
8. **Batalkan Order**: `PUT {{base_url}}/orders/:id/cancel`

#### C. Flow Admin
1. **Login sebagai Admin**: `POST {{base_url}}/auth/login`
2. **Kelola Kategori**:
   - Create: `POST {{base_url}}/categories`
   - Update: `PUT {{base_url}}/categories/:id`
   - Delete: `DELETE {{base_url}}/categories/:id`
3. **Kelola Produk**:
   - Create: `POST {{base_url}}/products` (dengan upload gambar)
   - Update: `PUT {{base_url}}/products/:id`
   - Delete: `DELETE {{base_url}}/products/:id`
4. **Kelola Order**:
   - Lihat semua order: `GET {{base_url}}/orders`
   - Update status: `PUT {{base_url}}/orders/:id/status`
   - Delete order: `DELETE {{base_url}}/orders/:id`
5. **Kelola User**:
   - Lihat semua user: `GET {{base_url}}/users`
   - Update user: `PUT {{base_url}}/users/:id`
   - Delete user: `DELETE {{base_url}}/users/:id`

### 2. Contoh Request dengan cURL

#### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

#### Get Products dengan Token
```bash
curl -X GET http://localhost:5000/api/products \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### Create Order
```bash
curl -X POST http://localhost:5000/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "items": [
      {
        "productId": 1,
        "quantity": 2
      }
    ],
    "deliveryAddress": "Jl. Contoh No. 123"
  }'
```

### 3. Tips Penggunaan
- Selalu sertakan token di header `Authorization: Bearer <token>` untuk endpoint yang memerlukan autentikasi
- Untuk upload file (produk), gunakan `Content-Type: multipart/form-data`
- Token yang didapat dari login harus disimpan dan digunakan untuk request selanjutnya
- User biasa hanya bisa melihat dan mengelola data mereka sendiri
- Admin memiliki akses penuh ke semua endpoint

---

## Catatan Penting
1. Token akan expired sesuai dengan konfigurasi `JWT_EXPIRE` di environment variable
2. Password akan di-hash secara otomatis sebelum disimpan ke database
3. Image upload menggunakan Cloudinary, pastikan konfigurasi Cloudinary sudah benar
4. Order number akan di-generate otomatis dengan format `OMB-{timestamp}-{random}`
5. Stock produk akan berkurang otomatis saat order dibuat
6. Order hanya bisa dibatalkan jika statusnya masih `pending`
