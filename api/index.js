const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const User = require("./models/User");
const Post = require("./models/Post");
const bcrypt = require("bcryptjs");
const app = express();
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const multer = require("multer");
const uploadMiddleware = multer({ dest: "uploads/" });
const fs = require("fs");
const dotenv = require("dotenv")
dotenv.config()

app.use(cors())

app.get('/api/test', (req, res) => {
   res.json('hello World' + Date.now());
})


if (process.env.API_PORT ){
   app.listen(process.env.API_PORT)
}

module.exports = app;