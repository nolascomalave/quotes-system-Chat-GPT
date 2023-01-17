import {Schema, model} from 'mongoose';

const coinSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },

    abbreviation: String,
    description: String,

    createdBy:{type: Schema.Types.ObjectId, ref:'User', required: true},
    updatedBy:{type: Schema.Types.ObjectId, ref:'User', required: true}
}, {
    timestamps:true,
    versionKey:false
});

export default model('Coin', coinSchema);