import TYPES from './areasReducer.types';

const initialState={
    areas:{
        data:null,
        error: null,
        message:null
    },
    areasSearch:{
        data:null,
        error: null,
        message:null
    },
    searchShow:false,
    loading:true,
    selectedArea:null,
    requiredPassword:false,
    closeRequiredPassword:false,
    password:{value:'', error:null},
    viewArea:null,
    openViewArea:false
};

export {initialState, TYPES};

export default function areasModuleReducer(state, action){
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
                areasSearch:initialState.areasSearch,
                loading:false
            };

        case TYPES.CHANGE_SEARCH_DATA:
            return {
                ...state,
                areasSearch:action.payload,
                loading:false
            };

        case TYPES.CHANGE_SELECTED_AREA:
            return {...state, selectedArea:action.payload, requiredPassword:true};

        case TYPES.CHANGE_REQUIRE_PASSWORD:
            return {...state, requiredPassword:action.payload, password:action.payload===false ? initialState.password : state.password};

        case TYPES.CHANGE_PASSWORD:
            return {...state, password:action.payload};

        case TYPES.CLOSE_REQUIRED_PASSWORD:
            return {...state, requiredPassword:!state.requiredPassword, password:initialState.password};

        case TYPES.REMOVE_AREA:
            let filter=(el)=> el._id!==action.payload,
            search=state.areasSearch.data ? state.areasSearch.data.filter(filter) : null,
            data=state.areas.data ? state.areas.data.filter(filter) : null;

            console.log(state.selectedArea===action.payload, state.selectedArea, action.payload);

            return {
                ...state,
                selectedArea:state.selectedArea===action.payload ? null : state.selectedArea,
                openViewArea:state.selectedArea===action.payload ? !state.openViewArea : state.openViewArea,
                areasSearch:search===null ? (state.areasSearch) : ({
                    data: search,
                    error:null,
                    message:search.length<1 ? 'Jobs not found!' : null
                }),
                areas:data===null ? (state.areas) : ({
                    data: data,
                    error:null,
                    message:data.length<1 ? 'Jobs not found!' : null
                }),
                password:initialState.password
            };

        case TYPES.CHANGE_VIEW_AREA:
            return {...state, openViewArea:action.payload.value, viewArea:action.payload.area}

        case TYPES.CHANGE_AREA_PHOTO:
            let {photo, id}=action.payload;
            let mapper=(el)=>{
                if(el._id===id) el.photo=photo;
                return el;
            },
            searchArea=state.areasSearch.data ? state.areasSearch.data.map(mapper) : null,
            dataArea=state.areas.data ? state.areas.data.map(mapper) : null;

            return {
                ...state,
                areasSearch:searchArea===null ? (state.areasSearch) : ({
                    data: searchArea,
                    error:null,
                    message:searchArea.length<1 ? 'Jobs not found!' : null
                }),
                areas:dataArea===null ? (state.areas) : ({
                    data: dataArea,
                    error:null,
                    message:dataArea.length<1 ? 'Jobs not found!' : null
                })
            };

        default:
            return state;
    }
}