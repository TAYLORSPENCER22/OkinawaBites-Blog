const express = require('express');
const cors = require('cors');
//const mongoose = require("mongoose");
const { default: mongoose } = require('mongoose');
const User = require('./models/User');
const Post = require('./models/Post');
const bcrypt = require('bcryptjs');
const app = express();
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const multer = require('multer'); //middleware for handling files 
const uploadMiddleware = multer({ dest: 'uploads/' });
const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config();

const salt = bcrypt.genSaltSync(10);
const secret = process.env.JWT_SECRET;

app.use(cors({credentials:true, origin:'http://localhost:3000'}));
app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(__dirname + '/uploads'));


// check MongoDB connection 
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

//register for an account
app.post('/register', async (req,res) => {
    const{username,password} = req.body;
    try {
        const userDoc = await User.create({
            username,
            password: bcrypt.hashSync(password,salt),
        });
        res.json(userDoc);
    } catch(e) { 
        res.status(400).json(e);
    }
});

//login to account 
app.post('/login', async (req,res) => {
    const {username, password} = req.body;
    const userDoc = await User.findOne({username});
    const passOk = bcrypt.compareSync(password, userDoc.password);
    if (passOk) {
        //logged in
        jwt.sign({username, id:userDoc._id,}, secret, {}, (err, token) => {
            if(err) throw err;
            res.cookie('token', token).json({
                id: userDoc._id,
                username,
            });
        });
    } else {
        res.status(400).json('wrong credentials');
    }
});

//verify json webtoken is valid and login 

app.get('/profile', (req,res) => {
    const {token} = req.cookies;

    //check if token exists before verifying
    if (!token) {
        return res.status(401).json({ error: "No token provided" }); // 401 = Unauthorized
    }

    jwt.verify(token, secret, {}, (err, info) => {
        if (err) {
            return res.status(403).json({ error: "Invalid token" }); // 403 = Forbidden
        }
        res.json(info);
    });
});

//logout endpoing
app.post('/logout', (req, res) => {
    res.clearCookie('token', { sameSite: 'none', secure: true });
    res.json({ message: 'ok' });
});

//create new blog post and rename uploaded file  

app.post('/post', uploadMiddleware.single('file'), async (req,res) => {
    const {originalname, path} = req.file;
    const parts = originalname.split('.');
    const ext =parts[parts.length -1]; 
    const newPath = ( path+ '.' +ext);
    fs.renameSync(path, newPath);

    //verify the token to create the new post 
    const {token} = req.cookies;
    jwt.verify(token, secret, {}, async (err, info) => {
        if (err) {
            return res.status(403).json({ error: "Invalid token" }); // 403 = Forbidden
        }
     //create the post
    const {title, summary, content} = req.body;
    const postDoc = await Post.create({
        title,
        summary,
        content, 
        cover: newPath,
        author: info.id,
    });
        res.json(postDoc);
    });
});

//edit all fields of the blog 
app.put('/post', uploadMiddleware.single('file'), async (req,res) => {
    let newPath = null;
    if (req.file) {
        const {originalname, path} = req.file;   //change this to function so youre not copy/past code
        const parts = originalname.split('.');
        const ext =parts[parts.length -1]; 
        newPath = ( path+ '.' +ext);
        fs.renameSync(path, newPath);
    }

//verify the json webtoken & then update current post
    const {token} = req.cookies;

    jwt.verify(token, secret, {}, async (err, info) => {
        if (err) {
            return res.status(403).json({ error: "Invalid token" }); // 403 = Forbidden
        }
        const {id, title, summary, content} = req.body;
        const postDoc = await Post.findById(id);
        const isAuthor = JSON.stringify(postDoc.author) === JSON.stringify(info.id);
        if (!isAuthor) {
            return res.status(400).json('you are not the author')
        }
        await postDoc.updateOne({
            title, 
            summary, 
            content,
            cover: newPath ? newPath : postDoc.cover,
        });
        res.json(postDoc);
    });
});


//endpoint to load blog posts on home page

app.get('/post', async (req,res) => {
    res.json(
        await Post.find()
        .populate('author', ['username'])
        .sort({createdAt: -1}) //show newest post at the top
        .limit(20) //only 20 max posts on the home page
        );
})

//endpoint to get single post 
app.get('/post/:id', async (req, res) => {
    const {id} = req.params;
    const postDoc = await Post.findById(id).populate('author', ['username']);
    res.json(postDoc);
})


//endpoint to delete a single post 

app.delete('/post/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await Post.findByIdAndDelete(id);
        res.json({success: true, message: 'Post deleted successfully'});
    } catch(error) {
        res.status(500).json({success: false, message: 'Error deleting post', error});
    }
})

app.listen(4000);
