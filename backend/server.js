const bcrypt = require('bcrypt');
const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const jwt = require('jsonwebtoken');

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

app.post("/register", async (req, res) => {
    const { email, password } = req.body;
    try {
        const sql = 'SELECT * FROM users WHERE email = ?';
        db.query(sql, [email], async (error, results) => {
            if (error) {
                console.log(error);
            }

            if (results.length > 0) {
                res.status(409).json({ message: 'Email already exists' });
            } else {
                const hashedPassword = await bcrypt.hash(password, 10);

                const insertNewUser = 'INSERT INTO users (email, password) VALUES (?, ?)';
                db.query(insertNewUser, [email, hashedPassword], (error, results) => {
                    if (error) {
                        throw error;
                    } else {
                        res.status(201).json({ message: 'User registered successfully' });
                    }
                });
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Internal Server error' });
    }
});

app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        const getUserQuery = 'SELECT * FROM users WHERE email = ?';
        db.query(getUserQuery, [email], async (error, results) => {
            if (error) {
                throw error;
            }

            if (results.length === 0) {
                res.status(401).json({ message: 'Invalid email' });
            } else {
                // Compare hashed password
                const user = results[0];
                const passwordMatch = await bcrypt.compare(password, user.password);

                if (!passwordMatch) {
                    res.status(401).json({ message: 'Invalid username or password' });
                } else {
                    // Create JWT token
                    const token = jwt.sign({ id: user.id, username: user.username }, 'your_secret_key', { expiresIn: '1h' });
                    res.status(200).json({ token });
                }
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Internal Server error' });
    }
});

// GET all students
app.get("/", verifyToken, (req, res) => {
    jwt.verify(req.token, 'your_secret_key', (err, authData) => {
        if (err)
            res.sendStatus(403);
        else {
            const sql = "SELECT * FROM student";
            db.query(sql, (err, data) => {
                if (err) {
                    console.error('Error executing query:', err);
                    return res.status(500).json({ error: 'Database error' });
                }
                return res.json(data);
            });
        }
    });
});

// POST create a student
app.post("/create", verifyToken, (req, res) => {
    jwt.verify(req.token, "your_secret_key", (err, authData) => {
        if (err)
            res.sendStatus(403);
        else {
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
        }
    });
});

// PUT update a student
app.put("/update/:id", verifyToken, (req, res) => {
    jwt.verify(req.token, "your_secret_key", (err, authData) => {
        if (err)
            res.sendStatus(403);
        else {
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
        }
    });
});

// DELETE a student
app.delete("/delete/:id", verifyToken, (req, res) => {
    jwt.verify(req.token, 'your_secret_key', (err, authData) => {
        if (err)
            res.sendStatus(403);
        else {
            const id = req.params.id;
            const sql = "DELETE FROM student WHERE ID = ?";
            db.query(sql, [id], (err, data) => {
                if (err) {
                    console.error('Error executing query:', err);
                    return res.status(500).json({ error: 'Database error' });
                }
                return res.json({ message: 'Student deleted successfully' });
            });
        }
    });
});

app.listen(3001, () => {
    console.log("Server is running on port 3001");
});

function verifyToken(req, res, next) {
    const bearerHeader = req.headers['authorization'];

    if (typeof bearerHeader !== 'undefined') {
        const bearerToken = bearerHeader.split(' ')[1];
        req.token = bearerToken;
        next();
    } else {
        res.sendStatus(403);
    }
}
