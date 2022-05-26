const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  username: String
});

const messageSchema = new mongoose.Schema({
  sender: String,
  content: String,
  time: String
});

const User = mongoose.model("User", userSchema);
const Message = mongoose.model("Message", messageSchema);

module.exports = {
    User,
    Message
}