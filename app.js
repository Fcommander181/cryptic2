const {
  createError,
  express,
  path,
  cookieParser,
  logger,
  mongoose,
  auth,
  requiresAuth,
  bodyParser,
} = require("./packages/require");
require("dotenv").config();

// auth0
const config = {
  authRequired: false,
  auth0Logout: true,
  secret: process.env.SECRET,
  baseURL: process.env.BASE_URL,
  clientID: process.env.CLIENT_ID,
  issuerBaseURL: process.env.ISSUER_BASE_URL,
};

var dashboard = require("./routes/dashboard");
var profile = require("./routes/profile");
var transaction = require("./routes/transaction");
var apihHandler = require("./routes/apiHandler");
var development = require("./routes/development");
var withdraw = require("./routes/withdraw");

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(auth(config));

app.use("/", dashboard);
app.use("/profile", profile);
app.use("/transactions", transaction);
app.use("/confirm-payment", apihHandler);
app.use("/develeper", development);
app.use("/withdraw", withdraw);

// development

mongoose
  .connect("mongodb://localhost:27017/cryptic")
  .then(() => {
    app.listen(3000, () => {
      console.log("listening on port 3000");
    });
  })
  .catch((err) => {
    console.log("could not connect to db errot" + err);
  });

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// module.exports = app;
