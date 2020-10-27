const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const config = require("./config");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(cors());
app.use("/images", express.static("images"));
mongoose.connect(config.database, { useNewUrlParser: true }, err => {
  if (err) {
    console.log(err);
  } else {
    console.log("Connected successfully to the database");
  }
});

const userRoutes = require("./routes/account");
const mainRoutes = require("./routes/main");
const sellerRoutes = require("./routes/seller");
const productSearchRoutes = require("./routes/product-search");

app.use("/api", mainRoutes);
app.use("/api/accounts", userRoutes);
app.use("/api/seller", sellerRoutes);
app.use("/api/search", productSearchRoutes);

app.listen(config.port, err => {
  console.log("Magic happens on port " + config.port);
});
