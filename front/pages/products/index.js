import {useReducer, useState, useRef, useEffect} from 'react';
import { AbortController } from 'node-abort-controller';
import Link from 'next/link';
import { useSnackbar } from 'notistack';

// Utils:
import { getServerData, serverPropsVerifySession } from '../../util/serverGetters';
import { isStatus } from '../../util/functionals';
import { parseFetchToken } from '../../util/functionals';

// Layout:
import Layout from '../../components/sections/Layout';

// Components:
import MainContainer from '../../components/sections/MainContainer';
import MessageSection from '../../components/sections/MessageSection';
import RequirePasswordAlert from '../../components/RequirePasswordAlert';
import Input from '../../components/floatLabel/Input';
import Loader from '../../components/Loader';
import ProductItem from '../../components/ProductItem';
import SimpleCheckbox from '../../components/SimpleCheckbox';
import ProductModal from '../../components/ProductModal';

// Material Icons:
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';

// Reducers:
import productsReducer, {TYPES, initialState} from '../../reducers/productsReducer';

const Products=({productsData})=>{
    const [state, dispatch]=useReducer(productsReducer, {
        ...initialState,
        products:{
            ...productsData,
            data:productsData.data ? productsData.data.map(el => {
                return {...el, selected:false}
            }) : null
        }
    });
    const [search, setSearch]=useState('');
    const [aborter, setAborter]=useState(new AbortController());
    const [searchInterval, setSearchInterval] = useState();
    const inputSearch=useRef();
    const inputPassword=useRef();
    const { enqueueSnackbar }=useSnackbar();

    const handleSearch=async (aborter)=>{
        setTimeout(()=> aborter.abort(), 5000);
        dispatch({type:TYPES.ON_LOADING});
        let data=initialState.productsSearch;

        try{
            let res=await fetch(`${process.env.API+'products'}${search ? '?search='+search : ''}`, parseFetchToken({signal:aborter.signal}));
            let {status}=res, acceptedStatus=isStatus(status, 200, 400, 403, 404, 406, 500);
            if(acceptedStatus){
                let response=await res.json();

                data=status===200 ? ({
                    ...data,
                    data:response,
                    message:response.length<1 ? 'Products not found!' : null
                }) : ({
                    ...data,
                    message:status===500 ? null : response.message,
                    error:status!==500 ? status!==404 ? status===406 ? response.errors.search : null : response.message : response.message,
                });
            }else{
                data={...data, message:'Unexpected response!', error:'Unexpected response!'};
            }
        }catch(e){
            console.log(e);
            data={...data, error:aborter.signal.aborted ? 'API request timeout has expired!' : 'Failed to establish connection to server!'};
        }
        dispatch({type:TYPES.CHANGE_SEARCH_DATA, payload:data});
    }

    useEffect(()=>{
        if(typeof searchInterval === 'number') setSearchInterval(clearInterval(searchInterval));
        dispatch({type:TYPES.CHANGE_SEARCH_DATA, payload:initialState.productsSearch});

        if(search.trim().length>0){
            if(aborter.signal.aborted==true) setAborter(new AbortController());
            setSearchInterval(setTimeout(async ()=> await handleSearch(aborter), 750));
        }
    }, [search]);

    useEffect(()=>{
        if(state.countSelected.length<1 && state.requiredPassword===true) dispatch({type:TYPES.CLOSE_REQUIRED_PASSWORD});
    }, [state.countSelected]);

    const handleDelete=async ()=>{
        if(!state.password.value===false && state.countSelected.length>0){
            let data=null, more=state.countSelected.length>1 ? '/multiple' : '', body=new FormData();
            const fetchAborter=new AbortController();
            setTimeout(()=> fetchAborter.abort(), 5000);

            body.append('userPass', state.password.value);

            state.countSelected.forEach((el)=> body.append(more.length>0 ? 'products' : 'productId', el));

            try{
                const res=await fetch(process.env.API+'products'+more, parseFetchToken({
                    signal:fetchAborter.signal,
                    method:'DELETE',
                    body
                }));
                let {status}=res, acceptedStatus=isStatus(status, 200, 401, 403, 404, 406, 500);

                if(acceptedStatus){
                    let response=await res.json(), variant=null, message=null;

                    variant=status===200 ? 'success' : status===401 ? 'warning' : status===403 ? 'warning' : 'error';

                    if(status===406){
                        message=response.errors ?
                        Object.keys(response.errors).length>0 ?
                        response.errors.userPass ?
                        response.errors.userPass :
                        response.errors[Object.keys(response.errors)[0]] :
                        response.errors.products ?
                        response.errors.products :
                        response.message:
                        response.message;
                    }else{
                        message=response.message;
                    }

                    dispatch({type:TYPES.CLOSE_REQUIRED_PASSWORD});

                    if(status==200){
                        let deleted=state.countSelected.length>1 ? response.deleted : state.countSelected;
                        dispatch({type:TYPES.REMOVE_PRODUCTS, payload:{deleted, search}});
                    }
                    enqueueSnackbar(message, {variant});
                }else{
                    enqueueSnackbar('Unexpected response!', {variant:'error'});
                    dispatch({type:TYPES.CLOSE_REQUIRED_PASSWORD});
                }
            }catch(e){
                dispatch({type:TYPES.CLOSE_REQUIRED_PASSWORD});
                enqueueSnackbar(fetchAborter.signal.aborted ? 'API request timeout has expired!' : 'Failed to establish connection to server!', {variant:'error'});
            }
        }else{
            if(!state.password.value) dispatch({type:TYPES.CHANGE_PASSWORD, payload:{value:state.password.value, error:'The password is required!'}});
            if(!state.state.countSelected.length<1){
                dispatch({type:TYPES.CLOSE_REQUIRED_PASSWORD});
                enqueueSnackbar('There are no selected products!', {variant:'error'});
            }
        }
    };

    const setRequiredPassword=(stateRequiredPassword)=>{
        dispatch({type:TYPES.CHANGE_REQUIRE_PASSWORD, payload:stateRequiredPassword});
    }

    //const set

    return (
        <Layout>
            <MainContainer id="Products" className="products-page">
                <header className={`main-header bettwenFlex ghost-border-bottom${state.searchShow ? ' open-search' : ''}`}>
                    <h2>
                        {search.length>0 ? 'Search Result:' : 'All Poducts'}
                    </h2>

                    <div className="search-input startFlex">
                        {!state.searchShow ? (
                            <button
                                className='startFlex'
                                onClick={()=> {
                                    dispatch({type:TYPES.OPEN_SEARCH});
                                    inputSearch.current.focus();
                                }}
                            >
                                <SearchIcon/>
                            </button>
                        ) : (
                            <button
                                className='startFlex'
                                onClick={()=>{
                                    dispatch({type:TYPES.CLOSE_SEARCH});
                                    setSearch('');
                                }}
                            >
                                <CloseIcon/>
                            </button>
                        )}
                        <input
                            type='text'
                            ref={inputSearch}
                            value={search}
                            placeholder="Search..."
                            onChange={(e)=> setSearch(e.target.value)}
                            onBlur={()=> search.length<1 ? dispatch({type:TYPES.CLOSE_SEARCH}) : null}
                        />
                    </div>
                </header>
                <section className="products-page__section">
                    <div className="products-list">
                        <div className="options">
                            {state.countSelected.length>0 ? (
                                <button
                                    className="option-button delete"
                                    onClick={()=> dispatch({type:TYPES.CHANGE_REQUIRE_PASSWORD, payload:true})}
                                >
                                    <DeleteIcon/>
                                    Delete
                                </button>
                            ) : (
                                <div className="option-button">
                                    <DeleteIcon/>
                                    Delete
                                </div>
                            )}
                            <Link href="/products/add">
                                <a className="link option-button new">
                                    <AddIcon/>
                                    <span>New</span>
                                </a>
                            </Link>
                        </div>

                        <div className={`wrapper`}>
                            <header className={`products-list__header`}>
                                <div className='check'>
                                    <SimpleCheckbox
                                        checked={state.selectAllProducts}
                                        onChange={(e)=> dispatch({type:TYPES.CHANGE_SELECT_ALL, payload:search})}
                                    />
                                </div>
                                <div className={`inf`}>
                                    Name
                                </div>
                                <div className={`inf price`}>
                                    Price
                                </div>
                                <div className={`inf`}>
                                    Brand
                                </div>
                                <div className={`inf`}>
                                    Category
                                </div>
                                <div className={`inf stock`}>
                                    Stock
                                </div>
                                <div className={`inf`}>
                                </div>
                            </header>
                            <div className={`products-list__section${!state.products.data ? ' hide' : search.length<1 ? '' : ' hide'}`}>
                                {state.products.data && state.products.data.map(product=> (
                                    <ProductItem
                                        key={product._id}
                                        checked={product.selected}
                                        product={product}
                                        onChange={(e)=> dispatch({
                                            type:TYPES.CHANGE_SELECT_ITEM,
                                            payload:{checked:e.target.checked, id:product._id, search},
                                        })}
                                        open={(val)=> dispatch({type:TYPES.CHANGE_VIEW_PRODUCT, payload:{value:val, product:product._id}})}
                                    />))}
                            </div>
                            <div className={`products-list__section${!state.productsSearch.data ? ' hide' : search.length>0 ? '' : ' hide'}`}>
                                {state.productsSearch.data && state.productsSearch.data.map(product=> (
                                    <ProductItem
                                        key={product._id}
                                        checked={product.selected}
                                        product={product}
                                        onChange={(e)=> dispatch({
                                            type:TYPES.CHANGE_SELECT_ITEM,
                                            payload:{checked:e.target.checked, id:product._id, search},
                                        })}
                                        open={()=> dispatch({type:TYPES.CHANGE_VIEW_PRODUCT, payload:{value:true, product:product._id}})}
                                    />))}
                            </div>
                        </div>
                    </div>

                    <MessageSection
                        error={search.length<1 ? state.products.error : state.productsSearch.error}
                        message={search.length<1 ? state.products.message : state.productsSearch.message}
                    />

                    <div className={`loader-section${state.loading ? ' show' : ''}`}>
                        <Loader/>
                    </div>
                </section>
            </MainContainer>

            <RequirePasswordAlert
                acceptAction={{action:handleDelete, close:false}}
                open={()=> inputPassword.current.focus()}
                close={state.closeRequiredPassword}
                show={state.requiredPassword}
                setShow={setRequiredPassword}
                title='Are you sure?'
                message={state.countSelected.length<1 ? 'When deleting a product, you should know that its information can only be found in the quotes that have registered it.'
                : 'When deleting several products, you should know that their information can only be found in the quotes that have registered them.'}
            >
                <Input
                    type="password"
                    reference={inputPassword}
                    label="Password"
                    value={state.password.value}
                    error={state.password.error}
                    required={true}
                    onChange={(e)=>dispatch({type:TYPES.CHANGE_PASSWORD, payload:{value:e.target.value, error:null}})}
                />
            </RequirePasswordAlert>

            <ProductModal
                productId={state.viewProduct}
                open={state.openViewProduct}
                setOpen={(val)=> dispatch({type:TYPES.CHANGE_VIEW_PRODUCT, payload:{value:val, product:null}})}
            />
        </Layout>
    );
}/*

Products.getInitialProps=async ()=>{
    const aborter=new AbortController();
    let expired=false, data={data:null, error:null, message:null};
    setTimeout(()=>{
        expired=true;
        aborter.abort();
    }, 5000);

    try{
        const res=await fetch(process.env.API+'products', {signal:aborter.signal});
        let response=null, {status}=res,
        isAccepted=isStatus(status, 200, 403, 404, 500);

        if(isAccepted){
            response = await res.json();

            data=status===200 ? ({
                ...data,
                data:response.length<1 ? null : response,
                message:response.length<1 ? 'Products not found!' : null
            }) : ({
                ...data,
                message:response.message,
                error:response.message
            });
        }else{
            data={...data, message:'Unexpected response!', error:'Unexpected response!'};
        }
    }catch(e){
        console.log(e);
        data={...data, error:expired ? 'API request timeout has expired!' : 'Failed to establish connection to server!'};
    }

    return {productsData:data};
}; */

export default Products;

/* export async function getStaticProps(){
    const aborter=new AbortController();
    let expired=false, data={data:null, error:null, message:null};
    setTimeout(()=>{
        expired=true;
        aborter.abort();
    }, 5000);

    try{
        const res=await fetch(process.env.API+'products', {signal:aborter.signal});
        let response=null, {status}=res,
        isAccepted=isStatus(status, 200, 403, 404, 500);

        if(isAccepted){
            response = await res.json();

            data=status===200 ? ({
                ...data,
                data:response.length<1 ? null : response,
                message:response.length<1 ? 'Products not found!' : null
            }) : ({
                ...data,
                message:response.message,
                error:response.message
            });
        }else{
            data={...data, message:'Unexpected response!', error:'Unexpected response!'};
        }
    }catch(e){
        console.log(e);
        data={...data, error:expired ? 'API request timeout has expired!' : 'Failed to establish connection to server!'};
    }

    return {
        props:{productsData:data}
    };
}; */

export const getServerSideProps=serverPropsVerifySession(async function(ctx){
    let {req, res}=ctx;
    return {
        props:{
            productsData: await getServerData('products', 5000, {req, res})
        }
    }
}, {productsData:'data'});