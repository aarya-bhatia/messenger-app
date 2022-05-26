const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/messengerDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to db...')
}).catch(err => {
  console.log(err)
  process.exit(1)
})