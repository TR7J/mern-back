/* IMPORTS */
const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv').config()
const auth = require('./routes/auth')
const mongoose = require('mongoose')
const Post = require('./models/postModel')
const User = require('./models/userModel')
const cookieParser = require('cookie-parser')
const multer = require('multer')
const uploadMiddleware = multer({ dest: 'uploads/' });
const fs = require('fs')
const jwt = require('jsonwebtoken')


/* Initialize express */
const app = express()

/* Connecting to mongodb database */
mongoose.connect(process.env.MONGODB_URL)
.then(() => console.log('Connected to database'))
.catch((err) => console.log('Not Connected to database', err))

/* MIDDLEWARE FOR PARSING JSON DATA */
app.use(express.json())

/* MIDDLEWARE FOR COOKIE-PARSER */
app.use(cookieParser())

app.use('/uploads', express.static(__dirname + '/uploads'));

/* MIDDLEWARE FOR PARSING FORM DATA */
app.use(express.urlencoded({extended: false}))


/* CORS MIDDLEWARE */ 
app.use(
    cors({
        credentials: true,
        /* origin: 'http://localhost:3000' */
        /* origin: 'https://course-finder-app-2.onrender.com' */
        origin: 'https://mern-front-1lvr.onrender.com'
    })
)

/* MIDDLEWARE FOR ROUTES*/
app.use('/', auth)

app.post('/post', uploadMiddleware.single('file'), async(req, res) => {
    try {
        const { originalname, path } = req.file
        const parts = originalname.split('.')
        const ext = parts[parts.length - 1]
        const newPath = path + '.' + ext
        fs.renameSync(path, newPath)

        const {token} = req.cookies;
        jwt.verify(token, process.env.JWT_SECRET, {}, async (err,info) => {
            if (err) throw err;
            const { title, summary, category, description } = req.body
            const post = await Post.create({
                title,
                summary,
                image: newPath,
                category,
                description,
                creator: info.id,
            }) 
            res.json(post)
        });


    } catch (error) {
        console .error(error)
        res.status(500).json({ message: 'Internal server error' })
    }

});

app.put('/post', uploadMiddleware.single('file'), async(req, res) => {
    try {
        let newPath = null;
        if (req.file) {
            const {originalname,path} = req.file;
            const parts = originalname.split('.');
            const ext = parts[parts.length - 1];
            newPath = path+'.'+ext;
            fs.renameSync(path, newPath);
        }

        const {token} = req.cookies;
        jwt.verify(token, process.env.JWT_SECRET, {}, async (err,info) => {
            if (err) throw err;
            const {id,title,summary,category,description} = req.body;
            const post = await Post.findById(id);
            const user = await User.findById(info.id)
            const isAdmin = user.role === 'admin';
            const isCreator = JSON.stringify(post.creator) === JSON.stringify(info.id);
            if (!(isCreator || isAdmin)) {
                return res.status(400).json('you are not allowed to edit this blog');
            }
            await Post.updateOne({_id: id} , {
                title,
                summary,
                category,
                image: newPath ? newPath : post.cover,
                description,
            });
            res.json(post);
        });

    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Internal server error' })
    }

});

app.delete('/post/:id', async(req, res) => {
  try {
    const {id} = req.params
    const {token} = req.cookies;
    jwt.verify(token, process.env.JWT_SECRET, {}, async (err,info) => {
        if (err) throw err;
        const post = await Post.findById(id);
        const user = await User.findById(info.id)
        const isAdmin = user.role === 'admin';
        const isCreator = JSON.stringify(post.creator) === JSON.stringify(info.id); 
        if (!(isCreator || isAdmin)) {
            return res.status(400).json('you are not allowed to delete this blog');
        }
        await Post.deleteOne({_id: id});
        res.json({message: 'post deleted successfully'});
    });

} catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Internal server error' })
}

})



app.get('/post', async (req, res) => {
    try {
        const posts = await Post.find()
            .populate('creator', ['username']) 
/*             .sort({createdAt: -1})
            .limit(20);  */

        res.json(posts);
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


app.get('/post/:id', async (req, res) => {
    const {id} = req.params;
    const postBlog = await Post.findById(id).populate('creator', ['username']);
    res.json(postBlog);
})
  
app.post('/post/:testimonyId', async (req, res) => {
    const testimonyId = req.params.testimonyId;
    const token = req.headers.authorization.split(' ')[1]; 
  
    try {
      // Verify the token and get the user's ID
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.id;
  
      // Find the testimony by ID
      const post = await Post.findById(testimonyId);
  
      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }
  
      // Check if the user already liked this post
      const alreadyLiked = post.likes.includes(userId);
  
      if (alreadyLiked) {
        // User already liked, so unlike it
        post.likes.pull(userId); // Remove user from likes array
        post.likeCount = Math.max(0, post.likeCount - 1); // Decrement like count and ensure it's not less than 0
      } else {
        // User hasn't liked, so like it
        post.likes.push(userId); // Add user to likes array
        post.likeCount += 1; // Increment like count
      }
  
      await post.save();
      res.status(200).json({ likeCount: post.likeCount }); // Return updated like count
  
    } catch (error) {
      console.error('Error while liking post:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.post('/post/:postId/comment', async (req, res) => {
    const postId = req.params.postId;
    const commentText = req.body.commentText;
     // Assuming you have a middleware to authenticate users
    const token = req.headers.authorization.split(' ')[1]; // Assuming Bearer token format
  
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
  
      const newComment = {
        text: commentText,
        creator: userId
      };
  
      post.comments.push(newComment);
      await post.save();
  
      res.status(201).json({ message: 'Comment added successfully' });
    } catch (error) {
      console.error('Error adding comment:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  app.get('/post/:postId/comments', async (req, res) => {
    const postId = req.params.postId;
  
    try {
      const post = await Post.findById(postId).populate('comments.creator');
      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }
  
      const comments = post.comments;
  
      res.status(200).json(comments);
    } catch (error) {
      console.error('Error fetching comments:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

/* CREATING A PORT */
app.listen(4000, ()=>{
    console.log("Server is listening on port 4000")
})