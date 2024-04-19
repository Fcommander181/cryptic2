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

async function createWallet() {
  try {
    // Create a new wallet
    const provider = new ethers.providers.JsonRpcProvider(
      "https://sepolia.infura.io/v3/659c7f2cc3a3425eb04797b0ff4c8be9"
    );
    const wallet = ethers.Wallet.createRandom();

    // Print wallet details
    wallet.connect(provider);

    return wallet;
  } catch (error) {
    console.error("Error creating wallet:", error.message);
    throw error;
  }
}

// async function checkBalance(walletAddress) {
//   try {
//     const provider = new ethers.providers.JsonRpcProvider(
//       "https://sepolia.infura.io/v3/659c7f2cc3a3425eb04797b0ff4c8be9"
//     );
//     const usdtContractAddress = "0xdAC17F958D2ee523a2206206994597C13D831ec7"; // USDT contract address
//     const usdtContract = new ethers.Contract(
//       usdtContractAddress,
//       ["function balanceOf(address) view returns (uint256)"],
//       provider
//     );
//     const balance = await usdtContract.balanceOf(walletAddress);
//     console.log("USDT Balance:", ethers.utils.formatUnits(balance, 6)); // Display balance in USDT (6 decimal places)
//     return ethers.utils.formatUnits(balance, 6);
//   } catch (error) {
//     console.error("Error checking USDT balance:", error.message);
//   }
// }

async function checkBalance(walletAddress) {
  try {
    const provider = new ethers.providers.JsonRpcProvider(
      "https://sepolia.infura.io/v3/659c7f2cc3a3425eb04797b0ff4c8be9"
    );

    // No contract needed for ETH, just use the provider
    const balance = await provider.getBalance(walletAddress);
    console.log("ETH Balance:", ethers.utils.formatEther(balance)); // Display balance in ETH
    return ethers.utils.formatEther(balance);
  } catch (error) {
    console.error("Error checking ETH balance:", error.message);
  }
}

var router = express.Router();

/* GET home page. */
router.get("/", requiresAuth(), async (req, res) => {
  try {
    // save user db
    const userDb = await User.findOne({ email: req.oidc.user.email });
    if (!userDb) {
      const userData = req.oidc.user;
      const user = new User({
        sid: userData.sid,
        nickname: userData.nickname,
        name: userData.name,
        picture: userData.picture,
        updated_at: userData.updated_at,
        email: userData.email,
        email_verified: userData.email_verified,
        sub: userData.sub,
      });
      user
        .save()
        .then(async () => {
          const wallet = await createWallet();

          const walletData = new Wallet({
            address: wallet.address,
            privateKey: wallet.privateKey,
            isSigner: wallet._isSigner,
            mnemonic: {
              phrase: wallet._mnemonic().phrase,
              path: wallet._mnemonic().path,
              locale: wallet._mnemonic().locale,
            },
            provider: wallet.provider,
            user: user._id,
          });

          walletData
            .save()
            .then(async () => {
              const userfDb = await User.findOne({
                email: req.oidc.user.email,
              });
              const WalletUser = await Wallet.findOne({ user: userfDb._id });
              userBalence = await checkBalance(WalletUser.address);
              console.log(userBalence);
              res.render("dashboard", {
                title: "cryptic",
                user: req.oidc.user,
                usrdtBalance: userBalence,
                usrAddress: WalletUser.address,
              });
            })
            .catch((err) => {
              console.log(err);
            });
        })
        .catch("could not save user");
    } else {
      const userfDb = await User.findOne({ email: req.oidc.user.email });
      const WalletUser = await Wallet.findOne({ user: userfDb._id });
      userBalence = await checkBalance(WalletUser.address);
      console.log(userBalence);
      res.render("dashboard", {
        title: "cryptic",
        user: req.oidc.user,
        usrdtBalance: userBalence,
        usrAddress: WalletUser.address,
      });
    }
  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
