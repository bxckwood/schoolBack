const { Router } = require("express");
const groupRouter = new Router();
const {
  createGroup,
  addGroup,
  acceptGroup,
  checkInvitations,
  declineGroup,
  deleteGroup,
  infoAboutGroup,
  leaveGroup,
  kickGroup,
} = require("../controllers/groupControllers");

groupRouter.post("/create", (req, res) => {
  try {
    createGroup(req, res);
  } catch (e) {
    console.log(e);
  }
});

groupRouter.post("/add", (req, res) => {
  try {
    addGroup(req, res);
  } catch (e) {
    console.log(e);
  }
});

groupRouter.post("/accept", (req, res) => {
  try {
    acceptGroup(req, res);
  } catch (e) {
    console.log(e);
  }
});

groupRouter.post("/invintations", (req, res) => {
  try {
    checkInvitations(req, res);
  } catch (e) {
    console.log(e);
  }
});

groupRouter.post("/decline", (req, res) => {
  try {
    declineGroup(req, res);
  } catch (e) {
    console.log(e);
  }
});

groupRouter.post("/delete", (req, res) => {
  try {
    deleteGroup(req, res);
  } catch (e) {
    console.log(e);
  }
});

groupRouter.post("/info", (req, res) => {
  try {
    infoAboutGroup(req, res);
  } catch (e) {
    console.log(e);
  }
});

groupRouter.post("/leave", (req, res) => {
  try {
    leaveGroup(req, res);
  } catch (e) {
    console.log(e);
  }
});

groupRouter.post("/kick", (req, res) => {
  try {
    kickGroup(req, res);
  } catch (e) {
    console.log(e);
  }
});

module.exports = groupRouter;
