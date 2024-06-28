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
    accommodation: [{
      type: String
    }],
    food: [{
      type: String
    }],
    tip: [{
        type: String
    }],
    // favouritedByUsers: [{
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: 'User',
    // }],
    images: [{
      type: String
    }],
    cloudinary_id: [{
      type: String
    }],
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    favoritedByUsers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
  });

  module.exports = mongoose.model('Post', postSchema);