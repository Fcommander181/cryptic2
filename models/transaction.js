const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema(
  {
    sourceUserID: {
      type: String,
      required: true,
    },
    sourceWalletAddress: {
      type: String,
      required: true,
    },
    destinationUserID: {
      type: String,
      required: true,
    },
    destinationWalletAddress: {
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
    status: {
      type: Boolean,
      required: true,
    },
  },
  { timestamps: true }
);

const Transaction = mongoose.model("Transaction", TransactionSchema);

module.exports = Transaction;
