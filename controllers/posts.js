const express = require('express');
const router = express.Router();
const cloudinary = require('../middleware/cloudinary');
const upload = require('../middleware/multer');

const Post = require('../models/post');

// ROUTES GO HERE

// INDEX
router.get('/', async (req, res) => {
    try {
        const searchQuery = req.query.search;
        let posts;
        if (searchQuery) {
            // Create a case-insensitive regex for the search query
            const regex = new RegExp(searchQuery, 'i');
            // Find posts where the city or country matches the search query
            posts = await Post.find({
                $or: [{ city: regex }, { country: regex }]}).populate('owner');
        } else {
            // If there's no search query, find all posts
            posts = await Post.find({}).populate('owner');
        }
        res.render('posts/index.ejs', {
            posts: posts
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

// SHOW
router.get('/:id', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id).populate('owner');

        const alreadyFavorited = post.favoritedByUsers.some((userId) => userId.equals(req.session.user._id));
        
        res.render('posts/show.ejs', {
            post: post,
            alreadyFavorited: alreadyFavorited
        });
    } catch (error) {
        console.log(error);
        res.redirect('/posts');
    }
});

//upload.array('image', 6) this instead for multiple images

// CREATE - This will create new posts in the embedded destination array on the user model
router.post('/', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            throw new Error("Image file is required");
        }
        const imageResult = await cloudinary.uploader.upload(req.file.path);

        req.body.owner = req.session.user._id;
        req.body.images = imageResult.secure_url;
        req.body.cloudinary_id = imageResult.public_id;

        await Post.create(req.body);
        res.redirect('/posts');
    } catch (error) {
        console.log(error);
        res.redirect('/posts/new');
    }
});

// EDIT
router.get('/:id/edit', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        res.render('posts/edit.ejs', {
            post: post
        });
    } catch (error) {
        console.log(error);
        res.redirect('/posts');
    }
});

// UPDATE
router.put('/:id', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (post.owner.equals(req.session.user._id)) {
            await post.updateOne(req.body);
        }
        res.redirect('/posts/' + post._id);
    } catch (error) {
        console.log(error);
        res.redirect('/posts');
    }
});

// DELETE
router.delete('/:id', async (req, res,) => {
    try {
        const post = await Post.findById(req.params.id);
        if (post.owner.equals(req.session.user._id)) {
            await post.deleteOne();
        }
    } catch (error) {
        console.log(error);
        res.redirect('/');
    }
    res.redirect('/posts');
});


// FAVOURITES
router.post('/:id/favorite', async (req, res) => {
    try {
        await Post.findByIdAndUpdate(req.params.id, {
            $push: { favoritedByUsers: req.session.user._id }
        })
    } catch (error) {
        console.log(error);
    }
    res.redirect('/posts/' + req.params.id);
});

// DELETE FAVOURITES
router.delete('/:id/favorites', async (req, res) => {
    try {
        await Post.findByIdAndUpdate(req.params.id, {
            $pull: { favoritedByUsers: req.session.user._id }
        });
    } catch (error) {
        console.log(error)
    }
    res.redirect('/posts/' + req.params.id);
})


router.post('/:id/images', upload.array('image', 6), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            throw new Error("At least one image file is required");
        }
        const post = await Post.findById(req.params.id);
        const imagesUrls = [];
        const cloudinaryIds = [];

        for (const file of req.files) {
            const imageResult = await cloudinary.uploader.upload(file.path);
            imagesUrls.push(imageResult.secure_url);
            cloudinaryIds.push(imageResult.public_id);
        }

        if (post) {
            await Post.findByIdAndUpdate(req.params.id, {
                $push: {
                    images: { $each: imagesUrls },
                    cloudinary_id: { $each: cloudinaryIds }
                }
            });
        }
    } catch(error) {
        console.log(error);
    }
    res.redirect('/posts/' + req.params.id);
})

module.exports = router;