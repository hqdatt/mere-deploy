const express = require("express");
const cors = require("cors");
const User = require("./models/User");
const Post = require("./models/Post");
const bcrypt = require("bcryptjs");
const app = express();
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const multer = require("multer");
const fs = require("fs");
const dotenv = require("dotenv")
dotenv.config()
const PORT = process.env.API_PORT || 4000;

const salt = bcrypt.genSaltSync(10);
const secret = process.env.JWT_SECRET;

app.use(cors())
app.use(express.json());
app.use(cookieParser());

const connectDB = require("./connectMongo");

connectDB();

app.post("/api/register", async (req, res) => {
   const { username, password } = req.body;
   try {
      const userDoc = await User.create({
         username,
         password: bcrypt.hashSync(password, salt),
      });
      res.json(userDoc);
   } catch (e) {
      console.log(e);
      res.status(400).json(e);
   }
});

app.post("/api/login", async (req, res) => {
   const { username, password } = req.body;
   try {
     const userDoc = await User.findOne({ username });
     if (!userDoc) {
       return res.status(400).json({ message: 'User not found' });
     }
     const passOk = bcrypt.compareSync(password, userDoc.password);
     if (passOk) {
       res.status(200).json({ message: 'Login successful' });
     } else {
       res.status(400).json({ message: 'Invalid credentials' });
     }
   } catch (error) {
     console.error(error);
     res.status(500).json({ message: 'Internal server error' });
   }
 });

 app.listen(PORT, () => {
   console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;