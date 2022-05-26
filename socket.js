module.exports = function(server) {
    const io = require('socket.io').listen(server);

    io.sockets.on("connection", (socket)=>{
        console.log('user is connected', socket.id);

        socket.on('disconnect', () => {
            console.log('user has disconnected')
        })
    });
}