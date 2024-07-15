
const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");

const app = express();

app.use(express.json());
app.use(cors());

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root", // Replace with your MySQL password
    database: "crud",
});

// Connect to MySQL
db.connect(err => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
    } else {
        console.log('Connected to MySQL database');
    }
});

// GET all students
app.get("/", (req, res) => {
    const sql = "SELECT * FROM student";
    db.query(sql, (err, data) => {
        if (err) {
            console.error('Error executing query:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        return res.json(data);
    });
});

// POST create a student
app.post("/create", (req, res) => {
    const sql = "INSERT INTO student (Firstname, Lastname, Email) VALUES (?, ?, ?)";
    const values = [
        req.body.firstname,
        req.body.lastname,
        req.body.email,
    ];
    db.query(sql, values, (err, data) => {
        if (err) {
            console.error('Error executing query:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        return res.json({ message: 'Student created successfully' });
    });
});

// PUT update a student
app.put("/update/:id", (req, res) => {
    const id = req.params.id;
    const firstname = req.body.firstname;
    const lastname = req.body.lastname;
    const email = req.body.email;

    // Construct the SQL query based on provided fields
    let sql = "UPDATE student SET";
    const values = [];
    const placeholders = [];

    if (firstname) {
        placeholders.push(" Firstname = ?");
        values.push(firstname);
    }
    if (lastname) {
        placeholders.push(" Lastname = ?");
        values.push(lastname);
    }
    if (email) {
        placeholders.push(" Email = ?");
        values.push(email);
    }

    // Add ID condition to the query
    sql += placeholders.join(",") + " WHERE ID = ?";
    values.push(id);

    db.query(sql, values, (err, data) => {
        if (err) {
            console.error('Error executing query:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        return res.json({ message: 'Student updated successfully' });
    });
});

// DELETE a student
app.delete("/delete/:id", (req, res) => {
    const id = req.params.id;
    const sql = "DELETE FROM student WHERE ID = ?";
    db.query(sql, [id], (err, data) => {
        if (err) {
            console.error('Error executing query:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        return res.json({ message: 'Student deleted successfully' });
    });
});

app.listen(3001, () => {
    console.log("Server is running on port 3001");
});
