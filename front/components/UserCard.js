import React, {/* useContext, */ useState, useEffect} from 'react';
import Link from 'next/link';
import { AbortController } from 'node-abort-controller';

// Components:
import Input from './floatLabel/Input';

// Material UI Components:
import Avatar from '@mui/material/Avatar';

// Material Icons:
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

// Contexts:
//import alertsContext from '../contexts/alertsContext';

// Utils:
import { resaltSearch } from '../util/format';

export default function UserCard({user, search, handleAbailability}){
    //const {addAlert}=useContext(alertsContext);
    let completeName=user.first_name+' '+(user.second_name && user.second_name.charAt(0)+'.')+' '+user.first_last_name+' '+(user.second_last_name ? user.second_last_name.charAt(0)+'.' : '');

    return (
        <>
            <div className="UserCard">
                <div className='UserCard__figure'>
                    {!user.photo ? (<Avatar>{user.first_name.charAt(0).toUpperCase() + ' ' + user.first_last_name.charAt(0).toUpperCase()}</Avatar>) : <img alt="Profile photo" src={process.env.API+"files/users/photos/"+user.photo} />}
                </div>
                <div className="UserCard__user-title">
                    <h3>{search ? resaltSearch(search, user.username) : user.username}</h3>
                    <p>{search ? resaltSearch(search, completeName) : completeName}</p>
                </div>
                <div className="UserCard__options">
                    <b>{user.roles[0].role}</b>
                    <div className='buttons'>
                        <Link href={"/users/profile/"+user.username}>
                            <a className="button watch" title="Watch">
                                <OpenInNewIcon/>
                            </a>
                        </Link>
                        {user._enable && (
                            <Link href={"/users/edit/"+user.username}>
                                <a className="button edit" title="Edit">
                                    <EditIcon/>
                                </a>
                            </Link>
                        )}
                        {!user._enable && (
                            <button
                                onClick={()=>handleAbailability(user)}
                                className="button enable" title="Enable"
                            >
                                <VisibilityIcon/>
                            </button>
                        )}
                        {user._enable && (
                            <button
                                onClick={()=>handleAbailability(user)}
                                className="button disable" title="Disable"
                            >
                                <VisibilityOffIcon/>
                            </button>
                        )}
                        {!user._enable && (
                            <button
                                onClick={()=>handleAbailability(user, true)}
                                className="button delete"
                                title="Delete"
                            >
                                <DeleteIcon/>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/*<style jsx>{`@import '../styles/UserCard';`}</style>*/}
        </>
    );
}