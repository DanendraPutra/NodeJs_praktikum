import express from 'express'; //framework express untuk membuat server
import mysql from 'mysql2'; //mysql2 untuk menghubungkan ke database mysql
import swaggerUi from 'swagger-ui-express'; //swagger-ui-express untuk dokumentasi API
import fs from 'fs'; //modul fs untuk membaca file
import YAML from 'yaml'; //modul yaml untuk memparsing file yaml

//membaca dan memparsing file openapi.yml untuk dokumentasi swagger
const swaggerDocument = YAML.parse(fs.readFileSync('./openapi.yml', 'utf8'));

//konfigurasi koneksi ke database mysql
const db = mysql.createConnection({ 
    host: "localhost", 
    user: "root", 
    database: "openapi", 
    password: "lianamanis25oktober"});

//menghubungkan ke database
db.connect(err => {
    if (err) {
        console.error('Gagal terhubung ke database:', err.message);
        process.exit(1); //keluar dari proses jika gagal koneksi
    } else {
        console.log('Berhasil terhubung ke database');
    }
})

const app = express(); //inisialisasi aplikasi express

//Middleware untuk parsing JSON dari request body
app.use(express.json());

//middleware untuk mengaktifkan dokumentasi API dengan swagger
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

//Endpoint untuk mendapatkan semua pengguna
app.get('/users', (req, res, next) => {
    db.query('SELECT * FROM user', (err, results) => {
        if (err) return res.status(500).json({message: 'Server Gagal' }); //handle error server      
        res.json(results); //mengembalikan data semua pengguna dalan format JSON
    });
});

//Endpoint untuk mendapatkan semua pengguna berdasarkan id
app.get('/users/:id', (req, res, next) => {
    const usersId = req.params.id;
    db.query('SELECT *FROM user WHERE id = ?', [usersId], (err, results) => {
        if (err) return res.status(500).json({ message: 'Server Gagal' }); //handle error server
        if (results.length === 0) return res.status(404).json({ message: 'Pengguna tidak ditemukan'}); //jika tidak ditemukan
        res.json(results[0]); //mengembalikan data pengguna yang ditemukan
    });
});

//Endpoint untuk menambahkan pengguna baru
app.post('/users', (req, res, next) => {
    const { name, email, age } = req.body;
    db.query(' INSERT INTO user (name, email, age, createdAt, updatedAt) VALUES (?, ?, ?, NOW(), NOW())',
        [name, email, age], (err, results) => {
        if (err) return res.status(500).json({ message: 'Server Gagal' }); //handle error server
        res.status(201).json({ id: results.insertId, name, email, age }); //mengembalikan data pengguna baru
    });
});

//Endpoint untuk memperbarui data pengguna berdasarkan id
app.put('/users/:id', (req, res, next) => {
    const userId = req.params.id;
    const { name, email, age } = req.body;
    db.query('UPDATE user SET name = ?, email = ?, age = ?, updatedAt = NOW() WHERE id = ? ',
        [name, email, age, userId], (err, results) => {
        if (err) return res.status(500).json({ message: 'Server Gagal' }); //handle error server
        if (results.affectedRows === 0) return res.status(404).json({ message: 'Pengguna tidak ditemukan' }); //jika tidak ditemukan
        res.json({ id: userId, name, email, age }); //mengembalikan data pengguna yang diperbarui
    });
});

//Endpoint untuk menghapus pengguna berdasarkan id
app.delete('/users/:id', (req, res, next) => {
    const userId = req.params.id;
    db.query('DELETE FROM user WHERE id = ?', [userId], (err, results) => {
        if (err) return res.status(500).json({ message: 'Server Gagal' }); //handle error server
        if (results.affectedRows === 0) return res.status(404).json({  message: 'Pengguna tidak ditemukan' }); //jika tidak ditemukan
        res.json({ message: 'Pengguna berhasil dihapus' }); //mengembalikan pesan berhasil
    });
});

//menjalankan server di port 3000
app.listen(3000, () => console.log('Server berjalan di http://localhost:3000'));