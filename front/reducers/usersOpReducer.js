// TYPES:
import TYPES from './usersOpReducer.types';

// Const's:
const disableMessage="By disabling the user's session, he will not be able to use the system.";
const enableMessage="By enabling the selected user, he will be able to access the system.";
const deleteMessage="When deleting the selected user, all the user's data will be lost. As well as the records of operations carried out by it.";

const initialState={
    users:{status:0, data:null, error:null, message:null},
    userToModify:null,
    password:{value:'', error:null},
    requirePassword:false,
    closeRequirePassword: false,
    operationMessage:disableMessage,
    operationIsDelete: false
}

export {initialState};

export default function usersOpReducer(state, action){
    switch(action.type){
        case TYPES.ADD_SELECTED_USER:
            return {
                ...state,
                userToModify:action.payload.user,
                requirePassword: true,
                operationIsDelete:action.payload.delete ? true : false,
                operationMessage: action.payload.delete ? deleteMessage : action.payload.user.enable ? disableMessage : enableMessage
            };
        case TYPES.CLEAR_SELECTED_USER:
            return {
                ...state,
                userToModify:null,
                operationIsDelete:false,
                closeRequirePassword: !state.closeRequirePassword
            };

        case TYPES.CHANGE_REQUIRE_PASSWORD:
            return {
                ...state,
                requirePassword:action.payload,
                password: action.payload ? state.password : initialState.password
            };

        case TYPES.CHANGE_PASSWORD:
            return {
                ...state,
                password:action.payload
            };

        case TYPES.CLOSE_REQUIRE_PASSWORD:
            return {
                ...state,
                closeRequirePassword:!state.closeRequirePassword
            };

        case TYPES.CHANGE_USERS_STATE:
            return {...state, users:{...state.users, data:action.payload}};
    }
}