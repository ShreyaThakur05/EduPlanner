const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password_hash: {
    type: String,
    required: true
  },
  first_name: {
    type: String,
    required: true
  },
  last_name: {
    type: String,
    required: true
  },
  phone: String,
  profile_image: String
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);