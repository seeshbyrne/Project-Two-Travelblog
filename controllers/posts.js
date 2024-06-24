const express = require('express');
const router = express.Router();
const cloudinary = require('../middleware/cloudinary');
const upload = require('../middleware/multer');

const Post = require('../models/post');

// ROUTES GO HERE

// INDEX
router.get('/', async (req, res) => {
    try {
        const posts = await Post.find({}).populate('owner');
        console.log(posts);

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
router.post('/', async (req, res) => {
    // upload.single('image')
    try {
        // const imageResult = await cloudinary.uploader.upload(req.file.path); //this part is whatever is taken in from the browse selected bit
        //     req.body.images = cloudinary.imageResult.secure_url;
        //     req.body.cloudinary_id = imageResult.public_id;
        
        req.body.owner = req.session.user._id;
        await Post.create(req.body);  
    } catch (error) {
        console.log(error);
    }
    res.redirect('/posts');
});

// EDIT
router.get('/:id/edit', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        res.render('posts/edit.ejs', {
            post: post
        })
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
        await Post.findByIdAndDelete(req.params.id, {
            $pull: { favoritedByUsers: req.session.user._id }
        });
    } catch (error) {
        console.log(error)
    }
    res.redirect('/posts/' + req.params.id);
})

// IMAGE
// router.post('/:id/images', upload.array('image', 6), async (req, res) => {
//     try {
//         const post = await Post.findById(req.params.id);
//         const imagesUrls = [];
//         const cloudinaryIds = [];
        
//         for (const file of req.files) {
//             const imageResult = await cloudinary.uploader.upload(file.path)
//             imagesUrls.push(imageResult.secure_url);
//             cloudinaryIds.push(imageResult.public_id);
//         }

//         if (post) {
//             await Post.findByIdAndUpdate(req.params.id, {
//                 $push: {
//                     images: { $each: imagesUrls },
//                     cloudinary_id: { $each: cloudinaryIds }
//                 }
//             });
//         };

//     } catch (error) {
//         console.log(error);
//     }
//     res.redirect('/posts/' + req.params.id);
// });

module.exports = router;