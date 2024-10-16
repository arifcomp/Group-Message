const express = require("express");
const router = express.Router();
const USER = require("../model/Register");
const TEXT = require("../model/chat");
/* 
wrote a sign up service where 
--first the body is checked if no body then a bad request
--if the user is already in the database then we dont let  him signup
--/if no a reg user then sign up is done and user Created response is sent
*/

router.post("/signup", async (req, res) => {
  try {
    const body = req.body;
    if (!body) {
      res.json({ status: "Bad Request" });
    }
    //if user is already a signed up user
    const entry = await USER.findOne({ email: body.email });
    if (entry) {
      res.json({ status: "User Already Present" });
    } else {
      //if no a reg user then sign up is created
      const newUser = new USER(req.body);
      newUser.save().then(res.status(201).json({ status: "User Created" }));
    }
  } catch (err) {
    res.status(500).json({ status: "Server Failed" });
  }
});
router.post("/login", async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const entry = await USER.findOne({ email: email });
    if (entry) {
      if (password === entry.password) {
        return res.status(200).json({
          status: "Login Successfully",
          name: entry.name,
          id: entry._id,
        });
      } else {
        res.json({ status: "Wrong Password" });
      }
    } else {
      res.json({ status: "Email Doses Not Exist" });
    }
  } catch (err) {
    return res.status(500).json(err);
  }
});
/** 
 chat user id and text ;
*/

router.post("/chats", async (req, res) => {
  try {
    const body = req.body;
    if (!body) res.status(400).json({ status: "body not given " });

    const newEntry = new TEXT(body);
    newEntry.save();
    res.status(201).json({ status: "sent" });
  } catch (err) {
    res.status(500).json({ status: `${err}` });
  }
});
/*
returns all the text based on the user 
*/

router.get("/chats", async (req, res) => {
  try {
    const response = await TEXT.find({});
    if (!response) res.status(404).json({ status: "user not found" });
    //else part
    res.status(200).json(response);
  } catch (err) {
    res.status(500).json({ status: `${err}` });
  }
});

module.exports = router;
