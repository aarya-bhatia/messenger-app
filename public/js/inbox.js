let socket = io.connect();

socket.emit("register", {
  socket_id: socket.id,
  user_id,
  username,
});

const formElement = document.querySelector("form");
const messageInput = document.querySelector("#content");
const container = document.querySelector("[data-message-container]");
const messageTemplate = document.getElementsByTagName("template")[0];
const userListElement = document.querySelector("[data-user-list]");

function createMessageElement(message) {
  const clone = messageTemplate.content.cloneNode(true);
  clone.querySelector("[data-message-sender]").innerText = message.sender;
  clone.querySelector("[data-message-content]").innerText = message.content;
  clone.querySelector("[data-message-time]").innerText = message.time;
  return clone;
}

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
  messageElement = createMessageElement(data);
  container.appendChild(messageElement);
  container.scrollTop = container.scrollHeight; // scroll div
  messageInput.value = ""; // clear message now
});

socket.on("users", function (data) {
  console.log("online users: ", data.users);
  html = "";
  for (const user of data.users) {
    li = "<li>" + user.username + "</li>";
    html += li;
  }
  userListElement.innerHTML = html;
});
