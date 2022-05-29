(function () {
  let socket = io.connect();

  const formElement = document.querySelector("form");
  const messageInput = document.querySelector("#content");
  const container = document.querySelector("[data-message-list]");
  const messageTemplate = document.querySelector(
    "template#message-card-template"
  );
  const userListElement = document.querySelector("[data-user-list]");

  function createAlert(message, type) {
    const e = document.createElement("div");
    e.classList.add("alert");
    e.classList.add(type);
    e.innerText = message;
    return e;
  }

  function createMessageElement(message) {
    // console.log("Message author: " + message.sender_name);
    const clone = messageTemplate.content.cloneNode(true);
    clone
      .querySelector("[data-message-avatar]")
      .setAttribute(
        "src",
        "https://ui-avatars.com/api/?background=82DBD8&name=" +
          message.sender_name.split(" ").join("+")
      );
    clone.querySelector("[data-message-sender]").innerText = message.sender;
    clone.querySelector("[data-message-content]").innerText = message.content;
    clone.querySelector("[data-message-time]").innerText = message.time;
    return clone;
  }

  formElement.addEventListener("submit", function (e) {
    e.preventDefault();

    if (messageInput.value) {
      console.log("Sending message to server: " + messageInput.value);

      socket.emit("message", {
        sender_id: user_id,
        sender_name: full_name,
        socket_id: socket.id,
        content: messageInput.value,
        sender: username,
        time: new Date(),
      });
    }
  });

  function fetchMessages() {
    const base_url = location.protocol + "//" + location.host;

    fetch(base_url + "/api/messages")
      .then((messages) => messages.json())
      .then((messages) => {
        if (container.querySelector("#spinner")) {
          container.innerHTML = ""; // to remove spinner
        }

        for (const message of messages) {
          message.time = new Date(message.time).toLocaleString();
          container.appendChild(createMessageElement(message));
        }

        container.scrollTop = container.scrollHeight; // scroll div
      })
      .catch((err) => {
        console.log(err);
        document.querySelector("[data-message-list]").innerHTML =
          '<p class="lead">Sorry, we are unable to load the messages. Please refresh the page to try again.</p>';
      });
  }

  function register() {
    socket.emit("register", {
      socket_id: socket.id,
      user_id,
      username,
    });
  }

  socket.on("message", function (data) {
    if (data.time) {
      data.time = new Date(data.time).toLocaleString();
    }
    messageElement = createMessageElement(data);
    container.appendChild(messageElement);
    container.scrollTop = container.scrollHeight; // scroll div
    messageInput.value = ""; // clear message now
  });

  // updates list of online users
  socket.on("users", function (data) {
    // console.log('users', data)
    html = "";
    for (const user of data.users) {
      html += "<li>" + user.username + "</li>";
    }

    userListElement.innerHTML = html;

    if (data.message) {
      if (container.querySelector("#spinner")) {
        container.innerHTML = ""; // to remove spinner
      }
      container.appendChild(createAlert(data.message, "alert-warning"));
    }
  });

  fetchMessages();
  register();
})();
