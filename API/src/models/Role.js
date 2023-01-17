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

export default model('Role', roleSchema);