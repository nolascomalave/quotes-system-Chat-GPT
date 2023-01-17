const {Schema, model, models}=require('mongoose');

const roleSchema=new Schema({
    role:{
        type: String,
        unique: true,
        required:true
    }
},{
    timestamps:true,
    versionKey:false
});

module.exports=models.Role || model('Role', roleSchema);