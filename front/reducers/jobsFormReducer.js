import TYPES from './jobsFormReducer.types.js';

let initialState={
    values:{
        name:'',
        description:'',
        photo:[],
        allAreas:false
    },
    errors:null,
    photoCleaner:false
};

export {initialState, TYPES};

export default function jobsFormReducer(state, action){
    switch(action.type){
        case TYPES.CHANGE_VALUES:
            let errors=state.errors;
            if(errors && (action.payload.name in errors)) delete errors[action.payload.name];
            return {
                ...state,
                values:{
                    ...state.values,
                    [action.payload.name]:!action.payload.format ? action.payload.value : action.payload.format(action.payload.value)
                },
                errors
            };

        case TYPES.CHANGE_PHOTO:
            return {...state, values:{...state.values, photo:action.payload}};

        case TYPES.CHANGE_ERRORS:
            return {...state, errors:action.payload};

        case TYPES.RESET_FORM:
            return {...state, errors:null, values:{
                ...initialState.values
            }, photoCleaner:!state.photoCleaner};

        case TYPES.SET_FORM:
            return {...state, values:action.payload};

        default:
            return state;
    }
}