const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const withdrawSchema = new Schema({
  walletSource: {
    type: String,
    required: true,
  },
  walletDestination: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  transactionHash: {
    type: String,
    required: true,
  },
  transactionBlock: {
    type: Number,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
    required: true,
  },
});

const Withdraw = mongoose.model("Withdraw", withdrawSchema);

module.exports = Withdraw;
