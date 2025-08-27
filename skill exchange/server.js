const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');

const app = express();
const PORT = 5500;

// MySQL Pool Setup
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'Praveen@2038',
    database: 'Skillexchange',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});
const promisePool = pool.promise();

// Middleware
app.use(bodyParser.json());
app.use(cors({
    origin: 'http://localhost:5500', // Frontend URL
    credentials: true
}));
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        secure: false, // Set to true in production (with HTTPS)
        maxAge: 24 * 60 * 60 * 1000
    }
}));
app.use(express.static(path.join(__dirname))); // Serve static files

// -------------------------
// User & Skill Functions
// -------------------------

// Function to register a new user
async function registerUser(username, password, email, phone, streetAddress, city, state, postalCode) {
    const hashedPassword = await bcrypt.hash(password, 10);
    try {
        const [result] = await promisePool.query(
            `INSERT INTO Users (username, password, email, phone_number, street_address, city, state, postal_code)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [username, hashedPassword, email, phone, streetAddress, city, state, postalCode]
        );
        return { success: true, message: 'Registration successful', userId: result.insertId };
    } catch (error) {
        console.error('Error during registration:', error);
        return { success: false, message: error.message };
    }
}

// Function to authenticate a user
async function authenticateUser(username, password) {
    try {
        const [rows] = await promisePool.query(
            `SELECT * FROM Users WHERE username = ?`,
            [username]
        );
        if (rows.length > 0) {
            const user = rows[0];
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (isPasswordValid) {
                return { success: true, user };
            } else {
                return { success: false, message: 'Invalid username or password' };
            }
        } else {
            return { success: false, message: 'Invalid username or password' };
        }
    } catch (error) {
        console.error('Error during authentication:', error);
        return { success: false, message: error.message };
    }
}

// Function to add skills for a user
async function addUserSkills(userId, skills) {
    const query = `INSERT INTO Skills (user_id, skill_name, proficiency_level, years_of_experience) VALUES ?`;
    const values = skills.map(skill => [
        userId,
        skill.name,
        skill.proficiencyLevel,
        skill.yearsOfExperience
    ]);
    try {
        const [result] = await promisePool.query(query, [values]);
        return { success: true, message: 'Skills added successfully', result };
    } catch (error) {
        console.error('Error adding skills:', error);
        return { success: false, message: error.message };
    }
}

// Function to get all skills for a user
async function getUserSkills(userId) {
    try {
        const [rows] = await promisePool.query(`SELECT * FROM Skills WHERE user_id = ?`, [userId]);
        return rows;
    } catch (error) {
        console.error('Error fetching skills:', error);
        return { success: false, message: error.message };
    }
}

// Function to delete a specific skill for a user
async function deleteUserSkill(userId, skillId) {
    try {
        const [result] = await promisePool.query(
            `DELETE FROM Skills WHERE user_id = ? AND skill_id = ?`,
            [userId, skillId]
        );
        if (result.affectedRows > 0) {
            return { success: true, message: 'Skill deleted successfully' };
        } else {
            return { success: false, message: 'Skill not found or already deleted' };
        }
    } catch (error) {
        console.error('Error deleting skill:', error);
        return { success: false, message: 'Error deleting skill' };
    }
}

// -------------------------
// Order Functions & Routes
// -------------------------

// Function to insert a new order and fetch all orders for the user
async function insertOrderAndFetchAll(userId, title, description, category, price, location) {
    const status = 'Pending'; // Default status for new orders
    const publishedAt = new Date();
    try {
        const [insertResult] = await promisePool.query(
            `INSERT INTO works (user_id, title, description, category, published_at, status, price, location)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [userId, title, description, category, publishedAt, status, price, location]
        );
        // Retrieve the newly inserted order
        const [newOrderRows] = await promisePool.query(
            `SELECT * FROM works WHERE work_id = ? AND user_id = ?`,
            [insertResult.insertId, userId]
        );
        const newOrder = newOrderRows[0];
        // Fetch all orders for the user (most recent first)
        const [userOrders] = await promisePool.query(
            `SELECT * FROM works WHERE user_id = ? ORDER BY published_at DESC`,
            [userId]
        );
        return { success: true, newOrder, orders: userOrders };
    } catch (error) {
        console.error('Error in insertOrderAndFetchAll:', error);
        return { success: false, message: error.message };
    }
}

