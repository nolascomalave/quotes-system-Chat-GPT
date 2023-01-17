import React from 'react';
import Link from 'next/link';
import { useSnackbar } from 'notistack';

// Material UI Components:
import Avatar from '@mui/material/Avatar';

// Material Icons:
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';


export default function CustomerCard({customer, onDelete}){
    const { enqueueSnackbar }=useSnackbar();

    const handleCopy=(e)=>{
        const aux=document.createElement('input');
        aux.setAttribute('value', e.target.innerText);
        aux.classList.add('ghost');
        e.target.appendChild(aux);
        aux.select();
        document.execCommand("copy");
        enqueueSnackbar('Copied to the clipboard!');
        e.target.removeChild(aux);
    };

    return (
        <>
            <div className="customer-card">
                <div className="actions">
                    <Link href={"/customers/edit/"+customer.id}>
                        <a className='action-button link edit'>
                            <EditIcon/>
                        </a>
                    </Link>
                    <Link href={"/customers/profile/"+customer.id}>
                        <a className="link">
                            {customer.photo ? <img src={process.env.API+'/files/customers/photos/'+customer.photo} alt='Customer Photo'/> : (
                                <Avatar>
                                    {!customer.natural ? customer.name.charAt(0) : (customer.first_names.charAt(0) + customer.first_last_name.charAt(0))}
                                </Avatar>
                            )}
                        </a>
                    </Link>
                    <button
                        type='button'
                        className="action-button delete"
                        onClick={onDelete}
                    >
                        <DeleteIcon/>
                    </button>
                </div>
                <div className="name">
                    <h4 className="first-upper truncado">
                        <Link href={"/customers/profile/"+customer.id}>
                            <a className="link">
                                {customer.name ? customer.name : customer.first_name+' '+customer.first_last_name}
                            </a>
                        </Link>
                    </h4>
                    <p>{customer.natural ? 'Natural' : 'Legal'}</p>
                </div>
                <ul>
                    {customer.SSN && (
                        <li>
                            <b>SSN:</b> <span onClick={handleCopy} title={'Copy: '+customer.SSN}>
                                {customer.SSN}
                            </span>
                        </li>
                    )}
                    <li>
                        <b>Email:</b> <span onClick={handleCopy} title={'Copy: '+customer.email}>
                            {customer.email}
                        </span>
                    </li>
                    <li>
                        <b>Phones:</b> <span onClick={handleCopy} title={'Copy: '+customer.phone}>
                            {customer.phone}
                        </span>
                        {customer.phone_secondary && (
                            <> /
                                <br/>
                                <span onClick={handleCopy} title={'Copy: '+customer.phone_secondary}>
                                    {customer.phone_secondary}
                                </span>
                            </>
                        )}
                    </li>
                </ul>
            </div>

            {/*<style jsx>{`@import '../styles/CustomerCard';`}</style>*/}
        </>
    );
};