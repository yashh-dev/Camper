const mongoose = require('mongoose')
const Campground = require('../models/campground')
const cities = require('./cities')
const {places,descriptors} = require('./seedHelpers')

mongoose.connect('mongodb://localhost:27017/camper')

const db = mongoose.connection;
db.on("error",err=> console.error.bind(console,"Connection Error"))
db.once("open",()=>console.log("Database Connected"))

const sample = (array) => array[Math.floor(Math.random()*array.length)]

const seedDb=async()=>{
    await Campground.deleteMany({});
    for (let i = 0; i < 50 ;i++) {
        const rand = Math.floor(Math.random()*1000)+1;
        const camps=new Campground({
            title:`${sample(descriptors)} ${sample(places)}`,
            location:`${cities[rand].city}, ${cities[rand].state}`
        })
        await camps.save()
    }
}


seedDb().then(()=>{
    mongoose.connection.close()
})