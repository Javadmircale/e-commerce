const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const validator = require("validator");
const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, "Email must be provided"],
    validate: {
      validator: validator.isEmail,
      message: "Please provide valid email",
    },
    unique: [true, "Email is already taken"],
  },
  name: {
    type: String,
    minLength: 3,
    maxLength: 50,
    required: [true, "Name must be provided"],
  },
  password: {
    type: String,
    required: [true, "Password must be provided"],
  },
  role: {
    type: String,
    enum: ["admin", "user"],
    default: "user",
  },
});
UserSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});
UserSchema.methods.comparePassword = async function (candidatePassword) {
  const isMatch = await bcrypt.compare(candidatePassword, this.password);
  return isMatch;
};
module.exports = mongoose.model("User", UserSchema);
