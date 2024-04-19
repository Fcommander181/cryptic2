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
} = require("../packages/require");

const User = require("../models/user");
const Wallet = require("../models/wallet");
const Transaction = require("../models/transaction");
const Withdraw = require("../models/withdraw");
var router = express.Router();

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
    // // console.log(`Transaction hash: ${txResponse.hash}`);
    const txReceipt = await provider.waitForTransaction(txResponse.hash);
    // console.log(`Transaction confirmed in block: ${txReceipt.blockNumber}`);
    return { txResponse, txReceipt };
  } catch (error) {
    console.error(`Error sending Ether: ${error}`);
  }
}

router.get("/", requiresAuth(), async (req, res) => {
  res.render("withdraw", { title: "Cryptic" });
});

router.post("/", requiresAuth(), async (req, res) => {
  try {
    const { amount, method, cardNumber, cvv, expirationDate, cryptoWallet } =
      req.body;
    // console.log("Withdrawal Amount:", amount);

    const userId = req.oidc.user.sub;
    // console.log(userId);

    // Save withdrawal amount and user ID
    const user = await User.findOne({ sub: userId }).exec();
    if (!user) {
      throw new Error("User not found");
    }

    // console.log(user);

    // Find all transactions with the user's ID as destination and status is true
    const transactions = await Transaction.find({
      destinationUserID: user._id.toString(),
      status: true,
    }).exec();

    let totalAmount = 0;
    transactions.forEach((transaction) => {
      totalAmount += transaction.amount;
    });

    // console.log("Total Amount :", totalAmount);

    // Save withdrawal amount in user's wallet
    const wallet = await Wallet.findOne({ user: user._id });
    if (!wallet) {
      throw new Error("Wallet not found");
    }
    // console.log(wallet);
    // console.log(method);
    // console.log(cryptoWallet);

    if (method === "creditCard") {
      // Handle credit card withdrawal
      // Save cardNumber, cvv, and expirationDate
    } else if (method === "cryptoWallet") {
      const { txResponse, txReceipt } = await sendEther(
        wallet.privateKey,
        cryptoWallet,
        amount
      );

      const withdrawData = new Withdraw({
        walletSource: wallet.address,
        walletDestination: cryptoWallet,
        amount: amount,
        transactionHash: txResponse.hash,
        transactionBlock: txReceipt.blockNumber,
      });

      withdrawData.save().then(() => {
        res.render("withdrawSuccess", { title: "cryptic" });
      });
      // Handle crypto wallet withdrawal
      // Save cryptoWallet
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
