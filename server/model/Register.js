const mongoos =  require("mongoose");
/**
 ------ This is the user login model
 */



const userSchema = new mongoos.Schema({
    name:{
        type:String,

    },
    email:{
        type:String,
        required:true,
    },
    password:{
        type:String,
        required:true,
    }
},{timestamps:true});

const USER = mongoos.model('User_Log-in',userSchema);

module.exports= USER;
