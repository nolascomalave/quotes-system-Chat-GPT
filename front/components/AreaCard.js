import React from 'react';
import Link from 'next/link';

// Material UI Components:
import Chip from '@mui/material/Chip';

// Material Icons:
import MapsHomeWorkIcon from '@mui/icons-material/MapsHomeWork';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';

export default function AreaCard({area, onDelete, open}){
    return (
        <>
            <div className='area-card'>
                <div className='area-card__image'>
                    {!area.photo ? (
                        <div className='area-card__image__alternative centerFlex'>
                            <MapsHomeWorkIcon/>
                        </div>
                    ) : (
                        <img
                            className='area-card__image__img'
                            src={`${process.env.API}areas_photos/${area.photo}`}
                            alt={area.name+" Photo"}
                        />
                    )}
                </div>
                <div className='area-card__principal-content'>
                    <div className='area-card__principal-content__buttons centerFlex'>
                        <button
                            type='button'
                            title='Watch'
                            className='area-card__principal-content__buttons__action centerFlex watch'
                            onClick={open}
                        >
                            <VisibilityIcon/>
                        </button>

                        <Link href={'/areas/edit/'+area._id} >
                            <a className="area-card__principal-content__buttons__action link centerFlex edit" title="Edit">
                                <EditIcon/>
                            </a>
                        </Link>

                        <button
                            type='button'
                            title='Delete'
                            onClick={onDelete}
                            className='area-card__principal-content__buttons__action centerFlex delete'
                        >
                            <DeleteIcon/>
                        </button>
                    </div>
                    <div className='area-card__principal-content__text'>
                        <div className='title'>
                            <p className="code">{area.code}</p>
                            <h3>{area.name}</h3>
                        </div>

                        <p className="description">
                            {
                                !area.description ?
                                !area.multi_environment ?
                                !area.internal_area ?
                                'This work area is located in external environments. That is, in open environments.' :
                                'This work area is found in internal environments. That is, environments that belong to internal spaces of houses, buildings or any type of construction.' :
                                'This work area can belong to internal and external environments.' :
                                area.description
                            }
                        </p>
                    </div>
                </div>
                <div className='area-card__inf'>
                    <div className='area-card__inf__chips'>
                        {
                            !area.multi_environment ?
                            !area.internal_area ?
                            <Chip className="area-card__inf__chips__chip" label='External' /> :
                            <Chip className="area-card__inf__chips__chip" label='Internal' /> :
                            (
                                <>
                                    <Chip className="area-card__inf__chips__chip" label='External' />
                                    <Chip className="area-card__inf__chips__chip" label='Internal' />
                                </>
                            )
                        }
                    </div>
                </div>
            </div>

            {/* <style jsx>{`@import '../styles/AreaCard';`}</style> */}
        </>
    );
}