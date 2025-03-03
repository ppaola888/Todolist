import mongoose from "mongoose";

const todolistSchema = new mongoose.Schema({
  name: String,
  description: String,
  dueDate: Date,
});

const Todo = mongoose.model("Todo", todolistSchema, "activities");

export default Todo;
