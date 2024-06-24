const express = require('express');
const router = express.Router();
const Post = require('../models/post.js');

router.get('/profile', async (req, res) => {
    try {
        const myPosts = await Post.find({
            owner: req.session.user._id,
        }).populate('owner');

        const myFavoritePosts = await Post.find({
            favoritedByUsers: req.session.user._id,
        }).populate('owner');

        console.log('myPosts:', myPosts);
        console.log('myFavoritePosts:', myFavoritePosts);

        res.render('users/show.ejs', {
            myPosts,
            myFavoritePosts,
        });
    } catch (error) {
        console.log(error);
        res.redirect('/');
    }
});

module.exports = router;