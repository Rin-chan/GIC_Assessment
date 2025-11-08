const express = require("express");
const path = require('path');
const app = express();
const multer = require('multer');
const upload = multer();

const mysql = require('mysql2');
const fs = require('fs');

var connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port: 3306,
    ssl: {
        ca: fs.readFileSync("./DigiCertGlobalRootG2.crt.pem"),
        rejectUnauthorized: true
    }
})

// Startup Database (and create tables)
connection.query(`CREATE TABLE IF NOT EXISTS Cafe (
    name varchar(100) PRIMARY KEY,
    description varchar(256) NOT NULL,
    logo longtext,
    location varchar(256) NOT NULL,
    id varchar(256) NOT NULL
    );`, (err, results, fields) => {
    if (err) throw err;
});

connection.query(`CREATE TABLE IF NOT EXISTS Employee (
    id varchar(9) PRIMARY KEY,
    name varchar(256) NOT NULL,
    email_address varchar(50) NOT NULL,
    phone_number int(8) NOT NULL,
    gender bool NOT NULL,
    start_date date NOT NULL,
    cafe_name varchar(100) NOT NULL,
    FOREIGN KEY (cafe_name) REFERENCES Cafe(name)
        ON UPDATE CASCADE ON DELETE CASCADE
    );`, (err, results, fields) => {
    if (err) throw err;
});

function makeid() {
    const length = 7;
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

app.use(express.static(path.join(__dirname, '/gic_assessment/build')));

// Create a GET endpoint /cafes?location=<location>
app.get('/cafes', (req, res) => {
    if (req.query.location == "" || req.query.location == undefined) {
        connection.query(`SELECT Cafe.name, Cafe.description, count(Employee.cafe_name) as Employee_Count, Cafe.logo, Cafe.location, Cafe.id FROM Cafe
            LEFT JOIN Employee ON Employee.cafe_name = Cafe.name
            GROUP BY Cafe.name
            ORDER BY count(Employee.cafe_name) DESC
            ;`, (err, results, fields) => {
            if (err) throw err;
            res.json(results);
        });
    } else {
        connection.query(`SELECT Cafe.name, Cafe.description, count(Employee.cafe_name) as Employee_Count, Cafe.logo, Cafe.location, Cafe.id FROM Cafe
            LEFT JOIN Employee ON Employee.cafe_name = Cafe.name
            WHERE Cafe.location = ?
            GROUP BY Cafe.name
            ORDER BY count(Employee.cafe_name) DESC
            ;`, [req.query.location], (err, results, fields) => {
            if (err) throw err;
            res.json(results);
        });
    }
});

// Create a GET endpoint /employees?cafe=<cafe>
app.get('/employees', (req, res) => {
    if (req.query.cafe == "" || req.query.cafe == undefined) {
        connection.query(`SELECT id, name, email_address, phone_number, DATEDIFF(CURDATE(), start_date) as days_worked, cafe_name, gender FROM Employee
            ORDER BY DATEDIFF(CURDATE(), start_date) DESC
            ;`, (err, results, fields) => {
            if (err) throw err;
            res.json(results);
        });
    } else {
        connection.query(`SELECT id, name, email_address, phone_number, DATEDIFF(CURDATE(), start_date) as days_worked, cafe_name, gender FROM Employee
            WHERE cafe_name = ?
            ORDER BY DATEDIFF(CURDATE(), start_date) DESC
            ;`, [req.query.cafe], (err, results, fields) => {
            if (err) throw err;
            res.json(results);
        });
    }
});

// Create a POST endpoint /cafes
app.post('/cafes', upload.none(), (req,res) => {
    connection.query(`INSERT INTO CAFE (name, description, logo, location, id) VALUES (?, ?, ? ,?, UUID());`
        , [req.body.name, req.body.description, req.body.logo, req.body.location]
        , (err, results, fields) => {
        if (err) throw err;
    });
    res.status(200).json({ message: 'Success' });
});

// Create a POST endpoint /employees
app.post('/employees', upload.none(), (req,res) => {
    console.log(req.body);
    connection.query(`INSERT INTO Employee (id, name, email_address, phone_number, gender, start_date, cafe_name) VALUES (?, ?, ?, ?, ?, ?, ?);`
    , [`UI${makeid()}`, req.body.name, req.body.email, req.body.phone, req.body.gender, req.body.start_date, req.body.cafe]
    , (err, results, fields) => {
        if (err) throw err;
    });
    res.status(200).json({ message: 'Success' });
});

// Create a PUT endpoint /cafes
app.put('/cafes/:id', upload.none(), (req, res) => {
    connection.query(`UPDATE Cafe
        SET name = ?, description = ?, logo = ?, location = ?
        WHERE id = ?
        ;`
        , [req.body.name, req.body.description, req.body.logo, req.body.location, req.params.id]
        , (err, results, fields) => {
        if (err) throw err;
    });
    res.status(200).json({ message: 'Success' });
});

// Create a PUT endpoint /employees
app.put('/employees/:id', upload.none(), (req, res) => {
    connection.query(`UPDATE Employee
        SET name = ?, email_address = ?, phone_number = ?, gender = ?, cafe_name = ?
        WHERE id = ?
        ;`
        , [req.body.name, req.body.email, req.body.phone, req.body.gender, req.body.cafe, req.params.id]
        , (err, results, fields) => {
        if (err) throw err;
    });
    res.status(200).json({ message: 'Success' });
});

// Create a DELETE endpoint /cafes
app.delete('/cafes/:name', (req, res) => {
    connection.query(`DELETE FROM Cafe
        WHERE name = ?
        ;`
        , [req.params.name]
        , (err, results, fields) => {
        if (err) throw err;
    });
    res.status(200).json({ message: 'Success' });
})

// Create a DELETE endpoint /employees
app.delete('/employees/:id', (req, res) => {
    connection.query(`DELETE FROM Employee
        WHERE id = ?
        ;`
        , [req.params.id]
        , (err, results, fields) => {
        if (err) throw err;
    });
    res.status(200).json({ message: 'Success' });
})

const PORT = process.env.PORT || 8080;

app.listen(PORT,
    console.log(`Server started on port ${PORT}`)
);