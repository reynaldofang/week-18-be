const { ObjectId } = require("mongodb");

const createTodo = async (req, res) => {
  try {
    const userId = req.user._id;
    const { text } = req.body;

    const result = await req.db.collection("todos").insertOne({ userId, text });

    res.status(201).json({
      message: "Todo created successfully.",
      todoId: result.insertedId,
    });
  } catch (error) {
    console.error("Error creating todo:", error);
    res.status(500).json({ error: "Failed to create todo." });
  }
};

const getTodoList = async (req, res) => {
  try {
    const userId = req.user._id;

    const todoslist = await req.db
      .collection("todos")
      .find({ userId })
      .toArray();

    res.json({ todoslist });
  } catch (error) {
    console.error("Error getting todo list:", error);
    res.status(500).json({ error: "Failed to get todo list." });
  }
};

const updateTodo = async (req, res) => {
  try {
    const todoId = new ObjectId(req.params.todoId);
    console.log(todoId);
    const { text } = req.body;

    const result = await req.db
      .collection("todos")
      .updateOne({ _id: transferId }, { $set: { text } });
    console.log("MongoDB Update Result:", result);
    if (result.modifiedCount === 1) {
      res.json({ message: "Todo updated successfully." });
    } else {
      res.status(404).json({ error: "Todo not found." });
    }
  } catch (error) {
    console.error("Error changing todo:", error);
    res.status(500).json({ error: "Failed to change Todo." });
  }
};

const deleteTodo = async (req, res) => {
  try {
    const todoId = new ObjectId(req.params.todoId);

    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const result = await req.db.collection("todos").deleteOne({ _id: todoId });

    console.log("MongoDB Delete Result:", result);

    if (result.deletedCount === 1) {
      res.json({ message: "Todo item deleted successfully." });
    } else {
      res.status(404).json({ error: "Todo item not found." });
    }
  } catch (error) {
    console.error("Error deleting todo item:", error);
    res.status(500).json({ error: "Failed to delete todo item." });
  }
};

module.exports = {
  createTodo,
  getTodoList,
  updateTodo,
  deleteTodo,
};
