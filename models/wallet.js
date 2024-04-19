const mongoose = require("mongoose");

// Define the Wallet schema
const walletSchema = new mongoose.Schema({
  address: {
    type: String,
    required: true,
    unique: true,
  },
  privateKey: {
    type: String,
    required: true,
  },
  isSigner: {
    type: Boolean,
    default: true,
  },
  mnemonic: {
    phrase: {
      type: String,
      required: true,
    },
    path: {
      type: String,
      required: true,
    },
    locale: {
      type: String,
      default: "en",
    },
  },
  provider: {
    type: String,
    default: null,
  },
  // Reference to the User who owns this wallet
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Replace 'User' with your actual User model name
    required: true,
  },
});

// Create the Wallet model
const Wallet = mongoose.model("Wallet", walletSchema);

module.exports = Wallet;
