import TYPES from './customersModuleReducer.types';

const initialState={
    customers:{
        data:null,
        error: null,
        message:null
    },
    customersSearch:{
        data:null,
        error: null,
        message:null
    },
    searchShow:false,
    loading:true,
    selectedCustomer:null,
    requiredPassword:false,
    closeRequiredPassword:false,
    password:{value:'', error:null}
};

export {initialState, TYPES};

export default function customersModuleReducer(state, action){
    switch(action.type){
        case TYPES.ON_LOADING:
            return {...state, loading:true};

        case TYPES.OFF_LOADING:
            return {...state, loading:false};

        case TYPES.OPEN_SEARCH:
            return {...state, searchShow:true};

        case TYPES.CLOSE_SEARCH:
            return {
                ...state,
                searchShow:false,
                customersSearch:initialState.customersSearch,
                loading:false
            };

        case TYPES.CHANGE_SEARCH_DATA:
            return {
                ...state,
                customersSearch:action.payload,
                loading:false
            };

        case TYPES.CHANGE_SELECTED_CUSTOMER:
            return {...state, selectedCustomer:action.payload, requiredPassword:true};

        case TYPES.CHANGE_REQUIRE_PASSWORD:
            return {...state, requiredPassword:action.payload, password:action.payload===false ? initialState.password : state.password};

        case TYPES.CHANGE_PASSWORD:
            return {...state, password:action.payload};

        case TYPES.CLOSE_REQUIRED_PASSWORD:
            return {...state, requiredPassword:!state.requiredPassword, password:initialState.password};

        case TYPES.REMOVE_CUSTOMER:
            let filter=(el)=> el._id!==action.payload,
            search=state.customersSearch.data ? state.customersSearch.data.filter(filter) : null,
            data=state.customers.data ? state.customers.data.filter(filter) : null;

            return {
                ...state,
                selectedCustomer:state.selectedCustomer===action.payload ? null : state.selectedCustomer,
                customersSearch:search===null ? (state.customersSearch) : ({
                    data: search,
                    error:null,
                    message:search.length<1 ? 'Customers not found!' : null
                }),
                customers:data===null ? (state.customers) : ({
                    data: data,
                    error:null,
                    message:data.length<1 ? 'Customers not found!' : null
                }),
                password:initialState.password
            };

        default:
            return state;
    }
}