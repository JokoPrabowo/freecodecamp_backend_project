const express = require('express')
const multer = require('multer')
const path = require('path')
const dns = require('node:dns')
const cors = require('cors')
const database = require('./config/database')
const { URL } = require('url')
const Url = require('./models/urls')
const User = require('./models/users')
const Exercise = require('./models/exercises')
 
const app = express()
require('dotenv').config()

const upload = multer({ dest: '/uploads' })

app.use(cors())
app.use(express.json())
app.use(express.urlencoded())

app.use(express.static('public'));

app.get('/', (req,res) => {
    res.sendFile(__dirname + '/views/index.html')
})

app.get("/api", (req,res) => {
    const date = new Date()
    res.json({
        unix: date.getTime(),
        utc: date.toUTCString()
    })
})

app.get('/api/whoami', (req, res) => {
    res.json({
        ipaddress: req.connection.remoteAddress,
        language: req.headers['accept-language'],
        software: req.headers['user-agent']
    })
    
})

app.get('/api/shorturl/:url',async (req, res) => {
    let url = req.params.url
    let data =await Url.findOne({
        short_url: url
    })
    res.redirect(data.original_url)
})

app.get('/api/users', async (req, res) => {
    let data = await User.find()
    res.json(data)
})

app.get('/api/users/:id/logs', async (req, res) => {
    let user = await User.findById(req.params.id)
    let exercise
    let data = []
    if(req.query.from == null){
        exercise = await Exercise.find({
            username: user.username,
        }).limit(req.query.limit)
    }else{
        var from = new Date(req.query.from).toDateString()
        if(req.query.to != null){
            exercise = await Exercise.find({
                username: user.username,
                date: {$gte: new Date(req.query.from), $lte: new Date(req.query.to)}
            }).limit(req.query.limit)
            var to = new Date(req.query.to).toDateString()
        }else{
            exercise = await Exercise.find({
                username: user.username,
                date: {$gte: new Date(req.query.from)}
            }).limit(req.query.limit)
        }
    }
    exercise.forEach(n => {
        let obj = {}
        obj.description = n.description,
        obj.duration = n.duration,
        obj.date = n.date.toDateString()
        data.push(obj)
    })
    res.json({
        _id: user._id,
        username: user.username,
        from,
        to,
        count: exercise.length,
        log: data
    })
})

app.post('/api/fileanalyse', upload.single('upfile'), (req, res) => {
    const { originalname, mimetype, size } = req.file
    res.json({
        name: originalname,
        type: mimetype,
        size,
    })
})

app.post('/api/users/:id/exercises', async (req, res) => {
    let user = await User.findById(req.params.id)
    let date
    if(req.body.date == null){
        date = new Date()
    }else {
        date = new Date(req.body.date)
    }

    let data =  await Exercise.create({
        username: user.username,
        description: req.body.description,
        duration: parseInt(req.body.duration),
        date: date
    })
    date = data.date.toDateString()

    res.json({
        _id: req.params.id,
        username: user.username,
        description: data.description,
        duration: data.duration,
        date: date
    })
})

app.post('/api/users', async (req, res) => {
    let data = await User.create({
        username: req.body.username
    })

    res.json({
        username: data.username,
        _id: data._id
    })
})

app.post('/api/shorturl', (req, res, next) => {
    let url = new URL(req.body.url)
    dns.lookup(url.hostname, (err, address, family) => {
        if(err){
            req.url = null
            next()
        }        
        req.url = url
        next()
    })
}, async (req, res) => {
    let url = req.url
    if(url == null){
        res.json({
            error: 'invalid url'
        })
    }else{
        let data
        data = await Url.findOne({
            original_url: url
        })
        if(!data){
            data = await Url.create({
                original_url: url,
                short_url: Math.floor(Math.random() * 100000).toString()
            })
        }
        res.json({
            original_url: data.original_url,
            short_url: data.short_url
        })
    }
})

app.get("/api/:date", (req, res) =>{
    let input = req.params.date;
    let date;

    if(new Date(input) == "Invalid Date"){

        if(isNaN(parseInt(input))){
            date = new Date(input)
        }else{
            date = new Date(parseInt(input));
        }

    }else{
        date = new Date(input);
    }

    if(date.toUTCString() == "Invalid Date"){
        res.json({
            error: "Invalid Date"
        })
    }else{
        res.json({
            unix: date.getTime(),
            utc: date.toUTCString()
        })
    }

})

app.listen(process.env.PORT, () =>{
    console.log(`Server running on http://localhost:${process.env.PORT}`);
})