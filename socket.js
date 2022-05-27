const { Message } = require("./models");
const store = require("./store");

function handleMessageReceived(data) {
  const { sender_name, sender_id, sender, content, time } = data;

  const newMessage = new Message({
    sender_id,
    sender_name,
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

    socket.on("disconnect", function () {
      console.log("user has disconnected: " + socket.id);

      if (store.online[socket.id]) {
        user_id = store.online[socket.id].user_id;

        if (user_id) {
          store.last_seen[user_id] = new Date();
        }
      }

      delete store.online[socket.id];

      io.emit("users", { users: getOnlineUsers() });
    });

    /**
     * send data for notifications on home page
     * @param data { user_id }
     */
    socket.on("status", function (data) {
      if (data.user_id) {
        if (store.last_seen[data.user_id]) {
          console.log(store.last_seen[data.user_id]);

          // count number of new messages since last seen time for current user
          Message.countDocuments({
            time: { $gte: store.last_seen[data.user_id] },
          }).then((result) => {
            console.log(result + " new messages");
            io.to(socket.id).emit('status', { num_messages: result })
          });

        }
      }
    });

    socket.on("register", function (data) {
      store.online[socket.id] = data;

      if (data.user_id) {
        store.last_seen[data.user_id] = new Date();
      }

      io.emit("users", { users: getOnlineUsers() });
    });

    socket.on("message", function (data) {
      console.log("message received from: " + socket.id);

      handleMessageReceived(data)
        .then((newMessage) => {
          io.emit("message", newMessage);
        })
        .catch((err) => {
          return console.log("Error adding message: ", err);
        });
    });
  });
};
