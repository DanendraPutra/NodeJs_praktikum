import express from 'express';
import mysql from 'mysql2';
import swaggerUi from 'swagger-ui-express';
import fs from 'fs';
import YAML from 'yaml';

const swaggerDocument = YAML.parse(fs.readFileSync('./openapi.yml', 'utf8'));

const db = mysql.createConnection({ 
    host: "localhost", 
    user: "root", 
    database: "openapi", 
    password: "lianamanis25oktober"});

db.connect(err => {
    if (err) {
        console.error('Gagal terhubung ke database:', err.message);
        process.exit(1);
    } else {
        console.log('Berhasil terhubung ke database');
    }
})

const app = express();

//Middleware untuk parsing JSON
app.use(express.json());

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

//Endpoint untuk mendapatkan semua pengguna
app.get('/users', (req, res, next) => {
    db.query('SELECT * FROM user', (err, results) => {
        if (err) return res.status(500).json({message: 'Server Gagal' });        
        res.json(results);
    });
});

//Endpoint untuk mendapatkan semua pengguna berdasarkan id
app.get('/users/:id', (req, res, next) => {
    const usersId = req.params.id;
    db.query('SELECT *FROM user WHERE id = ?', [usersId], (err, results) => {
        if (err) return res.status(500).json({ message: 'Server Gagal' });
        if (results.length === 0) return res.status(404).json({ message: 'Pengguna tidak ditemukan'});
        res.json(results[0]);
    });
});

//Endpoint untuk menambahkan pengguna baru
app.post('/users', (req, res, next) => {
    const { name, email, age } = req.body;
    db.query(' INSERT INTO user (name, email, age, createdAt, updatedAt) VALUES (?, ?, ?, NOW(), NOW())',
        [name, email, age], (err, results) => {
        if (err) return res.status(500).json({ message: 'Server Gagal' });
        res.status(201).json({ id: results.insertId, name, email, age });
    });
});

//Endpoint untuk memperbarui data pengguna berdasarkan id
app.put('/users/:id', (req, res, next) => {
    const userId = req.params.id;
    const { name, email, age } = req.body;
    db.query('UPDATE user SET name = ?, email = ?, age = ?, updatedAt = NOW() WHERE id = ? ',
        [name, email, age, userId], (err, results) => {
        if (err) return res.status(500).json({ message: 'Server Gagal' });
        if (results.affectedRows === 0) return res.status(404).json({ message: 'Pengguna tidak ditemukan' });
        res.json({ id: userId, name, email, age });
    });
});

//Endpoint untuk menghapus pengguna berdasarkan id
app.delete('/users/:id', (req, res, next) => {
    const userId = req.params.id;
    db.query('DELETE FROM user WHERE id = ?', [userId], (err, results) => {
        if (err) return res.status(500).json({ message: 'Server Gagal' });
        if (results.affectedRows === 0) return res.status(404).json({  message: 'Pengguna tidak ditemukan' });
        res.json({ message: 'Pengguna berhasil dihapus' });
    });
});

app.listen(3000, () => console.log('Server berjalan di http://localhost:3000'));