const express = require("express");
const cors = require("cors");
const User = require("./models/User");
const Post = require("./models/Post");
const bcrypt = require("bcryptjs");
const app = express();
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const multer = require("multer");
const { v4: uuidv4 } = require('uuid');
const fs = require("fs");
const dotenv = require("dotenv")
dotenv.config()
const PORT = process.env.API_PORT || 4000;

const admin = require('firebase-admin');
const { getStorage } = require('firebase-admin/storage');
const path = require('path');

const salt = bcrypt.genSaltSync(10);
const secret = process.env.JWT_SECRET;

const serviceAccount = {
  type: process.env.FIREBASE_TYPE,
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: process.env.FIREBASE_AUTH_URI,
  token_uri: process.env.FIREBASE_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_CERT,
  client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL,
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
});

const bucket = getStorage().bucket();

const upload = multer({ storage: multer.memoryStorage() });

app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
}));
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
      jwt.sign({ username, id: userDoc._id }, secret, {}, (err, token) => {
        if (err) throw err;
        res.cookie("token", token).json({
          id: userDoc._id,
          username,
        });
      });
    } else {
      res.status(400).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
 });

app.get("/api/profile", (req, res) => {
  const { token } = req.cookies;
  jwt.verify(token, secret, {}, (err, info) => {
    if (err) {
      return res.status(401).json({ message: 'Unauthorized' });
    };
    res.json(info);
  });
});

app.post("/api/logout", (req, res) => {
  res.cookie("token", "").json("ok");
});

app.post("/api/post", upload.single('file'), async (req, res) => {
  try {
    const { title, content } = req.body;
    const file = req.file;
    const uniqueFileName = `${uuidv4()}-${file.originalname}`;
    const fileBuffer = file.buffer;

    const fileUpload = bucket.file(uniqueFileName);
    await fileUpload.save(fileBuffer, {
      metadata: {
        contentType: file.mimetype,
      },
    });
    const downloadURL = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(uniqueFileName)}?alt=media`;

    const { token } = req.cookies;
    jwt.verify(token, secret, {}, async (err, info) => {
      if (err) throw err;
      const postDoc = await Post.create({
        title,
        content,
        cover: downloadURL,
        author: info.id,
      });
      res.json(postDoc);
    });
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.put("/api/post", upload.single('file'), async (req, res) => {
  try {
    const { title, content, id } = req.body;

    const { token } = req.cookies;
    jwt.verify(token, secret, {}, async (err, info) => {
      if (err) return res.status(401).json({ message: 'Unauthorized' });

      const postDoc = await Post.findById(id);
      if (!postDoc) return res.status(404).json({ message: 'Post not found' });

      const isAuthor = JSON.stringify(postDoc.author) === JSON.stringify(info.id);
      if (!isAuthor) return res.status(403).json({ message: "You are not the author" });

      let downloadURL = postDoc.cover;
      if (req.file) {
        const file = req.file;
        const uniqueFileName = `${uuidv4()}-${file.originalname}`;
        const fileBuffer = file.buffer;

        const fileUpload = bucket.file(uniqueFileName);
        await fileUpload.save(fileBuffer, {
          metadata: {
            contentType: file.mimetype,
          },
        });
        downloadURL = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(uniqueFileName)}?alt=media`;
      }

      postDoc.title = title;
      postDoc.content = content;
      postDoc.cover = downloadURL;

      await postDoc.save();
      
      res.json(postDoc);
    });
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.delete("/api/post", async (req, res) => {
  const { id, fileName} = req.body;

  try {
    const { token } = req.cookies;
    jwt.verify(token, secret, {}, async (err, info) => {
      if (err) return res.status(401).json({ message: "Unauthorized" });

      const post = await Post.findById(id);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }

      if (post.author.toString() !== info.id) {
        return res.status(403).json({ message: "You are not the author of this post" });
      }
      
      try {
        const filePath = fileName.split('?')[0]
        const file = bucket.file(filePath);
        await file.delete();
      } catch (error) {
        console.error("Error deleting file from Firebase Storage:", error);
        return res.status(500).json({ message: `Failed to delete file from storage` });
      }

      await Post.findByIdAndDelete(id);
      res.json({ message: "Post deleted successfully" });
    });
    
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/api/post", async (req, res) => {
  const { page = 1, limit = 9 } = req.query;

  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const totalPosts = await Post.countDocuments();
    const totalPages = Math.ceil(totalPosts / limit)

    res.json({
      posts,
      totalPages,
      currentPage: parseInt(page),
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/api/post/:id", async (req, res) => {
  const { id } = req.params;
  const postDoc = await Post.findById(id).populate("author", ["username"]);
  res.json(postDoc);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;