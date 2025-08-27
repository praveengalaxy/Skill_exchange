# A Neighborhood Skill Exchange Platform

A full‑stack web application that connects neighbors to exchange skills and services. Users can register/login, publish works (orders), accept others’ works, manage their skillsets, and track transactions.

## Tech Stack
- Backend: Node.js, Express, mysql2, express-session, bcrypt, CORS
- Frontend: Static HTML/CSS/JavaScript
- Database: MySQL

## Features
- User authentication (register/login) with bcrypt and session cookies
- Publish and manage works (orders)
- Browse and accept available works from others (atomic DB transaction)
- View pending works and transaction history
- Manage personal skillsets (add/list/delete)
- Basic ratings and reviews endpoint

## Project Structure
```
skill exchange/
  App.css                # Unused React styling (legacy)
  App.js                 # Unused React app (legacy Event Management demo)
  back3.jpg
  favicon.jpg
  home.html              # Marketing landing (legacy)
  newhome.html           # Main landing (served at /)
  homescript.js          # Landing page enhancements
  homestyle.css          # Landing page styles
  login.html             # Login/Register page
  login.js               # Login/Register flow
  loginstyle.css
  userpages/
    userhome.html        # Dashboard for available works
    userhome.js
    userhome.css
    orders.html          # Place order + order history
    orders.js
    pending.html         # Pending works
    pending.js
    transactions.html    # Transactions history
    transaction.js
    skillsets.html       # Manage skills
    skillsets.js
    navstyle.css
    order.css
    skillsets.css
  server.js              # Express server and API routes
  package.json
  package-lock.json
  sqlfile.sql            # Unused stored procedures (plaintext auth; not recommended)
```

## Getting Started

### Prerequisites
- Node.js 18+
- MySQL 8+

### Installation
1. Clone the repo and install dependencies:
   ```bash
   npm install
   ```
2. Create a MySQL database named `Skillexchange` and tables (see Schema section).
3. Configure environment variables (recommended) or update the DB config in `server.js`.

### Environment Variables
Create a `.env` file at the project root and set:
```
PORT=5500
SESSION_SECRET=replace-with-strong-secret
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your-password
DB_NAME=Skillexchange
DB_CONN_LIMIT=10
CORS_ORIGIN=http://localhost:5500
```
Note: Update `server.js` to read these using `dotenv` if you adopt env-based config.

### Run the App
```bash
npm start
```
Open `http://localhost:5500/`.

## Database Schema (Suggested)
The code expects the following tables/columns. Adjust names consistently (prefer lowercase) and standardize status values: `Pending`, `Accepted`, `Completed`.

```sql
CREATE TABLE users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,           -- bcrypt hash
  email VARCHAR(255) NOT NULL,
  phone_number VARCHAR(20),
  street_address VARCHAR(255),
  city VARCHAR(100),
  state VARCHAR(100),
  postal_code VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE works (
  work_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,                     -- owner/buyer who posted the work
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  published_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  status ENUM('Pending','Accepted','Completed') DEFAULT 'Pending',
  price DECIMAL(10,2) DEFAULT 0,
  location VARCHAR(255),
  FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE skills (
  skill_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  skill_name VARCHAR(255) NOT NULL,
  proficiency_level VARCHAR(100),
  years_of_experience INT DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE transactions (
  transaction_id INT AUTO_INCREMENT PRIMARY KEY,
  buyer_user_id INT NOT NULL,
  worker_user_id INT NOT NULL,
  work_id INT NOT NULL,
  transaction_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  amount DECIMAL(10,2) NOT NULL,
  status ENUM('Accepted','Completed') NOT NULL,
  FOREIGN KEY (buyer_user_id) REFERENCES users(user_id),
  FOREIGN KEY (worker_user_id) REFERENCES users(user_id),
  FOREIGN KEY (work_id) REFERENCES works(work_id)
);

CREATE TABLE ratings (
  rating_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,                     -- who received the rating or who rated (clarify per design)
  work_id INT,
  skill_id INT,
  rating INT CHECK (rating BETWEEN 1 AND 5),
  review TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id),
  FOREIGN KEY (work_id) REFERENCES works(work_id),
  FOREIGN KEY (skill_id) REFERENCES skills(skill_id)
);
```

