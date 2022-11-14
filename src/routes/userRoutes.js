const { Router } = require("express");
const userRouter = new Router();
const { createUser, getAuthToken } = require("../controllers/userControllers");

userRouter.get("/", (req, res) => {
  try {
    res.json(123);
    console.log(123);
  } catch (e) {
    console.log(e);
  }
});

userRouter.post("/create", (req, res) => {
  try {
    createUser(req, res);
  } catch (e) {
    console.log(e);
  }
});

userRouter.post("/auth", (req, res) => {
  try {
    getAuthToken(req, res);
  } catch (e) {
    console.log(e);
  }
});

module.exports = userRouter;
