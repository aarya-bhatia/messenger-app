function notify(message) {
  // Let's check if the browser supports notifications
  if (!("Notification" in window)) {
    console.warn("This browser does not support desktop notification");
    return
  }

  // Let's check whether notification permissions have already been granted
  else if (Notification.permission === "granted") {
    // If it's okay let's create a notification
    return new Notification(message)
  }

  // Otherwise, we need to ask the user for permission
  else if (Notification.permission !== "denied") {
    Notification.requestPermission().then(function (permission) {
      // If the user accepts, let's create a notification
      if (permission === "granted") {
        return new Notification(message)
      }
    });
  }

  // At last, if the user has denied notifications, and you
  // want to be respectful there is no need to bother them any more.
}

let socket = io.connect();

const notificationBadge = document.querySelector("#new-messages-label");
let num_message = parseInt(notificationBadge.innerText) || 0;

// Get notifications
socket.emit("status", { user_id });

function updateNotifications() {
  // set label for no of new message
  notificationBadge.innerText = num_message;
}

socket.on("status", function (data) {
  if (data.num_messages) {
    num_message += data.num_messages;
    updateNotifications();
  }
});

socket.on("message", function (data) {
  console.log("new message: ", data);
  num_message += 1;
  updateNotifications();
  notify(data.sender + ': ' + data.content)
});
