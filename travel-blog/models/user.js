const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  city: {
    type: String,
    required: true
  },
  country: {
    type: String,
    required: true
  },
  accommodation: {
    type: String
  },
  food: {
    type: String
  },
  favouritedByUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
})

const userSchema = mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  destination: [postSchema]
});

const User = mongoose.model('User', userSchema);

module.exports = User;
