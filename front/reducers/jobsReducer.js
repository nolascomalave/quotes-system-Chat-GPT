import TYPES from './jobsReducer.types';

const initialState={
    jobs:{
        data:null,
        error: null,
        message:null
    },
    jobsSearch:{
        data:null,
        error: null,
        message:null
    },
    searchShow:false,
    loading:true,
    selectedJob:null,
    requiredPassword:false,
    closeRequiredPassword:false,
    password:{value:'', error:null},
    viewJob:null,
    openViewJob:false
};

export {initialState, TYPES};

export default function jobsModuleReducer(state, action){
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
                jobsSearch:initialState.jobsSearch,
                loading:false
            };

        case TYPES.CHANGE_SEARCH_DATA:
            return {
                ...state,
                jobsSearch:action.payload,
                loading:false
            };

        case TYPES.CHANGE_SELECTED_JOB:
            return {...state, selectedJob:action.payload, requiredPassword:true};

        case TYPES.CHANGE_REQUIRE_PASSWORD:
            return {...state, requiredPassword:action.payload, password:action.payload===false ? initialState.password : state.password};

        case TYPES.CHANGE_PASSWORD:
            return {...state, password:action.payload};

        case TYPES.CLOSE_REQUIRED_PASSWORD:
            return {...state, requiredPassword:!state.requiredPassword, password:initialState.password};

        case TYPES.REMOVE_JOB:
            let filter=(el)=> el._id!==action.payload,
            search=state.jobsSearch.data ? state.jobsSearch.data.filter(filter) : null,
            data=state.jobs.data ? state.jobs.data.filter(filter) : null;

            return {
                ...state,
                selectedJob:state.selectedJob===action.payload ? null : state.selectedJob,
                openViewJob:state.selectedJob===action.payload ? !state.openViewJob : state.openViewJob,
                jobsSearch:search===null ? (state.jobsSearch) : ({
                    data: search,
                    error:null,
                    message:search.length<1 ? 'Jobs not found!' : null
                }),
                jobs:data===null ? (state.jobs) : ({
                    data: data,
                    error:null,
                    message:data.length<1 ? 'Jobs not found!' : null
                }),
                password:initialState.password
            };

        case TYPES.CHANGE_VIEW_JOB:
            return {...state, openViewJob:action.payload.value, viewJob:action.payload.job}

        case TYPES.CHANGE_JOB_PHOTO:
            let {photo, id}=action.payload;
            let mapper=(el)=>{
                if(el._id===id) el.photo=photo;
                return el;
            },
            searchJob=state.jobsSearch.data ? state.jobsSearch.data.map(mapper) : null,
            dataJob=state.jobs.data ? state.jobs.data.map(mapper) : null;

            return {
                ...state,
                jobsSearch:searchJob===null ? (state.jobsSearch) : ({
                    data: searchJob,
                    error:null,
                    message:searchJob.length<1 ? 'Jobs not found!' : null
                }),
                jobs:dataJob===null ? (state.jobs) : ({
                    data: dataJob,
                    error:null,
                    message:dataJob.length<1 ? 'Jobs not found!' : null
                })
            };

        default:
            return state;
    }
}