# Panduan Integrasi Duitku Payment Gateway (Sandbox)

Panduan ini menjelaskan cara menggunakan integrasi Duitku Payment Gateway yang telah ditambahkan ke project `ombe-backend`.

## 1. Persiapan Akun Duitku Sandbox

1.  Daftar akun di [Duitku Sandbox](https://sandbox.duitku.com/).
2.  Login ke Dashboard Sandbox.
3.  Masuk ke menu **My Project** atau **Proyek Saya**.
4.  Buat Proyek baru (jika belum ada) dan catat informasi berikut:
    *   **Merchant Code**
    *   **API Key**

## 2. Konfigurasi Environment Variable

Buka file `.env` di folder `ombe-backend` dan tambahkan konfigurasi berikut. Ubah nilai sesuai dengan akun Sandbox Anda.

```env
# Duitku Configuration
DUITKU_MERCHANT_CODE=D12345             <-- Ganti dengan Merchant Code Anda
DUITKU_API_KEY=YOUR_SANDBOX_API_KEY     <-- Ganti dengan API Key Anda
DUITKU_PASSPORT_URL=https://sandbox.duitku.com/webapi
DUITKU_CALLBACK_URL=http://localhost:5000/api/payment/callback
DUITKU_RETURN_URL=http://localhost:8080/order/status
```

> **Catatan Penting:** 
> Untuk testing Callback (Notifikasi Pembayaran) secara lokal, Duitku harus bisa mengakses server Anda. Anda perlu menggunakan layanan seperti **Ngrok**.
> Jika menggunakan Ngrok, ubah `DUITKU_CALLBACK_URL` menjadi URL Ngrok Anda, contoh: `https://abcd-123-45.ngrok-free.app/api/payment/callback`.

## 3. Alur Testing Pembayaran

### Langkah 1: Buat Order Baru
Lakukan request `POST /api/orders` seperti biasa. Sistem sekarang akan otomatis menghubungi Duitku.

**Contoh Response:**
```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "id": 1,
    "orderNumber": "OMB-LRAK...",
    "finalTotal": "15000.00",
    "status": "pending",
    "paymentUrl": "https://sandbox.duitku.com/webapi/...",  <-- Link Pembayaran
    "paymentReference": "DS12345...",
    "items": [...]
  }
}
```

### Langkah 2: Lakukan Pembayaran
1.  Copy `paymentUrl` dari response.
2.  Buka di browser.
3.  Anda akan diarahkan ke halaman pembayaran Duitku Sandbox.
4.  Pilih metode pembayaran (misal: Credit Card / Virtual Account).
5.  Selesaikan pembayaran (di Sandbox biasanya ada tombol simulasi sukses).

### Langkah 3: Verifikasi Callback (Update Status Otomatis)
Jika Anda menggunakan Ngrok atau server publik:
1.  Setelah pembayaran sukses di halaman Duitku, Duitku akan mengirim request POST ke `DUITKU_CALLBACK_URL`.
2.  Server akan memvalidasi signature dan mengupdate status order menjadi `processing` (Lunas).

**Cara Manual (Tanpa Ngrok) untuk Testing Callback:**
Anda bisa menggunakan Postman untuk menembak endpoint callback server Anda secara manual seolah-olah Anda adalah Duitku.

*   **URL:** `POST http://localhost:5000/api/payment/callback`
*   **Headers:** `Content-Type: application/x-www-form-urlencoded` atau `application/json`
*   **Body (JSON):**
    ```json
    {
      "merchantCode": "KODE_MERCHANT_ANDA",
      "amount": "15000.00",
      "merchantOrderId": "ORDER_NUMBER_SAMA_DENGAN_DATA_ORDER",
      "productDetail": "Order Description",
      "additionalParam": "",
      "paymentCode": "VC",
      "resultCode": "00",
      "merchantUserId": "user123",
      "reference": "REF123456",
      "signature": "MD5_HASH_VALID", 
      "publisherOrderId": "PUB123",
      "spUserHash": "hash"
    }
    ```
    *(Catatan: Testing manual agak sulit karena butuh MD5 Signature yang valid. Disarankan menggunakan Ngrok agar Duitku asli yang mengirim data).*

## 4. Struktur Kode

*   **`config/duitku.js`**: Menyimpan konfigurasi API.
*   **`services/paymentService.js`**: Logic utama untuk membuat Invoice (Request Transaction) dan Validasi Callback.
*   **`controllers/orderController.js`**: Memanggil service saat order dibuat.
*   **`controllers/paymentController.js`**: Menangani request callback dari Duitku.
*   **`routes/paymentRoutes.js`**: Routing untuk callback URL.

## Troubleshooting

*   **Error "Invalid Signature"**: Pastikan `DUITKU_MERCHANT_CODE` dan `DUITKU_API_KEY` di `.env` sama persis dengan di Dashboard Duitku.
*   **Gagal membuat Payment**: Cek log console server. Pastikan server bisa terhubung ke internet (outbound ke sandbox.duitku.com).
*   **Callback tidak masuk**: Pastikan URL Callback bisa diakses public (gunakan Ngrok).
