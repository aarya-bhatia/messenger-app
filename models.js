const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  first_name: String,
  last_name: String,
  email: String,
  password: String,
  username: String,
}, {
  timestamps: true
});

const messageSchema = new mongoose.Schema({
  sender_id: mongoose.Types.ObjectId,
  sender: String,
  sender_name: String,
  content: String,
  time: Date,
});

const User = mongoose.model("User", userSchema);
const Message = mongoose.model("Message", messageSchema);

module.exports = {
  User,
  Message,
};
