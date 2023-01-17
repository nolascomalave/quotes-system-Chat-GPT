import { useReducer, useContext } from 'react';
import {AbortController} from 'node-abort-controller';
//import fetch from 'node-fetch';
import { useSnackbar } from 'notistack';

// Layout:
import Layout from '../../components/sections/Layout';

// Components:
import MainContainer from '../../components/sections/MainContainer';
import ItemForm from "../../components/ItemForm.js";
import Input from '../../components/floatLabel/Input';
import Textarea from '../../components/floatLabel/Textarea';
import CheckBocx from '../../components/CheckBox';
import UploadFile from '../../components/UploadFile';

// Material Icons:
import SendIcon from '@mui/icons-material/Send';
import ImageIcon from '@mui/icons-material/Image';

// Contexts:
import globalLoaderContext from '../../contexts/globalLoaderContext';

// Reducers:
import productsFormReducer, {initialState, TYPES} from '../../reducers/productsFormReducer';

// Utils:
import {
    validatePrice,
    validateCuantity,
    validateSimpleText
} from '../../util/validators';
import { asignError, isStatus } from '../../util/functionals';
import { moneyFormat, quantityFormat } from '../../util/format';
import { serverPropsVerifySession } from '../../util/serverGetters';
import { parseFetchToken } from '../../util/functionals';

