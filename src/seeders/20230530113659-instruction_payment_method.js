'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('InstructionPaymentMethods', [
      {
        instruction_payment_method_id: 1,
        payment_method_id: 1,
        type_payment_method: "ATM BCA",
        instruction_payment_method_description: `1. Masukkan PIN anda.|2. Pilih menu **Penarikan Tunai** atau **Transaksi Lainnya**.|3. Pilih **Transfer**.|4. Pilih **Ke Rek BCA Virtual Account**.|5. Masukkan <code> dan klik **Benar**.|6. Cek detail transaksi dan pilih **Ya**.|7. Transaksi berhasil.`,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        instruction_payment_method_id: 2,
        payment_method_id: 1,
        type_payment_method: "BCA Mobile",
        instruction_payment_method_description: `1. Buka BCA mobile, pilih menu **m-Transfer**|2. Pilih menu **BCA Virtual Account**|3. Masukkan <code> dan klik **Send**|4. Cek nominal yang muncul|5. Masukkan PIN m-BCA|6. Transaksi berhasil.`,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        instruction_payment_method_id: 3,
        payment_method_id: 2,
        type_payment_method: "ATM BRI",
        instruction_payment_method_description: `1. Masukkan PIN kartu ATM.|2. Pilih menu **Transaksi Lain**.|3. Klik **Pembayaran**.|4. Klik **menu Lainnya**.|5. Klik menu **BRIVA**.|6. Masukkan <code>.|7. Konfirmasi pembayaran.|8. Transaksi berhasil.`,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        instruction_payment_method_id: 4,
        payment_method_id: 2,
        type_payment_method: "BRI Mobile",
        instruction_payment_method_description: `1. Buka aplikasi BRI Mobile di HP.|2. Silakan login dengan memasukkan username dan password.|3. Masuk ke menu **Pembayaran**.|4. Lanjutkan dengan mengklik menu **Brivia**.|5. Masukkan nomor rekening dengan <code>.|6. Nominal tagihan virtual account.|7. Klik **lanjut**|8. Konfirmasi data.|9. Masukkan PIN mobile banking.|10. Klik **Kirim** untuk melakukan transfer.|11. Transaksi berhasil.`,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        instruction_payment_method_id: 5,
        payment_method_id: 2,
        type_payment_method: "Internet Banking",
        instruction_payment_method_description: `1. Kunjungi website resmi bri di https://ib.bri.co.id/ib-bri/.|2. Login akun Internet Banking.|3. Pilih menu **Pembayaran**.|4. Klik **BRIVA**.|5. Masukkan kode unik berupa <code>.|6. Masukkan jumlah nominal berupa **total Harga**.|7. Klik **Kirim**.|8. Masukkan Password dan mToken.|9. Transaksi berhasil.`,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        instruction_payment_method_id: 6,
        payment_method_id: 3,
        type_payment_method: "ATM Mandiri",
        instruction_payment_method_description: `1. Masukkan PIN anda.|2. Pilih **Bayar/Beli**.|3. Cari pilihan **MULTI PAYMENT**.|4. Masukkan Kode Perusahaan <biller_code>.|5. Masukkan <code>.|6. Masukkan Jumlah Pembayaran sesuai dengan **total harga** kemudian tekan **Benar**.|7. Pilih Tagihan Anda jika sudah sesuai tekan **YA**.|8. Konfirmasikan tagihan anda apakah sudah sesuai lalu tekan **YA**.|9. Transaksi berhasil`,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        instruction_payment_method_id: 7,
        payment_method_id: 3,
        type_payment_method: "Livin Mandiri",
        instruction_payment_method_description: `1. Untuk melakukan pembayaran, pilih menu **Pembayaran**.|2. Setelah itu, tekan opsi **Pembayaran Baru** > **Multi Payment** > **Penyedia Jasa** atau **Service Provider**.|3. Pilih kode perusahaan <biller_code> yang menjadi tujuan pembayaran.|4. Masukkan <code> dan tekan tombol **Tambah Sebagai Nomor Baru**.|5. Tuliskan nominal pembayaran berupa **total harga**.|6. Tekan tombol **Konfirmasi** > **Lanjut**.|7. Cek kembali pembayaran, dan tekan tombol **Konfirmasi**.|8. Masukkan PIN dan pilih **OK**.|9. Transaksi berhasil`,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        instruction_payment_method_id: 8,
        payment_method_id: 4,
        type_payment_method: "ATM BNI",
        instruction_payment_method_description: `1. Masukkan PIN ATM Anda.|2. Pilih **Menu Lainnya**.|3. Pilih **Transfer**.|4. Pilih Jenis rekening yang akan Anda gunakan.|5. Pilih **Virtual Account Billing**.|6. Masukkan nomor <code>.|7. Tagihan yang harus dibayarkan akan muncul pada layar konfirmasi.|8. Konfirmasi, apabila telah sesuai, lanjutkan transaksi.|9. Transaksi berhasil`,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        instruction_payment_method_id: 9,
        payment_method_id: 4,
        type_payment_method: "BNI Mobile Banking",
        instruction_payment_method_description: `1. Masukkan user ID dan password.|2. Pilih menu **Transfer**.|3. Pilih menu **Virtual Account Billing** kemudian pilih rekening debet.|4. Masukkan <code> pada menu **input baru**.|5. Tagihan yang harus dibayarkan akan muncul pada layar konfirmasi|6. Konfirmasi transaksi dan masukkan Password Transaksi.|7. Transaksi berhasil.`,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        instruction_payment_method_id: 10,
        payment_method_id: 5,
        type_payment_method: "Alfamart",
        instruction_payment_method_description: `1. Berikan <code> ke kasir.|2. Bayar sesuai nominal **total harga**.|3. Transaksi berhasil.`,
        createdAt: new Date(),
        updatedAt: new Date()
      },
    ]);
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('InstructionPaymentMethods', null, {});
  }
};
