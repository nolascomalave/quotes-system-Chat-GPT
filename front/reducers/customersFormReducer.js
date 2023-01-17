import TYPES from './customersFormReducer.types.js';

const form={
    legal: false,
    name:'',
    first_name:'',
    second_name:'',
    first_lastname:'',
    second_lastname:'',
    gender:'male',
    ssn:'',
    email:'',
    first_phone:'',
    second_phone:'',
    adress:'',
    description:'',
    photo:[]
};

let initialState={
    values:form,
    errors:null,
    photoCleaner:false
};

/* for(let i of Object.keys(form)){
    initialState.errors[i]=null;
} */

export {initialState, TYPES};

export default function customersFormReducer(state, action){
    switch(action.type){
        case TYPES.CHANGE_VALUES:
            let errors=state.errors;
            if(errors && (action.payload.name in errors)) delete errors[action.payload.name];
            return {
                ...state,
                values:{
                    ...state.values,
                    [action.payload.name]:action.payload.value
                },
                errors
            };

        case TYPES.CHANGE_PHOTO:
            return {...state, values:{...state.values, photo:action.payload}};

        case TYPES.CHANGE_ERRORS:
            return {...state, errors:action.payload};

        case TYPES.RESET_FORM:
            return {...state, errors:null, values:initialState.values, photoCleaner:!state.photoCleaner};

        case TYPES.SET_FORM:
            return {...state, values:action.payload};

        default:
            return state;
    }
}