## API Endpoints
Authentication is session-based. Most endpoints require a valid session (`req.session.userId`).

- Auth
  - `POST /register` — body: `{ username, password, email, phone, streetAddress, city, state, postalCode }`
  - `POST /login` — body: `{ username, password }` → sets session, returns `{ success, message, userId, redirect }`
  - `GET /logout` — destroys session

- Skills
  - `POST /addSkill` — body: `{ userId, skills: [{ name, proficiencyLevel, yearsOfExperience }] }`
  - `GET /getUserSkills` — returns `{ skills: [...] }` for the session user
  - `POST /deleteSkill` — body: `{ userId, skillId }`

- Works/Orders
  - `POST /placeOrder` — body: `{ title, description, category, price, location }` → returns `newOrder` + `orders`
  - `GET /getUserOrders` — returns orders for session user
  - `GET /api/available-works` — works not owned by session user with status `Available` or `Pending`
  - `GET /api/getPendingWorks` — pending works (joined with user details)
  - `POST /acceptWork` — marks a work as accepted and inserts a transaction (see Known Issues)
  - `POST /api/completeWork` — marks work completed and records a completed transaction

- Ratings
  - `POST /api/addRating` — body: `{ user_id, work_id, skill_id, rating, review }`

## Frontend Pages
- `/` → `newhome.html`: landing page
- `/login` → `login.html`: toggle login/register
- `/userpages/userhome.html`: list available works and accept
- `/userpages/orders.html`: place orders and view your orders
- `/userpages/pending.html`: view pending works
- `/userpages/transactions.html`: view transactions
- `/userpages/skillsets.html`: manage skills

## Known Issues and Recommendations
- Environment/config
  - DB credentials are hardcoded in `server.js`. Move to `.env` and load via `dotenv`.
  - `CORS` origin points to `http://localhost:5500`. If the frontend is served by Express on the same origin, you can restrict or disable CORS.

- Data model consistency
  - Standardize table/case: use lowercase names consistently (`users`, `works`, `skills`, ...).
  - Ensure `users` has `phone_number` and address fields; avoid referencing non-existent `location` and `phone` in joins. Update `/api/getPendingWorks` accordingly.
  - Standardize work `status` values: `Pending` → `Accepted` → `Completed`.

- Accept work flow
  - Frontend `userhome.js` calls `POST /acceptWork` with `{ workId }` only, while backend expects `{ workId, buyerUserId, workerUserId, amount }` and uses them on insert. Fix either by:
    - Backend: derive `buyerUserId` from the work, `workerUserId` from session, and `amount` from `works.price` (recommended), or
    - Frontend: send the full payload.

- Stored procedures
  - `sqlfile.sql` uses plaintext password comparison and a different casing. Not used by the app and unsafe. Remove or rewrite to match bcrypt.

- Legacy React files
  - `App.js` and `App.css` belong to a different demo (Event Management). Consider removing or moving to a separate repo to reduce confusion.

## Security Checklist (Minimum)
- Use environment variables for secrets
- Set `cookie.secure=true` in production (HTTPS)
- Validate and sanitize all inputs server-side
- Limit CORS to trusted origins
- Use parameterized queries (already used via mysql2)

## Development Tips
- Keep routes slim; move DB logic to service modules as the app grows
- Add a `GET /me` endpoint to expose the session user to the frontend
- Add error toasts/redirect on 401 in frontend scripts
- Consider migrating to a client framework if the UI grows (React/Vue/Svelte)

## Scripts
- `npm start` — run the server on `PORT` (defaults to 5500)

## License
This project is for educational purposes. Add a LICENSE file if you plan to open source.
