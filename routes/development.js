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

var router = express.Router();

router.get("/", requiresAuth(), async (req, res) => {
  res.render("development", {
    title: "cryptic",
    user: req.oidc.user,
  });
});

module.exports = router;