// -------------------------
// API Routes
// -------------------------

// Serve static pages
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'newhome.html'));
});
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});
app.get('/userhome', (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/login');
    }
    res.sendFile(path.join(__dirname, 'userhome.html'));
});

// Login route
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const result = await authenticateUser(username, password);
        if (result.success) {
            req.session.userId = result.user.user_id || result.user.id;
            console.log('User ID stored in session:', req.session.userId);
            res.status(200).json({ success: true, message: 'Login successful', redirect: 'userpages/userhome.html', userId: req.session.userId });
        } else {
            res.status(401).json({ success: false, message: result.message });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

// Registration route
app.post('/register', async (req, res) => {
    const { username, password, email, phone, streetAddress, city, state, postalCode } = req.body;
    const result = await registerUser(username, password, email, phone, streetAddress, city, state, postalCode);
    if (result.success) {
        res.status(201).json({ success: true, message: 'Registration successful', redirect: '/login' });
    } else {
        res.status(400).json({ success: false, message: result.message });
    }
});

// Fetch available works
app.get('/api/available-works', async (req, res) => {
    const userId = req.session.userId;
    if (!userId) {
        return res.status(401).json({ success: false, message: 'User not logged in' });
    }
    try {
        const [works] = await promisePool.query(
            `SELECT * FROM works WHERE status IN ('Available', 'Pending') AND user_id != ? ORDER BY published_at DESC`,
            [userId]
        );
        res.status(200).json(works);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Accept work route
app.post('/acceptWork', async (req, res) => {
    const { workId, buyerUserId, workerUserId, amount } = req.body;
    const userId = req.session.userId; // Assuming the worker is the logged-in user

    if (!userId) {
        return res.status(401).json({ success: false, message: 'User not logged in' });
    }

    try {
        // Start a transaction to ensure atomicity
        await promisePool.query('START TRANSACTION');

        // Update the work status to "Accepted"
        const [updateResult] = await promisePool.query(
            `UPDATE works SET status = 'Accepted' WHERE work_id = ? AND status = 'Pending'`,
            [workId]
        );

        if (updateResult.affectedRows === 0) {
            await promisePool.query('ROLLBACK');
            return res.status(400).json({ success: false, message: 'Work not found or already accepted' });
        }

        // Insert the accepted work details into the transactions table
        const [insertResult] = await promisePool.query(
            `INSERT INTO transactions (buyer_user_id, worker_user_id, work_id, transaction_date, amount, status)
             VALUES (?, ?, ?, NOW(), ?, 'Accepted')`,
            [buyerUserId, workerUserId, workId, amount]
        );

        // Commit the transaction
        await promisePool.query('COMMIT');

        res.status(200).json({ success: true, message: 'Work accepted and transaction recorded' });
    } catch (error) {
        await promisePool.query('ROLLBACK');
        console.error('Error accepting work:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get pending works
app.get("/api/getPendingWorks", async (req, res) => {
    const userId = req.session.userId;
    if (!userId) {
        return res.status(401).json({ success: false, message: 'User not logged in' });
    }
    try {
        const [results] = await promisePool.query(`
            SELECT w.work_id, w.title, w.description, w.status, 
                   u.username AS orderedBy, u.location, u.phone 
            FROM works w 
            JOIN users u ON w.user_id = u.user_id
            WHERE w.status = 'Pending' AND w.user_id != ?;
        `, [userId]);
        res.json(results);
    } catch (err) {
        console.error("Error fetching pending works:", err);
        res.status(500).json({ error: "Database error" });
    }
});

// Get completed transactions
app.get("/api/getTransactions", async (req, res) => {
    const userId = req.session.userId;
    if (!userId) {
        return res.status(401).json({ success: false, message: 'User not logged in' });
    }
    try {
        const [results] = await promisePool.query(`
            SELECT t.transaction_id, w.title, w.description, t.amount, t.status
            FROM transactions t
            JOIN works w ON t.work_id = w.work_id
            WHERE t.worker_user_id = ? OR t.buyer_user_id = ?;
        `, [userId, userId]);
        res.json(results);
    } catch (err) {
        console.error("Error fetching transactions:", err);
        res.status(500).json({ error: "Database error" });
    }
});

// Complete work and insert transaction
app.post("/api/completeWork", async (req, res) => {
    const { work_id, buyer_user_id, worker_user_id, amount } = req.body;

    try {
        await promisePool.query(`UPDATE works SET status = 'completed' WHERE work_id = ?`, [work_id]);
        await promisePool.query(
            `INSERT INTO transactions (buyer_user_id, worker_user_id, work_id, transaction_date, amount, status) 
             VALUES (?, ?, ?, NOW(), ?, 'completed');`,
            [buyer_user_id, worker_user_id, work_id, amount]
        );
        res.json({ message: "Work completed and transaction recorded" });
    } catch (err) {
        console.error("Error completing work:", err);
        res.status(500).json({ error: "Failed to complete work" });
    }
});

// Add rating and review
app.post("/api/addRating", async (req, res) => {
    const { user_id, work_id, skill_id, rating, review } = req.body;

    try {
        await promisePool.query(
            `INSERT INTO ratings (user_id, work_id, skill_id, rating, review, created_at) 
             VALUES (?, ?, ?, ?, ?, NOW());`,
            [user_id, work_id, skill_id, rating, review]
        );
        res.json({ message: "Rating and review added successfully" });
    } catch (err) {
        console.error("Error adding rating:", err);
        res.status(500).json({ error: "Failed to add rating" });
    }
});

// Add skills route
app.post('/addSkill', async (req, res) => {
    const { userId, skills } = req.body;
    try {
        const result = await addUserSkills(userId, skills);
        res.status(200).json({ success: true, message: 'Skills added successfully', data: result });
    } catch (error) {
        res.status(500).json({ message: 'Error adding skills', error });
    }
});

// Get skills route
app.get('/getUserSkills', async (req, res) => {
    const userId = req.session.userId;
    if (!userId) {
        return res.status(401).json({ message: 'User not logged in' });
    }
    try {
        const skills = await getUserSkills(userId);
        res.status(200).json({ skills });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching skills', error });
    }
});

// Delete skill route
app.post('/deleteSkill', async (req, res) => {
    const { skillId, userId } = req.body;
    if (!userId) {
        return res.status(401).json({ message: 'User not logged in' });
    }
    try {
        const result = await deleteUserSkill(userId, skillId);
        if (result.success) {
            res.status(200).json({ message: 'Skill deleted successfully' });
        } else {
            res.status(400).json({ message: result.message });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error deleting skill', error });
    }
});

// Place Order route
app.post('/placeOrder', async (req, res) => {
    const { title, description, category, price, location } = req.body;
    const userId = req.session.userId;
    if (!userId) {
        return res.status(401).json({ success: false, message: 'User not logged in' });
    }
    try {
        const result = await insertOrderAndFetchAll(userId, title, description, category, price, location);
        if (result.success) {
            res.status(200).json({
                success: true,
                message: 'Order placed successfully',
                newOrder: result.newOrder,
                orders: result.orders
            });
        } else {
            res.status(500).json({ success: false, message: result.message });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get User Orders route
app.get('/getUserOrders', async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ success: false, message: 'User not logged in' });
    }
    const userId = req.session.userId;
    try {
        const [orders] = await promisePool.query(
            `SELECT * FROM works WHERE user_id = ? ORDER BY published_at DESC`,
            [userId]
        );
        res.status(200).json({ success: true, orders });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching orders: ' + error.message });
    }
});

// Logout route
app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).send('Error logging out');
        }
        res.redirect('/login.html');
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});