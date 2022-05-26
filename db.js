const mongoose = require("mongoose");

require("dotenv").config();

url = "mongodb://localhost:27017/messengerDB";
prod_url = process.env.DB_URL;
node_env = process.env.NODE_ENV || 'development';

if (process.env.NODE_ENV == "production") {
  url = prod_url;
} 

mongoose
  .connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to db...");
  })
  .catch((err) => {
    console.log(err);
    process.exit(1);
  });
