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

var router = express.Router();

async function displayTransactions(walletAddress) {
  try {
    const provider = new ethers.providers.InfuraProvider(
      "sepolia",
      "659c7f2cc3a3425eb04797b0ff4c8be9"
    );

    const etherscanApiKey = "5D3CNM384Z41VN9EC2C11DMPCCN4R67R5W"; // replace with your Etherscan API key

    try {
      const response = await axios.get(
        `https://api-sepolia.etherscan.io/api?module=account&action=txlist&address=${walletAddress}&startblock=0&endblock=99999999&sort=asc&apikey=${etherscanApiKey}`
      );
      return response.data.result;
    } catch (error) {
      console.error(`Error fetching transaction history: ${error}`);
    }
  } catch (error) {
    console.error("Error fetching transaction history:", error.message);
  }
}

// Usage

/* GET home page. */
router.get("/", requiresAuth(), async (req, res) => {
  const userDb = await User.findOne({ email: req.oidc.user.email });
  const userWallet = await Wallet.findOne({ user: userDb._id });
  const history = await displayTransactions(userWallet.address);
  res.render("transaction", {
    title: "cryptic",
    user: req.oidc.user,
    transactions: history,
  });
});

module.exports = router;
