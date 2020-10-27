const router = require("express").Router();
const Product = require("../models/product");

const multer = require("multer");
const checkJWT = require("../middleware/check-jwt");
const faker = require("faker");

const MIME_TYPE_MAP = {
  "image/png": "png",
  "image/jpg": "jpg",
  "image/jpeg": "jpg"
};
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const isValid = MIME_TYPE_MAP[file.mimetype];
    let error = new Error("Invalid mime type");
    if (isValid) {
      error = null;
    }
    cb(error, "images");
  },
  filename: (req, file, cb) => {
    const name = file.originalname
      .toLowerCase()
      .split(" ")
      .join("-");
    const ext = MIME_TYPE_MAP[file.mimetype];
    cb(null, name + "-" + Date.now() + "." + ext);
  }
});

router
  .route("/products")
  .get(checkJWT, (req, res, next) => {
    Product.find({ owner: req.decoded.user._id })
      .populate("owner")
      .populate("category")
      .exec((err, products) => {
        if (products) {
          res.json({
            success: true,
            message: "Products",
            products: products
          });
        }
      });
  })
  .post(
    [checkJWT, multer({ storage: storage }).single("product_picture")],
    (req, res, next) => {
      const url = req.protocol + "://" + req.get("host");
      let product = new Product();
      product.owner = req.decoded.user._id;
      product.category = req.body.categoryId;
      product.title = req.body.title;
      product.price = req.body.price;
      product.description = req.body.description;
      product.image = url + "/images/" + req.file.filename;
      product.save();
      res.json({
        success: true,
        message: "Successfully added the product"
      });
    }
  );

//   Justing testing

router.get("/faker/test", (req, res, next) => {
  for (i = 0; i < 20; i++) {
    let product = new Product();
    product.category = "5c8c0feb1814f7218c3d5e18";
    product.owner = "5c8aedff89f754303085d68c";
    product.image = faker.image.cats();
    product.title = faker.commerce.productName();
    product.description = faker.lorem.words();
    product.price = faker.commerce.price();
    product.save();
  }
  res.json({
    message: "Successfully added 20 pictures"
  });
});

module.exports = router;
