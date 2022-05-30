(function () {
  const formElement = document.querySelector("form");
  const messageInput = document.querySelector("#content");
  const container = document.querySelector("[data-message-list]");
  const messageTemplate = document.querySelector("#message-card-template");
  const userListElement = document.querySelector("[data-user-list]");
  let loading = false;
  let socket = io.connect();

  function scrollToBottom() {
    container.scrollTop = container.scrollHeight; // scroll div
  }

  function createAlert(message, type) {
    const e = document.createElement("div");
    e.classList.add("alert");
    e.classList.add(type);
    e.innerText = message;
    return e;
  }

  function createMessageElement(message) {
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

  function handleFormSubmit(e) {
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
  }

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

        scrollToBottom();
      })
      .catch((err) => {
        console.log(err);
        document.querySelector("[data-message-list]").innerHTML =
          '<p class="lead">Sorry, we are unable to load the messages. Please refresh the page to try again.</p>';
      })
      .finally(() => {
        loading = false;
      });
  }

  function register() {
    socket.emit("register", {
      socket_id: socket.id,
      user_id,
      username,
    });
  }

  function handleMessage(data) {
    if (data.time) {
      data.time = new Date(data.time).toLocaleString();
    }
    messageElement = createMessageElement(data);
    container.appendChild(messageElement);
    messageInput.value = ""; // clear message now
    scrollToBottom();
  }

  function addServerMessage(message) {
    if (container.querySelector("#spinner")) {
      container.innerHTML = ""; // to remove spinner
    }
    container.appendChild(createAlert(message, "alert-warning"));
  }

  function handleUsers(data) {
    // console.log('users', data)
    html = "";
    for (const user of data.users) {
      html += "<li>" + user.username + "</li>";
    }

    userListElement.innerHTML = html;

    if (data.message) {
      addServerMessage(data.message);
      scrollToBottom();
    }
  }

  formElement.addEventListener("submit", handleFormSubmit);

  // Recieve new message
  socket.on("message", handleMessage);

  // updates list of online users
  socket.on("users", handleUsers);

  // Load messages for user on start up
  if (!loading) fetchMessages();
  register();
})();
