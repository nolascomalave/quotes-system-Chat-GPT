import {Schema, model} from 'mongoose';

const addedValueTypeSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    abbreviation: String,
    percentage: Number,
    value: Number,
    description: String,

    createdBy:{type: Schema.Types.ObjectId, ref:'User', required: true},
    updatedBy:{type: Schema.Types.ObjectId, ref:'User', required: true}
}, {
    timestamps:true,
    versionKey:false
});

export default model('AddedValueType', addedValueTypeSchema);