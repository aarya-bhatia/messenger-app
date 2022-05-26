const mongoose = require("mongoose");

require("dotenv").config();

local_url = "mongodb://localhost:27017/messengerDB";
prod_url = process.env.DB_URL;
url = null;

if (process.env.NODE_ENV == "development") {
  url = local_url;
} else {
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
