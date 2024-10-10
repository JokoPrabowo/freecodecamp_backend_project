const mongoose = require("mongoose")
require('dotenv').config()

class Database {
    constructor(){
        this._connect()
    }

    async _connect(){
        await mongoose.connect(process.env.URI)
        .then((data, err) => {
            if(err){
                console.log(err.message);
            }
        })
    }
}

module.exports = new Database()