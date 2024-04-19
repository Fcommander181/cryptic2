const {
  createError,
  express,
  path,
  cookieParser,
  logger,
  mongoose,
  auth,
  requiresAuth,
} = require("../packages/require");
const { Schema } = mongoose;

const UserSchema = new Schema({
  sid: { type: String, required: true },
  nickname: { type: String, required: true },
  name: { type: String, required: true },
  picture: { type: String, required: true },
  updated_at: { type: Date, required: true },
  email: { type: String, required: true },
  email_verified: { type: Boolean, required: true },
  sub: { type: String, required: true },
});

const User = mongoose.model("User", UserSchema);

module.exports = User;
