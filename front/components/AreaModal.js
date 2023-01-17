import React, {useState, useEffect, useContext} from 'react';
import Link from 'next/link';
import { AbortController } from 'node-abort-controller';
import { useSnackbar } from 'notistack';

// Material UI Components:
import Chip from '@mui/material/Chip';

// Material Icons:
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

// Contexts:
import globalLoaderContext from '../contexts/globalLoaderContext';

// Utils:
import { isStatus } from '../util/functionals';
import { dateStringToLocalDate } from '../util/format';
import UploadImg from './UploadImg';
import { parseFetchToken } from '../util/functionals';

export default function AreaModal({areaId, setOpen, open, changeImg, onDelete}){
    const [area, setArea]=useState(null);
    const [show, setShow]=useState(false);
    const [isOpen, setIsOpen]=useState(open);
    const { enqueueSnackbar }=useSnackbar();
    const {hideGlobalLoader, showGlobalLoader, globalLoader} = useContext(globalLoaderContext);

    const getArea = async () => {
        showGlobalLoader();

        let data=null, body=new FormData();
        const aborter=new AbortController();
        setTimeout(()=> aborter.abort(), 60000);

        body.append('areaId', areaId);

        try{
            const res=await fetch(process.env.API+'areas/'+areaId, parseFetchToken({signal:aborter.signal})),
            thereData=isStatus(res.status, 200, 403, 404, 500);
            if(thereData){
                data=await res.json();

                if(res.status!==200){
                    enqueueSnackbar(data.message, {variant:res.status===403 ? 'warning' : 'error'});
                    setOpen(false);
                }else{
                    setArea(data);
                    setIsOpen(true);
                }
            }else{
                enqueueSnackbar('Unexpected response when getting area data!', {variant:'error'});
            }
        }catch(e){
            enqueueSnackbar(aborter.signal.aborted ? 'API request timeout has expired!' : 'Failed to establish connection to server!', {variant:'error'});
        }

        hideGlobalLoader();
    };

    useEffect(()=>{
        if(open){
            if((!area || (area && area._id!==areaId)) && !areaId===false){
                if(!globalLoader) getArea();
                else enqueueSnackbar('Please wait while the current process is finished!');
            }else if(!areaId===false){
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

    const setImgArea=(photo)=>{
        setArea(!area ? null : {...area, photo:photo});
        changeImg(photo, area._id);
    }

    return (
        <>
            <div className={`area-modal view-modal all-screen centerFlex${!isOpen ? ' hide' : ''}${show ? ' show' : ''}`}>
                <div className={`view-modal__container${show ? ' show' : ''}`}>
                    <header className="view-modal__container__header bettwenFlex">
                        <h4>Area</h4>
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
                        <div className={`view-modal__container__section__cover-page${!area ? '' : !area.photo ? ' border' : ''}`}>
                            <UploadImg
                                img={area && area.photo}
                                setImg={setImgArea}
                                url='areas/img'
                                id={area && area._id}
                                idName={'areaId'}
                                imgName='photo'
                                path={'areas_photos'}
                                alternative={true}
                                aspect={4/2.3}
                            />
                        </div>

                        <h2 className='title'>
                            {area && area.name}
                        </h2>

                        <p className='code'>{area && area.code}</p>

                        <div className='action-buttons bettwenFlex'>
                            <Link href={`/areas/edit/${!area ? '' : area._id}`} >
                                <a className="action link centerFlex edit" title="Edit">
                                    <EditIcon/>
                                </a>
                            </Link>

                            <button
                                type='button'
                                title='Delete'
                                onClick={()=>onDelete(!area ? null : area._id)}
                                className='action centerFlex delete'
                            >
                                <DeleteIcon/>
                            </button>
                        </div>

                        <div className="inf">
                            <b className="title">Description</b>

                            {area ? !area.description ? (
                                <p className='data none'>
                                    {
                                        !area.multi_environment ?
                                        !area.internal_area ?
                                        'This work area is located in external environments. That is, in open environments.' :
                                        'This work area is found in internal environments. That is, environments that belong to internal spaces of houses, buildings or any type of construction.' :
                                        'This work area can belong to internal and external environments.'
                                    }
                                </p>
                            ) : (
                                <p className='data'>{area.description}</p>
                            ) : null}
                        </div>

                        <div className='inf'>
                            <b className='title'>Environment Type</b>
                            <div>
                                {!area ? null :
                                    !area.multi_environment ?
                                    !area.internal_area ?
                                    <Chip className="chip" label='External' /> :
                                    <Chip className="chip" label='Internal' /> :
                                    (
                                        <>
                                            <Chip className="chip" label='External' />
                                            <Chip className="chip" label='Internal' />
                                        </>
                                    )
                                }
                            </div>
                        </div>

                        <div className='inf process'>
                            {!area ? null : !area.createdBy ? null : (
                                <div className="processed">
                                    <b>Created:</b>
                                    <p><b>By:</b> {!area ? null : area.createdBy.username}</p>
                                    <p><b>At:</b> {!area ? null : dateStringToLocalDate(area.createdAt)}</p>
                                </div>
                            )}

                            {!area ? null : !area.updatedBy ? null : (
                                <div className="processed">
                                    <div>
                                        <b>Updated:</b>
                                        <p><b>By:</b> {!area ? null : area.updatedBy.username}</p>
                                        <p><b>At:</b> {!area ? null : dateStringToLocalDate(area.updatedAt)}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            </div>

            {/*<style jsx>{`@import '../styles/AreaModal';`}</style>*/}
        </>
    );
}