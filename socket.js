const { Message } = require("./models");

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

online = []

module.exports = function (server) {
  const io = require("socket.io").listen(server);

  io.sockets.on("connection", function (socket) {
    console.log("user is connected: ", socket.id);
    online[socket.id] = null;
    console.log('connections: ', online)

    socket.on("disconnect", function () {
      console.log("user has disconnected: " + socket.id);
      delete online[socket.id];
    });

    socket.on("register", function (data) {
      online[socket.id] = data
      console.log('connections: ', online)
    });

    socket.on("message", function (data) {
      console.log("message received from: " + socket.id);
      //   console.log(data);

      handleMessageReceived(data)
        .then((newMessage) => {
          // console.log('Sending message to sockets from server');
          io.emit("message", newMessage);
        })
        .catch((err) => {
          console.log("Error adding message: ", err);
        });
    });
  });
};
