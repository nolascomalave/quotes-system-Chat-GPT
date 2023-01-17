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

export default function JobModal({jobId, setOpen, open, changeImg, onDelete}){
    const [job, setJob]=useState(null);
    const [show, setShow]=useState(false);
    const [isOpen, setIsOpen]=useState(open);
    const { enqueueSnackbar }=useSnackbar();
    const {hideGlobalLoader, showGlobalLoader, globalLoader} = useContext(globalLoaderContext);

    const getJob = async () => {
        showGlobalLoader();

        let data=null, body=new FormData();
        const aborter=new AbortController();
        setTimeout(()=> aborter.abort(), 5000);

        body.append('jobId', jobId);

        try{
            const res=await fetch(process.env.API+'jobs/'+jobId, parseFetchToken({signal:aborter.signal})),
            thereData=isStatus(res.status, 200, 403, 404, 500);
            if(thereData){
                data=await res.json();

                if(res.status!==200){
                    enqueueSnackbar(data.message, {variant:res.status===403 ? 'warning' : 'error'});
                    setOpen(false);
                }else{
                    setJob(data);
                    setIsOpen(true);
                }
            }else{
                enqueueSnackbar('Unexpected response when getting job data!', {variant:'error'});
            }
        }catch(e){
            enqueueSnackbar(aborter.signal.aborted ? 'API request timeout has expired!' : 'Failed to establish connection to server!', {variant:'error'});
        }

        hideGlobalLoader();
    };

    useEffect(()=>{
        if(open){
            if((!job || (job && job._id!==jobId)) && jobId!==null){
                if(!globalLoader) getJob();
                else enqueueSnackbar('Please wait while the current process is finished!');
            }else if(jobId!==null){
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

    const setImgJob=(photo)=>{
        setJob(!job ? null : {...job, photo:photo});
        changeImg(photo, job._id);
    }

    return (
        <>
            <div className={`job-modal area-modal view-modal all-screen centerFlex${!isOpen ? ' hide' : ''}${show ? ' show' : ''}`}>
                <div className={`view-modal__container${show ? ' show' : ''}`}>
                    <header className="view-modal__container__header bettwenFlex">
                        <h4>Job</h4>
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
                        <div className={`view-modal__container__section__cover-page${!job ? '' : !job.photo ? ' border' : ''}`}>
                            <UploadImg
                                img={job && job.photo}
                                setImg={setImgJob}
                                url='jobs/img'
                                id={job && job._id}
                                idName={'jobId'}
                                imgName='photo'
                                path={'jobs_photos'}
                                alternative={true}
                                aspect={4/2.3}
                            />
                        </div>

                        <h2 className='title'>
                            {job && job.name}
                        </h2>

                        <p className='code'>{job && job.code}</p>

                        <div className='action-buttons bettwenFlex'>
                            <Link href={`/jobs/edit/${!job ? '' : job._id}`} >
                                <a className="action link centerFlex edit" title="Edit">
                                    <EditIcon/>
                                </a>
                            </Link>

                            <button
                                type='button'
                                title='Delete'
                                onClick={()=>onDelete(!job ? null : job._id)}
                                className='action centerFlex delete'
                            >
                                <DeleteIcon/>
                            </button>
                        </div>

                        <div className="inf">
                            <b className="title">Description</b>

                            {job ? !job.description ? (
                                <p className='data none'>
                                    {
                                        !job.multi_environment ?
                                        !job.internal_job ?
                                        'This work job is located in external environments. That is, in open environments.' :
                                        'This work job is found in internal environments. That is, environments that belong to internal spaces of houses, buildings or any type of construction.' :
                                        'This work job can belong to internal and external environments.'
                                    }
                                </p>
                            ) : (
                                <p className='data'>{job.description}</p>
                            ) : null}
                        </div>

                        <div className='inf'>
                            <b className='title'>Areas</b>
                            <div style={{marginTop:'.3em'}}>
                                {!job ? null : (
                                    <>
                                        {job.areas.map(area=><Chip className="chip" label={area.name} />)}
                                    </>
                                )}
                            </div>
                        </div>

                        <div className='inf process'>
                            {!job ? null : !job.createdBy ? null : (
                                <div className="processed">
                                    <b>Created:</b>
                                    <p><b>By:</b> {!job ? null : job.createdBy.username}</p>
                                    <p><b>At:</b> {!job ? null : dateStringToLocalDate(job.createdAt)}</p>
                                </div>
                            )}

                            {!job ? null : !job.updatedBy ? null : (
                                <div className="processed">
                                    <div>
                                        <b>Updated:</b>
                                        <p><b>By:</b> {!job ? null : job.updatedBy.username}</p>
                                        <p><b>At:</b> {!job ? null : dateStringToLocalDate(job.updatedAt)}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            </div>

            <style jsx>{`@import '../styles/areaModal';`}</style>
        </>
    );
}