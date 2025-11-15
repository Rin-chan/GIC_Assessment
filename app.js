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

const nameError = "Length of name must be between 6 and 10 characters.";
const descriptionError = "Length of description must be less than 256 characters.";
const logoError = "Image should be less than 2mb.";
const emailError = "Input a valid email.";
const phoneError = "Input a valid phone number.";
const genderError = "Click the gender button again.";
const cafeError = "Select a cafe again.";

function nameCheck(name) {
    return (name.length < 6 || name.length > 10) ? false : true;
}

function descriptionCheck(description) {
    return (description.length > 256) ? false : true;
}

function logoCheck(logo) {
    const logoString = logo.substring(logo.indexOf(',') + 1);
    const mb = Math.ceil( ( ( (logoString.length * 6) / 8) / 1000) / 1000 );

    return (mb < 2) ? true : false;
}

function emailCheck(email) {
    const emailRegex = "^(?!.*\.{2})(?!\.)[a-z0-9_.'-]*[a-z0-9_'-]@(?!_)(?:[a-z0-9_'-]+\.)+[a-z0-9_'-]{2,}$";
    return (emailRegex.test(email)) ? true : false;
}

function phoneCheck(phone) {
    const phoneRegex = "^[8-9]{1}[0-9]{7}$";
    return (phoneRegex.test(email)) ? true : false;
}

function genderCheck(gender) {
    return (gender == "Female" || gender == "Male") ? true : false;
}

function cafeCheck(cafe) {
    let cafeList = [];
    connection.query("SELECT DISTINCT Cafe.name FROM Cafe;", (err, results, fields) => {
        if (err) return res.status(400).json(`An error has occured: ${err}`);
        cafeList = results;
    });

    return (cafeList.indexOf(cafe) == -1) ? false : true;
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
            if (err) return res.status(400).json({ message: `An error has occured: ${err}`});
            res.json(results);
        });
    } else {
        connection.query(`SELECT Cafe.name, Cafe.description, count(Employee.cafe_name) as Employee_Count, Cafe.logo, Cafe.location, Cafe.id FROM Cafe
            LEFT JOIN Employee ON Employee.cafe_name = Cafe.name
            WHERE Cafe.location = ?
            GROUP BY Cafe.name
            ORDER BY count(Employee.cafe_name) DESC
            ;`, [req.query.location], (err, results, fields) => {
            if (err) return res.status(400).json({ message: `An error has occured: ${err}`});
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
            if (err) return res.status(400).json({ message: `An error has occured: ${err}`});
            res.json(results);
        });
    } else {
        connection.query(`SELECT id, name, email_address, phone_number, DATEDIFF(CURDATE(), start_date) as days_worked, cafe_name, gender FROM Employee
            WHERE cafe_name = ?
            ORDER BY DATEDIFF(CURDATE(), start_date) DESC
            ;`, [req.query.cafe], (err, results, fields) => {
            if (err) return res.status(400).json({ message: `An error has occured: ${err}`});
            res.json(results);
        });
    }
});

// Create a POST endpoint /cafes
app.post('/cafes', upload.none(), (req,res) => {
    if (!nameCheck(req.body.name)) return res.status(400).json(nameError);

    if (!descriptionCheck(req.body.description)) return res.status(400).json(descriptionError);

    if (!logoCheck(req.body.logo)) return res.status(400).json(logoError);

    connection.query(`INSERT INTO CAFE (name, description, logo, location, id) VALUES (?, ?, ? ,?, UUID());`
        , [req.body.name, req.body.description, req.body.logo, req.body.location]
        , (err, results, fields) => {
        if (err) return res.status(400).json({ message: `An error has occured: ${err}`});
    });
    res.status(200).json({ message: 'Success' });
});

// Create a POST endpoint /employees
app.post('/employees', upload.none(), (req,res) => {
    if (!nameCheck(req.body.name)) return res.status(400).json(nameError);

    if (!emailCheck(req.body.email)) return res.status(400).json(emailError);

    if (!phoneCheck(req.body.phone)) return res.status(400).json(phoneError);

    if (!genderCheck(req.body.gender)) return res.status(400).json(genderError);

    if (!cafeCheck(req.body.cafe)) return res.status(400).json(cafeError);
    
    connection.query(`INSERT INTO Employee (id, name, email_address, phone_number, gender, start_date, cafe_name) VALUES (?, ?, ?, ?, ?, ?, ?);`
    , [`UI${makeid()}`, req.body.name, req.body.email, req.body.phone, req.body.gender, req.body.start_date, req.body.cafe]
    , (err, results, fields) => {
        if (err) return res.status(400).json({ message: `An error has occured: ${err}`});
    });
    res.status(200).json({ message: 'Success' });
});

// Create a PUT endpoint /cafes
app.put('/cafes/:id', upload.none(), (req, res) => {
    if (!nameCheck(req.body.name)) return res.status(400).json(nameError);

    if (!descriptionCheck(req.body.description)) return res.status(400).json(descriptionError);

    if (!logoCheck(req.body.logo)) return res.status(400).json(logoError);

    connection.query(`UPDATE Cafe
        SET name = ?, description = ?, logo = ?, location = ?
        WHERE id = ?;`
        , [req.body.name, req.body.description, req.body.logo, req.body.location, req.params.id]
        , (err, results, fields) => {
        if (err) return res.status(400).json({ message: `An error has occured: ${err}`});
    });
    res.status(200).json({ message: 'Success' });
});

// Create a PUT endpoint /employees
app.put('/employees/:id', upload.none(), (req, res) => {
    if (!nameCheck(req.body.name)) return res.status(400).json(nameError);

    if (!emailCheck(req.body.email)) return res.status(400).json(emailError);

    if (!phoneCheck(req.body.phone)) return res.status(400).json(phoneError);

    if (!genderCheck(req.body.gender)) return res.status(400).json(genderError);

    if (!cafeCheck(req.body.cafe)) return res.status(400).json(cafeError);

    connection.query(`UPDATE Employee
        SET name = ?, email_address = ?, phone_number = ?, gender = ?, cafe_name = ?
        WHERE id = ?;`
        , [req.body.name, req.body.email, req.body.phone, req.body.gender, req.body.cafe, req.params.id]
        , (err, results, fields) => {
        if (err) return res.status(400).json({ message: `An error has occured: ${err}`});
    });
    res.status(200).json({ message: 'Success' });
});

// Create a DELETE endpoint /cafes
app.delete('/cafes/:name', (req, res) => {
    connection.query(`DELETE FROM Cafe
        WHERE name = ?;`
        , [req.params.name]
        , (err, results, fields) => {
        if (err) return res.status(400).json({ message: `An error has occured: ${err}`});
    });
    res.status(200).json({ message: 'Success' });
})

// Create a DELETE endpoint /employees
app.delete('/employees/:id', (req, res) => {
    connection.query(`DELETE FROM Employee
        WHERE id = ?;`
        , [req.params.id]
        , (err, results, fields) => {
        if (err) return res.status(400).json({ message: `An error has occured: ${err}`});
    });
    res.status(200).json({ message: 'Success' });
})

const PORT = process.env.PORT || 8080;

app.listen(PORT,
    console.log(`Server started on port ${PORT}`)
);