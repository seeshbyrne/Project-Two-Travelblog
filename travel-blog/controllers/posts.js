const express = require('express');
const router = express.Router();

const User = require('../models/user.js');

// ROUTES GO HERE

// INDEX
router.get('/', async (req, res) => {
    try {
        const user = await User.findById(req.session.user._id);
        res.render('posts/index.ejs', {
            destination: user.destination
        });
    } catch (error) {
        console.log(error);
        res.redirect('/');
    }
});

// NEW - This will render a pagfe that displays a form to add a new post to the user's travel posts
router.get('/new', (req, res) => {
    res.render('posts/new.ejs');
});

// CREATE - This will create new posts in the embedded destination array on the user model
router.post('/', async (req, res) => {
    try {
        const user = await User.findById(req.session.user._id);
        user.destination.push(req.body);
        await user.save();
        res.redirect(`/users/${ user._id }/posts`);
    } catch (error) {
        console.log(error);
        res.redirect('/');
    }
});

// SHOW
router.get('/:postId', async (req, res) => {
    try {
        const user = await User.findById(req.session.user._id);
        const post = user.destination.id(req.params.id);
        res.render('posts/show.ejs', {
            post: post,
        });
    } catch (error) {
        console.log(error);
        res.redirect('/');
    }
});

// EDIT
router.get('/:postId/edit', async (req, res) => {
    try {
        const user = await User.findById(req.session.user._id);
        const post = user.destination.id(req.params.id);
        res.render('posts/edit.ejs', {
            post: post,
        })
    } catch (error) {
        console.log(error);
        res.redirect('/');
    }
});

// UPDATE
router.put('/:postId', async (req, res) => {
    try {
        const user = await User.findById(req.session.user._id);
        const post = user.destination.id(req.params.id);
        post.set(req.body);
        await user.save();
        res.redirect(`/users/${ req.session.user._id}/posts`);
    } catch (error) {
        console.log(error);
        res.redirect('/');
    }
});

// DELETE
router.delete('/:postId', async (req, res,) => {
    try {
        const user = await User.findById(req.sessions.user._id);
        user.destination.id(req.params.id).deleteOne();
        await user.save();
    } catch (error) {
        console.log(error);
    }
    res.redirect('/');
});

module.exports = router