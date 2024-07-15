const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const bcrypt = require("bcryptjs"); // For hashing passwords

const app = express();

app.use(express.json());
app.use(cors());

// MySQL database connection
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

// Middleware for authentication
const authenticateUser = (req, res, next) => {
    const { email, password } = req.headers; // Assuming email and password are sent in headers

    if (!email || !password) {
        return res.status(401).json({ error: 'Authentication failed: Missing credentials' });
    }

    const sql = "SELECT * FROM users WHERE email = ?";
    db.query(sql, [email], (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        if (results.length === 0) {
            return res.status(401).json({ error: 'Authentication failed: User not found' });
        }

        const user = results[0];

        bcrypt.compare(password, user.password, (bcryptErr, bcryptResult) => {
            if (bcryptErr || !bcryptResult) {
                return res.status(401).json({ error: 'Authentication failed: Invalid credentials' });
            }

            // Attach user information to the request object for later use if needed
            req.user = {
                id: user.id,
                email: user.email,
            };

            next(); // Proceed to the next middleware or route handler
        });
    });
};

// Example endpoint requiring authentication
app.get("/students", authenticateUser, (req, res) => {
    const sql = "SELECT * FROM student";
    db.query(sql, (err, data) => {
        if (err) {
            console.error('Error executing query:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        return res.json(data);
    });
});

// Example endpoint for creating a student (requires authentication)
app.post("/students/create", authenticateUser, (req, res) => {
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

// Example endpoint for deleting a student (requires authentication)
app.delete("/students/delete/:id", authenticateUser, (req, res) => {
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