export default function Add(){
    const [state, dispatch] = useReducer(productsFormReducer, initialState);
    const {hideGlobalLoader, showGlobalLoader, globalLoader} = useContext(globalLoaderContext);
    const { enqueueSnackbar }=useSnackbar();

    const validator=()=>{
        let errors=asignError(errors, 'name', validateSimpleText(state.values.name, 'name', 2, 50, true));
        errors=asignError(errors, 'category', validateSimpleText(state.values.category, 'category', 3, 15, true));
        errors=asignError(errors, 'brand', validateSimpleText(state.values.brand, 'brand of the product', 2, 20));
        errors=asignError(errors, 'cost_price', validatePrice(state.values.cost_price, 'cost price', '0,01'));
        errors=asignError(errors, 'sale_price', validatePrice(state.values.sale_price, 'sale price', state.values.cost_price, true));
        errors=asignError(errors, 'min_stock', validateCuantity({num:state.values.min_stock, name:'minimum stock', int:true, required:true}));

        if(typeof state.values.set_maximum!=='boolean'){
            errors={...errors, set_maximum:'The value of "set_maximum" must be defined in boolean format!'};
        }else{
            errors=asignError(errors, 'max_stock', validateCuantity({
                num:state.values.set_maximum ? state.values.max_stock : null,
                name:'maximum stock',
                min:state.values.stock,
                int:true,
                required:state.values.set_maximum
            }));
            errors=asignError(errors, 'stock', validateCuantity({num:state.values.stock, name:'stock', min:state.values.min_stock, max:state.values.max_stock, int:true, required:true}));
        }

        errors=asignError(errors, 'description', validateSimpleText(state.values.description, 'description', 5, 150));

        if(state.values.photo.length>1){
            if(!errors) errors={};
            errors.photo=[];
            for(let i=0; i<state.values.photo.length; i++) errors.photo.push(i===0 ? null : 'Only 1 files allowed!');
        }

        dispatch({type:TYPES.CHANGE_ERRORS, payload:errors});
        return errors;
    };

    const handleSubmit=async (e)=>{
        e.preventDefault();

        if(!validator() && !globalLoader){
            const body=new FormData();
            let aborter=new AbortController(), data=null;
            setTimeout(()=>aborter.abort(), 30000);

            showGlobalLoader();

            for(let i in state.values){
                if(i==='photo'){
                    body.append('photo', state.values.photo.length>0 ? state.values.photo[0] : null);
                }else if(i!=='set_maximum' && i!=='max_stock'){
                    body.append(i, state.values[i]);
                }else if(i==='max_stock'){
                    body.append('max_stock', state.values.set_maximum ? state.values.max_stock : null);
                }
            }

            try{
                const res=await fetch(process.env.API+'products', parseFetchToken({
                    signal:aborter.signal,
                    method: 'POST',
                    body
                }));
                let thereMessage=isStatus(res.status, 201, 403, 404, 406, 500), variant='default', message=null;

                if(thereMessage){
                    let response=await res.json();
                    if(res.status!==406){
                        message=response.message;
                        variant=res.status===201 ? 'success' : res.status===403 ? 'warning' : 'error';
                        enqueueSnackbar(message, {variant});

                        if(res.status===201) dispatch({type:TYPES.RESET_FORM});
                    }else{
                        let errors=response.errors;
                        dispatch({
                            type:TYPES.CHANGE_ERRORS,
                            payload:errors.photo ? {...errors, photo:[errors.photo]} : errors
                        });
                    }
                }else{
                    enqueueSnackbar('Unexpected response!', {variant:'error'});
                }
            }catch(e){
                enqueueSnackbar(aborter.signal.aborted ? 'API request timeout has expired!' : 'Failed to establish connection to server!', {variant: 'error'});
            }

            hideGlobalLoader();
        }else if(globalLoader){
            enqueueSnackbar('Please wait while the current process is finished!');
        }
    }

    const handleChange=(e, format)=>{
        let {name, value, files, checked, type}=e.target;
        dispatch({
            type:TYPES.CHANGE_VALUES,
            payload:{
                name:e.target.name,
                value:type==='file' ? files : type==='checkbox' ? checked : value,
                format
            }
        });
    }

    return (
        <Layout>
            <MainContainer id="ProductAdd" className="form-section">
                <ItemForm
                    title='New Product'
                    onSubmit={handleSubmit}
                >
                    <div className={`grid-col-2`}>
                        <Input
                            error={state.errors && state.errors.name && state.errors.name}
                            onChange={handleChange}
                            name="name"
                            value={state.values.name}
                            label="Name"
                            required={true}
                        />
                    </div>

                    <div className={`grid-col-2`}>
                        <Input
                            error={state.errors && state.errors.brand && state.errors.brand}
                            onChange={handleChange}
                            name="brand"
                            value={state.values.brand}
                            label="Brand"
                        />
                        <Input
                            error={state.errors && state.errors.category && state.errors.category}
                            onChange={handleChange}
                            name="category"
                            value={state.values.category}
                            label="Category"
                            required={true}
                        />
                    </div>

                    <div className={`grid-col-2`}>
                        <Input
                            error={state.errors && state.errors.cost_price && state.errors.cost_price}
                            onChange={(e)=>handleChange(e, moneyFormat)}
                            name="cost_price"
                            value={state.values.cost_price}
                            label="Cost Price"
                            required={true}
                            className="right"
                        />
                        <Input
                            error={state.errors && state.errors.sale_price && state.errors.sale_price}
                            onChange={(e)=>handleChange(e, moneyFormat)}
                            name="sale_price"
                            value={state.values.sale_price}
                            label="Sale Price"
                            required={true}
                            className="right"
                        />
                    </div>

                    <div className={`grid-col-2`}>
                        <Input
                            error={state.errors && state.errors.stock && state.errors.stock}
                            onChange={(e)=> handleChange(e, quantityFormat)}
                            name="stock"
                            value={state.values.stock}
                            type="number"
                            min="0"
                            label="Stock"
                            required={true}
                            className="right"
                        />
                        <Input
                            error={state.errors && state.errors.min_stock && state.errors.min_stock}
                            onChange={(e)=> handleChange(e, quantityFormat)}
                            name="min_stock"
                            value={state.values.min_stock}
                            type="number"
                            min="0"
                            label="Minimum Stock"
                            required={true}
                            className="right"
                        />
                    </div>
                    
                    <CheckBocx
                        checked={state.values.set_maximum}
                        name='set_maximum'
                        value='on'
                        onChange={handleChange}
                        label='Set maximum'
                        required={true}
                        error={state.errors && state.errors.set_maximum && state.errors.set_maximum}
                    />

                    <div className={`grid-col-2${!state.values.set_maximum ? ' hide' : ''}`}>
                        <Input
                            error={state.errors && state.errors.max_stock && state.errors.max_stock}
                            onChange={(e)=> handleChange(e, quantityFormat)}
                            name="max_stock"
                            value={state.values.max_stock}
                            type="number"
                            min="0"
                            label="Maximum Stock"
                            required={state.values.set_maximum && state.values.set_maximum}
                            className="right"
                        />
                        <div></div>
                    </div>

                    <Textarea
                        error={state.errors && state.errors.description && state.errors.description}
                        onChange={handleChange}
                        name="description"
                        value={state.values.description}
                        label="Description"
                        rows="4"
                    >
                    </Textarea>

                    <UploadFile
                        setFiles={(state)=> dispatch({type:TYPES.CHANGE_PHOTO, payload:state})}
                        value={state.values.photo}
                        label="Upload Image"
                        onChange={handleChange}
                        name='photo'
                        errors={state.errors && state.errors.photo && state.errors.photo}
                        cleaner={state.photoCleaner}
                        maxFiles={1}
                        icon={ImageIcon}
                        id='photo'
                    />

                    <button className="submit-form-button" type='submit'>
                        <SendIcon/> Submit
                    </button>
                </ItemForm>
            </MainContainer>
        </Layout>
    );
}

export const getServerSideProps=serverPropsVerifySession();