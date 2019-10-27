const Server = require('socket.io');

const io = Server();

io.on('connection', socket => {
  if (socket.request.user) {
    console.log(`${socket.request.user.name} connected!`);
    socket.join(socket.request.user._id);
  } else {
    console.log('a guest connected.')
  }

  socket.on('subscribeMessages', offerId => {
    socket.join(offerId);
  });

  socket.on('unsubscribeMessages', offerId => {
    socket.leave(offerId);
  });

  socket.on('disconnect', () => {
    console.log('user disconnected')
  });
});

module.exports = io;