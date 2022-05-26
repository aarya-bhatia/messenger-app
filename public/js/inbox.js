let socket = io.connect();

socket.emit("register", {
  socket_id: socket.id,
  user_id,
  username,
});

const formElement = document.querySelector("form");
const messageInput = document.querySelector("#content");
const messageListElement = document.querySelector("[data-messages]");
const container = document.querySelector(".message-container");

container.scrollTop = container.scrollHeight; // scroll div

formElement.addEventListener("submit", function (e) {
  e.preventDefault();

  if (messageInput.value) {
    console.log("Sending message to server: " + messageInput.value);

    socket.emit("message", {
      sender_id: user_id,
      socket_id: socket.id,
      content: messageInput.value,
      sender: username,
      time: new Date(),
    });
  }
});

socket.on("message", function (data) {
  if (data.time) {
    data.time = new Date(data.time).toLocaleString();
  }

  html = "";
  html += "<li class='messages list-group-item'>";
  html += "<strong>" + data.sender + "</strong> ";
  html += data.content;
  html += "<span>" + data.time + "</span>";
  html += "</li>";
  // console.log(html);
  messageListElement.innerHTML += html;

  container.scrollTop = container.scrollHeight; // scroll div
  messageInput.value = ""; // clear message now
});

const userListElement = document.querySelector("[data-user-list]");

socket.on("users", function (data) {
  console.log("online users: ", data.users);
  html = "";
  for (const user of data.users) {
    li = "<li>" + user.username + "</li>";
    html += li;
  }
  userListElement.innerHTML = html;
});
