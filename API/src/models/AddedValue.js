import {Schema, model} from 'mongoose';

const addedValueSchema = new Schema({
    added_value_type: {type: Schema.Types.ObjectId, ref:'AddedValueType', required: true},
    amount: {
        type: Number,
        required: true
    }
});

export default model('AddedValue', addedValueSchema);