const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  username: String
});

const messageSchema = new mongoose.Schema({
  sender_id: mongoose.Types.ObjectId,
  sender: String,
  sender_name: String,
  content: String,
  time: Date
});

const notificationSchema = new mongoose.Schema({
  user_id: mongoose.Types.ObjectId,
  title: String,
  description: String,
  time: Date,
  seen: Boolean
});

const User = mongoose.model("User", userSchema);
const Message = mongoose.model("Message", messageSchema);

module.exports = {
    User,
    Message
}