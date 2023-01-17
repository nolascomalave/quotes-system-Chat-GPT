import React from 'react';
import Link from 'next/link';

// Material UI Components:
import Chip from '@mui/material/Chip';

// Material Icons:
import ConstructionIcon from '@mui/icons-material/Construction';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';

export default function JobCard({job, onDelete, open}){
    return (
        <>
            <div className='job-card'>
                <div className='job-card__image'>
                    {!job.photo ? (
                        <div className='job-card__image__alternative centerFlex'>
                            <ConstructionIcon/>
                        </div>
                    ) : (
                        <img
                            className='job-card__image__img'
                            src={`${process.env.API}jobs_photos/${job.photo}`}
                            alt={job.name+" Photo"}
                        />
                    )}
                </div>
                <div className='job-card__principal-content'>
                    <div className='job-card__principal-content__buttons centerFlex'>
                        <button
                            type='button'
                            title='Watch'
                            className='job-card__principal-content__buttons__action centerFlex watch'
                            onClick={open}
                        >
                            <VisibilityIcon/>
                        </button>

                        <Link href={'/jobs/edit/'+job._id} >
                            <a className="job-card__principal-content__buttons__action link centerFlex edit" title="Edit">
                                <EditIcon/>
                            </a>
                        </Link>

                        <button
                            type='button'
                            title='Delete'
                            onClick={onDelete}
                            className='job-card__principal-content__buttons__action centerFlex delete'
                        >
                            <DeleteIcon/>
                        </button>
                    </div>
                    <div className='job-card__principal-content__text'>
                        <div className='title'>
                            <p className="code">{job.code}</p>
                            <h3>{job.name}</h3>
                        </div>

                        <p className="description">
                        </p>
                    </div>
                </div>
                <div className='job-card__inf'>
                    <div className='job-card__inf__chips'>
                        {job.areas.length<1 ? (
                            <p className='not-found'>
                                There are no defined areas!
                            </p>
                        ) : (
                            <>
                                {job.areas.map((area, i)=> {
                                    if(i>5) return null;
                                    return <Chip className="job-card__inf__chips__chip" label={area.name} />
                                })}
                                {job.areas.length>5 && <Chip className="job-card__inf__chips__chip" label='...' />}
                            </>
                        )}
                    </div>
                </div>
            </div>
            {/* <style jsx>{`@import '../styles/JobCard';`}</style> */}
        </>
    )
}