const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  username: String
});

const messageSchema = new mongoose.Schema({
  sender_id: mongoose.Types.ObjectId,
  sender: String,
  content: String,
  time: Date
});

const User = mongoose.model("User", userSchema);
const Message = mongoose.model("Message", messageSchema);

module.exports = {
    User,
    Message
}