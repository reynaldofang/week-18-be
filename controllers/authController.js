const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const registerUser = async (req, res) => {
  const { username, password, role } = req.body;

  if (!username || !password || !role) {
    return res
      .status(400)
      .json({ error: "Username, password, and role are required fields." });
  }

  if (username.trim() === "") {
    return res.status(400).json({ error: "Username cannot be blank." });
  }

  if (
    password.length < 8 ||
    !password.match(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/)
  ) {
    return res.status(400).json({
      error:
        "Password must be at least 8 characters long and contain both letters and numbers.",
    });
  }

  if (role !== "user" && role !== "admin") {
    return res
      .status(400)
      .json({ error: "Invalid role. Valid roles are 'user' and 'admin'." });
  }

  try {
    const existingUser = await req.db.collection("users").findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: "Username already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await req.db.collection("users").insertOne({
      username,
      password: hashedPassword,
      role,
    });

    if (result.insertedId) {
      res.status(201).json({
        message: "User created successfully.",
        userId: result.insertedId,
      });
    } else {
      res.status(500).json({ error: "Failed to create user." });
    }
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Failed to create user." });
  }
};

const loginAttempts = {};

const loginUser = async (req, res) => {
  const { username, password } = req.body;

  // Periksa apakah pengguna telah mencoba login yang salah dalam 30 detik terakhir
  if (loginAttempts[username] && loginAttempts[username] > Date.now() - 30000) {
    const remainingTime = Math.ceil(
      (loginAttempts[username] - Date.now() + 30000) / 1000
    );
    return res.status(429).json({
      error: `Anda harus menunggu ${remainingTime} detik sebelum mencoba login lagi.`,
    });
  }

  try {
    const user = await req.db.collection("users").findOne({ username });
    if (!user) {
      throw new Error("Invalid credentials.");
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      throw new Error("Invalid credentials.");
    }

    const token = jwt.sign(
      { _id: user._id, username: user.username, role: user.role },
      "your-secret-key",
      { expiresIn: "1h" }
    );

    // Reset catatan login yang salah setelah login berhasil
    if (loginAttempts[username]) {
      delete loginAttempts[username];
    }

    res.json({ message: "Login successful.", token });
  } catch (error) {
    console.error("Login error:", error);

    // Catat waktu login yang salah terakhir kali
    loginAttempts[username] = Date.now();

    res.status(401).json({ error: error.message });
  }
};

module.exports = { registerUser, loginUser };
