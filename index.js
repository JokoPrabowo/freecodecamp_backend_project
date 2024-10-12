const express = require('express')
const dns = require('node:dns')
const cors = require('cors')
const database = require('./config/database')
const { URL } = require('url')
const Url = require('./models/urls')
const User = require('./models/users')
const Exercise = require('./models/exercises')
 
const app = express()
require('dotenv').config()

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

    res.json({
        users: data
    })
})

app.post('/api/users/:id/exercises', async (req, res) => {
    let date = new Date(req.body.date).toUTCString()
    let user = await User.findById(req.params.id)
    
    let data =  await Exercise.create({
        username: user.username,
        description: req.body.description,
        duration: parseInt(req.body.duration),
        date: date.substring(0, 16)
    })

    res.json({
        _id: req.params.id,
        username: user.username,
        description: data.description,
        duration: data.duration,
        date: data.date
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