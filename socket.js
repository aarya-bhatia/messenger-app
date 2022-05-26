const { Message } = require("./models");
const store = require("./store");

function handleMessageReceived(data) {
  const { sender_id, sender, content, time } = data;

  const newMessage = new Message({
    sender_id,
    sender,
    content,
    time,
  });

  return new Promise(function (res, rej) {
    newMessage
      .save()
      .then(() => {
        return res(newMessage);
      })
      .catch((err) => rej(err));
  });
}

function getOnlineUsers() {
  result = [];
  for (const key in store.online) {
    if (store.online[key]) {
      result.push(store.online[key]);
    }
  }
  return result;
}

module.exports = function (server) {
  const io = require("socket.io").listen(server);

  io.sockets.on("connection", function (socket) {
    console.log("user is connected: ", socket.id);
    store.online[socket.id] = null;
    console.log("connections: ", store.online);
    console.log("last seen: ", store.last_seen);

    socket.on("disconnect", function () {
      console.log("user has disconnected: " + socket.id);

      if (store.online[socket.id]) {
        store.last_seen[store.online[socket.id].user_id] = new Date();
      }

      delete store.online[socket.id];
      io.emit("users", { users: getOnlineUsers() });
    });

    socket.on("register", function (data) {
      if(!data.user_id) {
        return console.log('Register error: user_id missing')
      }

      store.online[socket.id] = data;
      store.last_seen[data.user_id] = new Date();
      console.log("connections: ", store.online);
      io.emit("users", { users: getOnlineUsers() });
    });

    socket.on("message", function (data) {
      console.log("message received from: " + socket.id);

      handleMessageReceived(data)
        .then((newMessage) => {
          // console.log('Sending message to sockets from server');
          io.emit("message", newMessage);
        })
        .catch((err) => {
          return console.log("Error adding message: ", err);
        });
    });
  });
};
