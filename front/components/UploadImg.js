import React, { useRef, useState, useEffect, useContext } from 'react';
import Cropper from 'react-easy-crop';
import { AbortController } from 'node-abort-controller';
import { useSnackbar } from 'notistack';

// Material UI Components:
import {Slider} from '@mui/material';

// Material Icons:
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import UpgradeIcon from '@mui/icons-material/Upgrade';
import SaveIcon from '@mui/icons-material/Save';

// Contexts:
import globalLoaderContext from '../contexts/globalLoaderContext';
import alertsContext from '../contexts/alertsContext';

// Utils:
import { isStatus } from '../util/functionals';
import getCroppedImg, { generateDownload } from '../util/cropImage';
import { parseFetchToken } from '../util/functionals';

export default function UploadImg({img, setImg, url, id, idName, imgName, path, alternative, aspect}){
    const [image, setImage]=useState(null);
    const [croppedArea, setCroppedArea]=useState(null);
    const [crop, setCrop]=useState({x:0, y:0});
    const [zoom, setZoom]=useState(1);
    const [view, setView]=useState(false);
    const {hideGlobalLoader, showGlobalLoader, globalLoader} = useContext(globalLoaderContext);
    const inputRef=useRef();
    const { enqueueSnackbar }=useSnackbar();
    const {addAlert} = useContext(alertsContext);

    const onCropComplete=(croppedAreaPercentage, croppedAreaPixels)=>{
        setCroppedArea(croppedAreaPixels);
    };

    const onSelectFile=({target}, add)=>{
        if(target.files && target.files.length>0){
            const reader=new FileReader();
            reader.readAsDataURL(target.files[0]);
            reader.addEventListener('load', ()=>{
                setImage(reader.result);
                setView(true);
            });
        }
    };

    const upload = async (blob)=>{
        let aborter=new AbortController(), body=new FormData();
        setTimeout(()=> aborter.abort(), 30000);

        body.append(imgName, blob);
        body.append(idName, id);

        try{
            const res=await fetch(process.env.API+url, parseFetchToken({signal:aborter.signal, method: 'PATCH', body}));
            let {status}=res, acceptedStatus=isStatus(status, 200, 401, 403, 404, 406, 500);

            if(acceptedStatus){
                let data=await res.json(), variant='';
                variant=status===200 ? 'success' : status===401 ? 'warning' : status===403 ? 'warning' : 'error';

                if(status===200){
                    setImg(data.img);
                    handleClose();
                }

                enqueueSnackbar(data.message, {variant});
            }else{
                enqueueSnackbar('Unexpected response!', {variant:'error'});
            }
        }catch(e){
            console.log(e);
            enqueueSnackbar(aborter.signal.aborted ? 'API request timeout has expired!' : 'Failed to establish connection to server!', {variant:'error'});
        }
    };

    const onUpload=async ()=>{
        if(!globalLoader){
            showGlobalLoader();
            const reader=new FileReader(), canvas=await getCroppedImg(image, croppedArea);
            await canvas.toBlob(async (blob)=>{
                await upload(blob);
                /* reader.readAsDataURL(blob);
                reader.addEventListener('load', ()=>{
                    setImage(reader.result);
                }); */
                hideGlobalLoader();
            }, "image/jpeg", 0.66);
        }else{
            enqueueSnackbar('Please wait while the current process is finished!');
        }
    };

    const onDelete = async ()=>{
        if(!globalLoader){
            await addAlert({
                type:'question',
                title: 'Are you sure to delete the selected image?',
                acceptButton:true,
                cancelButton:true,
                onAccept:async ()=>{
                    showGlobalLoader();
                    await upload(null);
                    hideGlobalLoader();
                }
            });
        }else{
            enqueueSnackbar('Please wait while the current process is finished!');
        }
    };

    const handleClose=()=>{
        setImage(null);
        setView(false);
        setZoom(1);
        inputRef.current.value='';
    };

    return (
        <>
            <div className={`upload-img${alternative ? ' alternative' : ''}`}>
                <input
                    type='file'
                    accept="image/*"
                    ref={inputRef}
                    style={{display:'none'}}
                    onChange={onSelectFile}
                />
                <div className='upload-img__img'>
                    {img ? !alternative ? (
                        <button
                            className='photo-button'
                            onClick={()=>setView(true)}
                            title='Watch'
                        >
                            <img
                                className="photo"
                                src={process.env.API+path+'/'+img}
                                alt="Photo"
                            />
                        </button>
                    ) : (
                        <img
                            className="photo"
                            src={process.env.API+path+'/'+img}
                            alt="Photo"
                        />
                    ) : (
                        <button
                            className='chooser-photo centerFlex'
                            title='Choose Photo'
                            onClick={()=> !img && inputRef.current.click()}
                        >
                            <PhotoCameraIcon/>
                        </button>
                    )}
                    {img && (
                        <div className='buttons centerFlex'>
                                <button
                                    type="button"
                                    onClick={()=> inputRef.current.click()}
                                    className='update-button centerFlex'
                                    title='Choose Photo'
                                >
                                    <PhotoCameraIcon/>
                                </button>

                            {alternative && (
                                <button
                                    type="button"
                                    onClick={onDelete}
                                    className='delete-button centerFlex'
                                    title='Delete Photo'
                                >
                                    <DeleteIcon/>
                                </button>
                            )}
                        </div>
                    )}
                </div>
                <div className={`upload-img__screen all-screen${view ? '' : ' hide'}`}>
                    <div className="container">
                        <button
                            type='button'
                            className='close centerFlex'
                            title='Close'
                            onClick={handleClose}
                        >
                            <CloseIcon/>
                        </button>
                        {img && view && !image && (
                            <div className='container__photo'>
                                <img
                                    className="photo"
                                    src={process.env.API+path+'/'+img}
                                    alt="Photo"
                                />
                            </div>
                        )}

                        {image && view && (
                            <>
                                <Cropper
                                    image={image}
                                    crop={crop}
                                    zoom={zoom}
                                    aspect={aspect}
                                    onCropChange={setCrop}
                                    onZoomChange={setZoom}
                                    onCropComplete={onCropComplete}
                                />
                                <Slider
                                    min={1}
                                    max={3}
                                    step={0.1}
                                    value={zoom}
                                    onChange={(e, zoom)=> setZoom(zoom)}
                                    style={{width:'60%', margin:'0 auto'}}
                                    color="secondary"
                                />
                            </>
                        )}

                        <div className='buttons centerFlex'>
                            <button
                                className='action'
                                onClick={()=> inputRef.current.click()}
                                title="Choose"
                            >
                                {!image ? <UpgradeIcon/> : <PhotoCameraIcon/>}
                            </button>
                            {!img ? !image ? null : (
                                <button className='action' onClick={onUpload}>
                                    <SaveIcon/>
                                </button>
                            ) : image ? (
                                <button className='action' onClick={onUpload}>
                                    <SaveIcon/>
                                </button>
                            ) : (
                                <button className='action' onClick={onDelete} title="Delete">
                                    <DeleteIcon/>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* <style jsx>{`@import '../styles/UploadImg';`}</style> */}
        </>
    );
}