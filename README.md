📚 Notes Hive

A full-stack application that allows users to securely upload, store, and access academic PDF notes. Designed for students who want to share and access quality study materials.
✨ Features
* 🔐 User authentication (signup & login)
* 📁 Upload and manage PDF notes
* 📄 View all uploaded notes
* 🧾 Organized backend with modular controllers and middleware
* 🗄️ Secure file storage
* 📦 RESTful APIs for frontend integration

🛠️ Tech Stack
Backend

* Node.js
* Express.js
* MongoDB with Mongoose
* Multer (for file uploads)
* JSON Web Tokens (JWT) for authentication
* bcrypt.js for password hashing

⚙️ Installation & Setup
1. Clone the repository

git clone https://github.com/vishra0/Notes-hive.git
cd Notes-hive/backend

 2. Install dependencies

npm install

3. Configure environment variables

Create a `.env` file in the `backend` directory:
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key

4. Start the backend server

npm start

Server will run on `http://localhost:5000`.

📄 License

MIT License. Feel free to use, modify, and distribute this project.

