const express = require("express");
const app = express();

const secrets = require('./secrets.json');
const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: "localhost",
    user: secrets.username,
    password: secrets.password,
    database: "GIC_Assessment"
})

// Startup Database (and create tables)
connection.query(`CREATE TABLE IF NOT EXISTS Cafe (
    name varchar(100) PRIMARY KEY,
    description varchar(256) NOT NULL,
    logo varchar(256),
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
    );`, (err, results, fields) => {
    if (err) throw err;
});

app.get('/',(req,res)=>{
    res.send(`<h1>Hello World</h1>`)
})

// Create a GET endpoint /cafes?location=<location>
app.get('/cafes', (req, res) => {
    if (req.query.location == "") {
        connection.query(`SELECT Cafe.name, Cafe.description, count(Employee.cafe_name) as Employee_Count, Cafe.logo, Cafe.location, Cafe.id FROM Cafe
            JOIN Employee ON Employee.cafe_name = Cafe.name
            GROUP BY Cafe.name
            ORDER BY count(Employee.cafe_name) DESC
            ;`, (err, results, fields) => {
            if (err) throw err;
            res.json(results);
        });
    } else {
        connection.query(`SELECT Cafe.name, Cafe.description, count(Employee.cafe_name) as Employee_Count, Cafe.logo, Cafe.location, Cafe.id FROM Cafe
            JOIN Employee ON Employee.cafe_name = Cafe.name
            WHERE Cafe.location = ${req.query.location}
            GROUP BY Cafe.name
            ORDER BY count(Employee.cafe_name) DESC
            ;`, (err, results, fields) => {
            if (err) throw err;
            res.json(results);
        });
    }
});

// Create a GET endpoint /employees?cafe=<cafe>
app.get('/employees', (req, res) => {
    if (req.query.cafe == "") {
        connection.query(`SELECT id, name, email_address, phone_number, DATEDIFF(CURDATE(), start_date) as days_worked, cafe_name FROM Employee
            ORDER BY DATEDIFF(CURDATE(), start_date) DESC
            ;`, (err, results, fields) => {
            if (err) throw err;
            res.json(results);
        });
    } else {
        connection.query(`SELECT id, name, email_address, phone_number, DATEDIFF(CURDATE(), start_date) as days_worked, cafe_name FROM Employee
            WHERE cafe_name = ${req.query.cafe}
            ORDER BY DATEDIFF(CURDATE(), start_date) DESC
            ;`, (err, results, fields) => {
            if (err) throw err;
            res.json(results);
        });
    }
});

const PORT = process.env.PORT || 8080;

app.listen(PORT,
    console.log(`Server started on port ${PORT}`)
);