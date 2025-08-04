const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");
const cors = require("cors");

const app = express();
const port = 5000;

app.use(express.json());
app.use(cors());

const jwtSecretKey = "your_super_secret_jwt_key_that_should_be_changed";

let posts = [];

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) {
    return res.status(401).json({ message: "Authentication token missing." });
  }

  jwt.verify(token, jwtSecretKey, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid or expired token." });
    }
    req.user = user;
    next();
  });
};

app.post("/api/register", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required." });
  }

  if (users.find((u) => u.username === username)) {
    return res.status(409).json({ message: "Username already exists." });
  }

  try {
    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = { id: uuidv4(), username, passwordHash };
    users.push(newUser);
    res.status(201).json({ message: "User registered successfully." });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error registering user.", error: error.message });
  }
});

app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;

  const user = users.find((u) => u.username === username);
  if (!user) {
    return res.status(401).json({ message: "Invalid username or password." });
  }

  try {
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (isPasswordValid) {
      const token = jwt.sign(
        { id: user.id, username: user.username },
        jwtSecretKey,
        { expiresIn: "1h" }
      );
      res.json({ token, user: { id: user.id, username: user.username } });
    } else {
      res.status(401).json({ message: "Invalid username or password." });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error during login.", error: error.message });
  }
});

app.get("/api/posts", (req, res) => {
  res.json(posts);
});

app.post("/api/posts", authenticateToken, (req, res) => {
  const { title, content } = req.body;
  const authorId = req.user.id;
  const authorUsername = req.user.username;

  if (!title || !content) {
    return res.status(400).json({ message: "Title and content are required." });
  }

  const newPost = {
    id: uuidv4(),
    title,
    content,
    authorId,
    authorUsername,
    date_posted: new Date().toISOString(),
  };
  posts.push(newPost);
  res.status(201).json(newPost);
});

app.get("/api/posts/:id", (req, res) => {
  const post = posts.find((p) => p.id === req.params.id);
  if (!post) {
    return res.status(404).json({ message: "Post not found." });
  }
  res.json(post);
});

app.put("/api/posts/:id", authenticateToken, (req, res) => {
  const { title, content } = req.body;
  const post = posts.find((p) => p.id === req.params.id);

  if (!post) {
    return res.status(404).json({ message: "Post not found." });
  }

  if (post.authorId !== req.user.id) {
    return res
      .status(403)
      .json({ message: "You are not authorized to update this post." });
  }

  if (title) post.title = title;
  if (content) post.content = content;

  res.json(post);
});

app.delete("/api/posts/:id", authenticateToken, (req, res) => {
  const postIndex = posts.findIndex((p) => p.id === req.params.id);

  if (postIndex === -1) {
    return res.status(404).json({ message: "Post not found." });
  }

  if (posts[postIndex].authorId !== req.user.id) {
    return res
      .status(403)
      .json({ message: "You are not authorized to delete this post." });
  }

  posts.splice(postIndex, 1);
  res.json({ message: "Post deleted successfully." });
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
