const router = require("express").Router();
const jwt = require("jsonwebtoken");
const User = require("../models/user");
var token = require("jsonwebtoken");
const config = require("../config");
const checkJWT = require("../middleware/check-jwt");

router.post("/signup", (req, res, next) => {
  let user = new User();
  user.name = req.body.name;
  user.email = req.body.email;
  user.password = req.body.password;
  user.picture = user.gravatar();
  user.isSeller = req.body.isSeller;

  User.findOne({ email: req.body.email }, (error, existingUser) => {
    if (existingUser) {
      res.json({
        sucess: false,
        message: "An account already exists with this email"
      });
    } else {
      user.save();
      var token = jwt.sign({ user: user }, config.secret, { expiresIn: "7d" });

      res.json({
        success: true,
        message: "User created successfully, enjoy your token",
        token: token
      });
    }
  });
});

router.post("/login", (req, res, next) => {
  User.findOne({ email: req.body.email }, (err, user) => {
    if (err) throw err;
    if (!user) {
      res.json({
        sucess: false,
        message: "Authentication failed, User not found"
      });
    } else if (user) {
      var validPassword = user.comparePassword(req.body.password);
      if (!validPassword) {
        res.json({
          sucess: false,
          message: "Authentication failed, wrong password"
        });
      } else {
        var token = jwt.sign(
          {
            user: user
          },
          config.secret,
          { expiresIn: "7d" }
        );
        res.json({
          success: true,
          message: " logged in successfull, Enjoy your token",
          token: token
        });
      }
    }
  });
});

//instead of separate get and post we can chain the routes like below
// old would be router.get('/profile') etc.

router
  .route("/profile")
  .get(checkJWT, (req, res, next) => {
    User.findOne({ _id: req.decoded.user._id }, (err, user) => {
      res.json({
        success: true,
        user: user,
        message: "Successful"
      });
    });
  })
  .post(checkJWT, (req, res, next) => {
    User.findOne({ _id: req.decoded.user._id }, (err, user) => {
      if (err) return next(err);
      if (req.body.name) user.name = req.body.name;
      if (req.body.email) user.email = req.body.email;
      if (req.body.password) user.password = req.body.password;

      user.isSeller = req.body.isSeller;
      user.save();
      res.json({
        success: true,
        message: "Successfully edited your profile",
        user: user
      });
    });
  });

router
  .route("/address")
  .get(checkJWT, (req, res, next) => {
    User.findOne({ _id: req.decoded.user._id }, (err, user) => {
      res.json({
        success: true,
        address: user.address,
        message: "Successful"
      });
    });
  })
  .post(checkJWT, (req, res, next) => {
    User.findOne({ _id: req.decoded.user._id }, (err, user) => {
      if (err) return next(err);
      if (req.body.addr1) user.address.addr1 = req.body.addr1;
      if (req.body.addr2) user.address.addr2 = req.body.addr2;
      if (req.body.city) user.address.city = req.body.city;
      if (req.body.state) user.address.state = req.body.state;
      if (req.body.country) user.address.country = req.body.country;
      if (req.body.postalCode) user.address.postalCode = req.body.postalCode;
      user.save();
      res.json({
        success: true,
        message: "Successfully edited the address",
        address: user.address
      });
    });
  });

module.exports = router;
