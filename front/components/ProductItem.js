import React, {useState, useEffect} from 'react';
import Link from 'next/link';

// Components:
import SimpleCheckbox from './SimpleCheckbox';

// Material Icons:
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';

export default function ProductItem({product, id, onChange, checked, open, ...props}){
    /* const [isSelected, setIsSelected]=useState(checked || false);

    useEffect(()=>{
        setIsSelected(checked);
    }, [checked]); */

    return (
        <>
            <div className={`product-item${checked ? ' selected' : ''}`}>
                <div className={`check centerFlex`}>
                    <SimpleCheckbox
                        checked={checked}
                        onChange={onChange}
                        id={'check-'+product._id}
                    />
                </div>
                <div className={`name inf`}>
                    <span>{product.name}</span>
                </div>
                <div className={`price inf${product.sale_price ? ' active' : product.cost_price ? '' : ' inactive'}`}>
                    {product.sale_price ? product.sale_price : product.cost_price ? product.cost_price : ' inactive'}
                </div>
                <div className={`brand inf${product.brand ? ' active' : ' inactive'}`}>
                    {product.brand ? product.brand : 'none'}
                </div>
                <div className={`category inf`}>
                    {product.category ? product.category : 'none'}
                </div>
                <div className={`stock inf${product.min_stock>product.stock ? ' inactive' : ''}`}>
                    {product.stock}
                </div>
                <div className={`inf buttons bettwenFlex`}>
                    <button className='centerFlex action' onClick={open}>
                        <VisibilityIcon/>
                    </button>
                    <Link href={'/products/edit/'+product._id}>
                        <a className='centerFlex action'>
                            <EditIcon/>
                        </a>
                    </Link>
                </div>
            </div>

            {/*<style jsx>{`@import '../styles/ProductItem';`}</style>*/}
        </>
    );
}