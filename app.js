const express = require("express");
const app = express();
const { MongoClient } = require("mongodb");
const bodyParser = require("body-parser");
const authController = require("./controllers/authController");
const todoController = require("./controllers/todoController");
const cors = require("cors");
const {
  authorizeRole,
  authenticateJWT,
} = require("./middleware/authenticateUser");

app.use(bodyParser.json());

const connectToDatabase = async (req, res, next) => {
  try {
    const mongoClient = await new MongoClient(
      "mongodb://mongo:3A6f6gH5-g6G2g5gfhdAFddF313FH4b5@roundhouse.proxy.rlwy.net:50086"
    ).connect();

    req.db = mongoClient.db("revou_week18");
    next();
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    res.status(500).send("Failed to connect to MongoDB");
  }
};
app.use(cors());
app.use(connectToDatabase);

// User
app.post("/register", authController.registerUser);
app.post("/login", authController.loginUser);

// Todo
app.post("/todos/create", authenticateJWT, todoController.createTodo);

app.get("/todos/list", authenticateJWT, todoController.getTodoList);

app.patch(
  "/todos/:todoId",
  authenticateJWT,
  authorizeRole("user"),
  todoController.updateTodo
);

app.delete(
  "/todos/:todoId",
  authenticateJWT,
  authorizeRole("admin"),
  todoController.deleteTodo
);

app.listen(5000, () => {
  console.log("Server is running on port 5000");
});
