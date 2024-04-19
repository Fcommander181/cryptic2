const {
  createError,
  express,
  path,
  cookieParser,
  logger,
  mongoose,
  auth,
  requiresAuth,
  ethers,
  axios,
} = require("../packages/require"); // Replace with your authentication middleware
const User = require("../models/user"); // Replace with your user model
const Wallet = require("../models/wallet");
const Transaction = require("../models/transaction");

async function sendEther(YourPrivateKey, RecipientWalletAddress, AmountToSend) {
  const privateKey = YourPrivateKey; // replace with your private key
  const provider = new ethers.providers.InfuraProvider(
    "sepolia",
    "659c7f2cc3a3425eb04797b0ff4c8be9"
  );
  const wallet = new ethers.Wallet(privateKey, provider);

  const recipientAddress = RecipientWalletAddress; // replace with the recipient's wallet address
  const amountToSend = ethers.utils.parseEther(AmountToSend); // replace with the amount of Ether to send

  const gasPriceInWei = await provider.getGasPrice();
  const gasPriceInGwei = ethers.utils.formatUnits(gasPriceInWei, "gwei");
  console.log("Gas price per unit in Gwei:", gasPriceInGwei);

  const gasLimit = 21000; // This is the standard gas limit for a simple Ether transfer
  const gasPrice = await provider.getGasPrice(); // Fetch the current gas price from the network

  const transaction = {
    to: recipientAddress,
    value: amountToSend,
    gasLimit: gasLimit,
    gasPrice: gasPrice,
  };

  try {
    const txResponse = await wallet.sendTransaction(transaction);
    // console.log(`Transaction hash: ${txResponse.hash}`);
    const txReceipt = await provider.waitForTransaction(txResponse.hash);
    // console.log(`Transaction confirmed in block: ${txReceipt.blockNumber}`);
    return { txResponse, txReceipt };
  } catch (error) {
    console.error(`Error sending Ether: ${error}`);
  }
}

var router = express.Router();
router.get("/", requiresAuth(), async (req, res) => {
  try {
    // Retrieve destination and amount from query parameters
    const destination = await User.findOne({
      sub: req.query.destination,
    });
    const source = await User.findOne({ email: req.oidc.user.email });
    const amount = req.query.amount;

    // Render the invoice template with the data
    res.render("invoice", {
      destination: destination,
      source: source,
      amount: amount,
      title: "cryptic",
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

router.post("/", requiresAuth(), async (req, res) => {
  try {
    // Encrypted or securely retrieved

    // Retrieve destination and amount from form data
    const { destinationId, sourceId, amount } = req.body;
    const sourceWallet = await Wallet.findOne({ user: sourceId });
    const destinationWallet = await Wallet.findOne({ user: destinationId });
    const MidWallet = "0xa49799b924Ac1a6581440B0c3fAd8c8be3717ECd";

    // Process the payment transaction using the retrieved data
    // For demonstration purposes, we'll just log the data
    // console.log("Destination ID:", destinationId);
    // console.log("Source ID:", sourceId);
    // console.log("Amount:", amount);

    // Respond to the user with a confirmation message
    const { txResponse, txReceipt } = await sendEther(
      sourceWallet.privateKey,
      destinationWallet.address,
      amount
    );
    const TransactionData = new Transaction({
      sourceUserID: sourceId,
      sourceWalletAddress: sourceWallet.address,
      destinationUserID: destinationId,
      destinationWalletAddress: destinationWallet.address,
      amount: amount,
      transactionHash: txResponse.hash,
      transactionBlock: txReceipt.blockNumber,
      status: false,
    });
    TransactionData.save().then(() => {
      res.render("paymentSuccess", { title: "cryptic" });
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
