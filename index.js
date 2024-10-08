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

app.listen(process.env.PORT, () =>{
    console.log(`Server running on http://localhost:${process.env.PORT}`);
})