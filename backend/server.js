const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const app = express();
// koneksi databae
app.use(cors());
app.use(express.json())

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'peminjaman_db'
});

db.connect((err) => {
    if (err) {
        console.log(err);
} else{
    console.log("Database terhubung")
}
});
//ambildata
app.get('/barang', (req, res) => {
    db.query("SELECT * FROM barang", (err, result) => {
        if (err) {
            console.log(err);
            res.send("Error ambil data");
        } else {
            res.json(result);
        }
    });
});
//tambah data
app.post('/tambah', (req, res) => {
    const { nama, stok, kondisi } = req.body;

    db.query(
        "INSERT INTO barang (nama_barang, stok, kondisi) VALUES (?, ?, ?)",
        [nama, stok, kondisi],
        (err) => {
            if (err) {
                console.log(err);
                res.send("Gagal tambah data");
            } else {
                res.json("Berhasil");
            }
        }
    );
});
//hapus
app.delete('/hapus/:id', (req, res) => {
    const id = req.params.id;

    db.query("DELETE FROM barang WHERE id=?", [id], (err) => {
        if (err) {
            console.log(err);
            res.send("Gagal hapus");
        } else {
            res.json("Dihapus");
        }
    });
});
//edit
app.put('/edit/:id', (req, res) => {
    const id = req.params.id;
    const { nama, stok, kondisi } = req.body;

    db.query(
        "UPDATE barang SET nama_barang=?, stok=?, kondisi=? WHERE id=?",
        [nama, stok, kondisi, id],
        (err) => {
            if (err) {
                console.log(err);
                res.send("Gagal update");
            } else {
                res.json("Diupdate");
            }
        }
    );
});
//jalankan server
app.listen(3000, () => {
    console.log("server di jalankan di http://localhost:3000");
});