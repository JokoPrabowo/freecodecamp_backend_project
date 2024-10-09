const express = require('express')
const cors = require('cors')

const app = express()
require('dotenv').config()

app.use(cors())
app.use(express.json())

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