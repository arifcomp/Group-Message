const mongoose =require("mongoose");

const mongodbConnect = async (uri) => {
    await mongoose.connect(uri)
    .then(()=>{console.log('MONGO  DB STARTED')})
    .catch((err)=>console.log('error',err))
}
module.exports ={
    mongodbConnect
}