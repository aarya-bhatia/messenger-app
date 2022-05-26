let socket = io.connect();

const notificationBadge = document.querySelector('#new-messages-label')
let num_message = parseInt(notificationBadge.innerText) || 0

// Get notifications
socket.emit("status", { user_id });

function updateNotifications()
{
    // set label for no of new message
    notificationBadge.innerText = num_message
}

socket.on('status', function(data) {
    if(data.num_messages){
        num_message += data.num_messages
        updateNotifications()
    }
})

socket.on("message", function (data) {
  console.log("new message: ", data);
  num_message += 1
  updateNotifications()
});
