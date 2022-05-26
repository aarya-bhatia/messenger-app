const express = require('express');
const app = express();

const port = process.env.PORT || 3000;
const server = require('http').createServer(app)

app.set('view engine', 'ejs');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(__dirname + '/public'));
app.use(require('./router'))

server.listen(port, () => {
  console.log('Server is running', server.address())
});

require('./db')
require('./socket')(server)