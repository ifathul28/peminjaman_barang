const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'peminjaman_db'
});

db.connect(err => {
    if (err) console.log(err);
    else console.log("Database terhubung");
});


// =======================
// BARANG
// =======================

// ambil barang
app.get('/barang', (req, res) => {
    db.query("SELECT * FROM barang", (err, result) => {
        if (err) return res.send(err);
        res.json(result);
    });
});

// tambah barang
app.post('/tambah', (req, res) => {
    const { nama, stok, kondisi } = req.body;

    db.query(
        "INSERT INTO barang (nama_barang, stok, kondisi) VALUES (?, ?, ?)",
        [nama, stok, kondisi],
        (err) => {
            if (err) return res.send("Gagal");
            res.send("Berhasil");
        }
    );
});


// =======================
// PINJAM
// =======================

app.post('/pinjam', (req, res) => {
    const { nama, barang, jumlah, tgl_pinjam } = req.body;

    db.query(
        "SELECT stok FROM barang WHERE nama_barang=?",
        [barang],
        (err, result) => {

            if (result.length === 0) return res.send("Barang tidak ada");

            if (result[0].stok < jumlah) {
                return res.send("Stok tidak cukup");
            }

            // kurangi stok
            db.query(
                "UPDATE barang SET stok = stok - ? WHERE nama_barang=?",
                [jumlah, barang]
            );

            // simpan peminjaman
            db.query(
                "INSERT INTO peminjaman (nama_peminjam, nama_barang, jumlah, tanggal_pinjam, status) VALUES (?, ?, ?, ?, ?)",
                [nama, barang, jumlah, tgl_pinjam, "dipinjam"]
            );

            res.send("Berhasil pinjam");
        }
    );
});


// =======================
// LIHAT PEMINJAMAN
// =======================

app.get('/peminjaman', (req, res) => {
    db.query("SELECT * FROM peminjaman", (err, result) => {
        if (err) return res.send(err);
        res.json(result);
    });
});


// =======================
// KEMBALIKAN
// =======================

app.put('/kembalikan/:id', (req, res) => {
    const id = req.params.id;
    const { tgl_kembali } = req.body;

    db.query(
        "SELECT nama_barang, jumlah, status FROM peminjaman WHERE id=?",
        [id],
        (err, result) => {

            let data = result[0];

            if (data.status === "dikembalikan") {
                return res.send("Sudah dikembalikan");
            }

            // tambah stok
            db.query(
                "UPDATE barang SET stok = stok + ? WHERE nama_barang=?",
                [data.jumlah, data.nama_barang]
            );

            // update status
            db.query(
                "UPDATE peminjaman SET status='dikembalikan', tanggal_kembali=? WHERE id=?",
                [tgl_kembali, id]
            );

            res.send("Berhasil dikembalikan");
        }
    );
});


// =======================
// JALANKAN SERVER
// =======================

app.listen(3000, () => {
    console.log("Server jalan di http://localhost:3000");
});