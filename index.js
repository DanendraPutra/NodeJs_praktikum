import express from 'express';
import mysql from 'mysql2';
import swaggerUi from 'swagger-ui-express';
import fs from 'fs';
import YAML from 'yaml';

const swaggerDocument = YAML.parse(fs.readFileSync('./openapi/spec.yml', 'utf8'));

const db = mysql.createConnection({ host: "localhost", user: "root", database: "openapi", password: "lianamanis25oktober"});
const app = express();

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get('/user', (req, res) => {
    db.query('SELECT * FROM user', (err, results) => {
        if (err) {
            res.status(500),send('Internal Server Error');
            return;
        }

        res.json(results);
    });
});

server.listen(3000, () => console.log('Server berjalan di http://localhost: 3000'));