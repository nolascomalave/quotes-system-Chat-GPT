import React, {useState, useEffect, useContext} from 'react';
import Link from 'next/link';
import { AbortController } from 'node-abort-controller';
import { useSnackbar } from 'notistack';

// Material Icons:
import CloseIcon from '@mui/icons-material/Close';

// Contexts:
import globalLoaderContext from '../contexts/globalLoaderContext';

// Utils:
import { isStatus } from '../util/functionals';
import UploadImg from './UploadImg';
import { parseFetchToken } from '../util/functionals';

export default function ProductModal({productId, setOpen, open}){
    const [product, setProduct]=useState(null);
    const [show, setShow]=useState(false);
    const [isOpen, setIsOpen]=useState(open);
    const { enqueueSnackbar }=useSnackbar();
    const {hideGlobalLoader, showGlobalLoader, globalLoader} = useContext(globalLoaderContext);

    const getProduct = async () => {
        showGlobalLoader();

        let data=null, body=new FormData();
        const aborter=new AbortController();
        setTimeout(()=> aborter.abort(), 5000);

        body.append('productId', productId);
        console.log(productId);

        try{
            const res=await fetch(process.env.API+'products/'+productId, parseFetchToken({signal:aborter.signal})),
            thereData=isStatus(res.status, 200, 403, 404, 500);
            if(thereData){
                data=await res.json();

                if(res.status!==200){
                    enqueueSnackbar(data.message, {variant:res.status===403 ? 'warning' : 'error'});
                    setOpen(false);
                }else{
                    setProduct(data);
                    setIsOpen(true);
                }
            }else{
                enqueueSnackbar('Unexpected response when getting product data!', {variant:'error'});
            }
        }catch(e){
            enqueueSnackbar(aborter.signal.aborted ? 'API request timeout has expired!' : 'Failed to establish connection to server!', {variant:'error'});
        }

        hideGlobalLoader();
    };

    useEffect(()=>{
        if(open){
            if(!product || (product && product._id!==productId)){
                if(!globalLoader) getProduct();
                else enqueueSnackbar('Please wait while the current process is finished!');
            }else{
                setIsOpen(true);
            }
        }else{
            setShow(false);
            setTimeout(()=> setIsOpen(false), 500);
        }
    }, [open]);

    useEffect(()=>{
        if(isOpen===true) setShow(true);
    }, [isOpen]);

    const setImgProduct=(photo)=> setProduct(!product ? null : {...product, photo:photo});

    return (
        <>
            <div className={`product-modal view-modal all-screen centerFlex${!isOpen ? ' hide' : ''}${show ? ' show' : ''}`}>
                <div className={`view-modal__container${show ? ' show' : ''}`}>
                    <header className="view-modal__container__header bettwenFlex">
                        <h4>Product</h4>
                        <button
                            type='button'
                            className='centerFlex'
                            title="Close"
                            onClick={()=> setOpen(false)}
                        >
                            <CloseIcon/>
                        </button>
                    </header>
                    <section className='view-modal__container__section'>
                        <div
                            className='centerFlex'
                            style={{marginBottom:'1em'}}
                        >
                            <UploadImg
                                img={product && product.photo}
                                setImg={setImgProduct}
                                url='products/img'
                                id={product && product._id}
                                idName={'productId'}
                                imgName='photo'
                                path={'products_photos'}
                                aspect={1}
                            />
                        </div>
                        <div className='grid-col-2'>
                            <div className="detail box">
                                <p className='detail__title'>Name</p>
                                <p className='detail__text'>{product && product.name}</p>
                            </div>
                            {product && (
                                <div className="detail box">
                                    <p className='detail__title'>{product.brand ? 'Brand' : 'Category'}</p>
                                    <p className='detail__text'>{product.brand ? product.brand : product.category}</p>
                                </div>
                            )}
                        </div>

                        {!product ? null : !product.brand ? null : (
                            <div className='grid-col-2'>
                                <div className="detail box">
                                    <p className='detail__title'>Category</p>
                                    <p className='detail__text'>{product && product.category}</p>
                                </div>
                                <div></div>
                            </div>
                        )}

                        {!product ? null : !product.description ? null : (
                            <div className='grid-col-2'>
                                <div className="detail box">
                                    <p className='detail__title'>Description</p>
                                    <p className='detail__text'>{product.description}</p>
                                </div>
                            </div>
                        )}

                        <div className='grid-col-2'>
                            <div className='box'>
                                <div className="detail more">
                                    <b className='detail__title'>Cost price</b>
                                    <span className='detail__text price'>{product && product.cost_price}</span>
                                </div>
                                <div className="detail more">
                                    <b className='detail__title'>Sale price</b>
                                    <span className='detail__text price'>{product && product.sale_price}</span>
                                </div>
                            </div>
                            <div className='box'>
                                <div className="detail more">
                                    <b className='detail__title'>Stock</b>
                                    <span className='detail__text number'>{product && product.stock}</span>
                                </div>
                                <div className="detail more">
                                    <b className='detail__title'>Min Stock</b>
                                    <span className='detail__text number'>{product && product.min_stock}</span>
                                </div>
                                {!product ? null : !product.max_stock ? null : (
                                    <div className="detail more">
                                        <b className='detail__title'>Max Stock</b>
                                        <span className='detail__text number'>{product.max_stock}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>
                </div>
            </div>

            {/*<style jsx>{`@import '../styles/ProductModal';`}</style>*/}
        </>
    );
}