import TYPES from './productsReducer.types';

const initialState={
    products:{data:null, message:null, error:null},
    productsSearch:{data:null, message:null, error:null},
    searchShow:false,
    loading:false,
    requiredPassword:false,
    closeRequiredPassword:false,
    password:{value:'', error:null},
    selectAllProducts:false,
    countSelected:[],
    viewProduct:null,
    openViewProduct:false
};

export {TYPES, initialState};

export default function productsReducer(state, action){
    switch (action.type){
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
                productsSearch:initialState.productsSearch,
                loading:false
            };

        case TYPES.CHANGE_SEARCH_DATA:
            return {
                ...state,
                loading:false,
                selectAllProducts:false,
                products:{
                    ...state.products,
                    data:!state.products.data ? null :
                    state.products.data.map(el=>{
                        return {...el, selected:false};
                    })
                },
                productsSearch:{
                    ...action.payload,
                    data:!action.payload.data ? null :
                    action.payload.data.map(el=>{
                        return {...el, selected:false};
                    })
                },
                countSelected:[]
            };

        case TYPES.CHANGE_REQUIRE_PASSWORD:
            return {...state, requiredPassword:action.payload, password:action.payload===false ? initialState.password : state.password};

        case TYPES.CHANGE_PASSWORD:
            return {...state, password:action.payload};

        case TYPES.CLOSE_REQUIRED_PASSWORD:
            return {...state, requiredPassword:!state.requiredPassword, password:initialState.password};

        case TYPES.CHANGE_SELECT_ALL:
            let select=!state.selectAllProducts, {countSelected}=state;
            countSelected=!select ? []
            : action.payload.length>0
            ? state.productsSearch.data
            ? state.productsSearch.data.map(el => el._id)
            : []
            : state.products.data
            ? state.products.data.map(el => el._id)
            : [];

            const there=action.payload.length>0
            ? state.productsSearch.data
            ? state.productsSearch.data.length<1
            ? false
            : true
            : false
            : state.products.data
            ? state.products.data.length<1
            ? false
            : true
            : false;

            return {
                ...state,
                selectAllProducts:!there ? false : select,
                products:state.products.data ? {
                    ...state.products,
                    data:!state.products.data ? null :
                    state.products.data.map(el=>{
                        return {
                            ...el,
                            selected: action.payload.length>0 ? false : select
                        };
                    })
                } : state.products,
                productsSearch:state.productsSearch.data ? {
                    ...state.productsSearch,
                    data:!state.productsSearch.data ? null :
                    state.productsSearch.data.map(el=>{
                        return {
                            ...el,
                            selected: action.payload.length>0 ? select : false
                        };
                    })
                } : state.productsSearch,
                countSelected
            };

        case TYPES.CHANGE_SELECT_ITEM:
            let all=true, count=[...state.countSelected];
            const {checked, id, search}=action.payload;

            const selectFunction=(el)=>{
                if(el._id===id){
                    el.selected=checked;
                    let find=count.find((item, i)=>{
                        if(item===id){
                            el.selected=false;
                            count.splice(i,1);
                            return true;
                        }

                        return false;
                    });
                    if(el.selected) count.push(el._id);
                }
                if(all && !el.selected) all=false;
                return el;
            };

            const productsSearch=state.productsSearch.data ? search.length>0 ? {
                ...state.productsSearch,
                data:state.productsSearch.data.map(selectFunction)
            } : state.productsSearch : state.productsSearch;

            const products=!state.products.data ? state.products :
            search.length<1 ? {
                ...state.products,
                data:state.products.data.map(selectFunction)
            } : state.products;

            return {...state, products, productsSearch, selectAllProducts:all, countSelected:count};

        case TYPES.REMOVE_PRODUCTS:
            const {deleted:removed}=action.payload, filter=(el)=> !removed.some((id)=> el._id===id);
            const searchData=state.productsSearch.data ? state.productsSearch.data.filter(filter) : state.productsSearch.data;
            const data=state.products.data ? state.products.data.filter(filter) : state.products.data;

            const counter=state.countSelected.filter((el)=> !removed.some((id)=> el===id));

            return {
                ...state,
                products:{
                    ...state.products,
                    data,
                    message:data ? data.length<1 ? 'Products not found!' : null : state.products.message
                },
                productsSearch:{
                    ...state.productsSearch,
                    data:searchData,
                    message:searchData ? searchData.length<1 ? 'Products not found!' : null : state.productsSearch.message
                },
                countSelected:counter,
                selectAllProducts:false
            };

        case TYPES.CHANGE_VIEW_PRODUCT:
            return {...state, openViewProduct:action.payload.value, viewProduct:action.payload.product}

        default:
            return state;
    }
}