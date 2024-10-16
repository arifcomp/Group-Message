const mongoose = require("mongoose");

const chat = new mongoose.Schema(
  {
    name: { type: String },
    userid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User_Log-in",
    },
    text: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const TEXT = mongoose.model("TEXT_Message", chat);

module.exports = TEXT;
