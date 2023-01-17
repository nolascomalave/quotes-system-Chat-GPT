import React, { useRef, useState } from 'react';
import Cropper from 'react-easy-crop';

// Material UI Components:
import {Slider} from '@mui/material';

// Utils:
import getCroppedImg, { generateDownload } from '../util/cropImage';
import { dataURLtoFile } from '../util/dataURLtoFile';

export default function CustomCrop(){
    const [image, setImage]=useState(null);
    const [croppedArea, setCroppedArea]=useState(null);
    const [crop, setCrop]=useState({x:0, y:0});
    const [zoom, setZoom]=useState(1);
    const inputRef=useRef();

    const onCropComplete=(croppedAreaPercentage, croppedAreaPixels)=>{
        setCroppedArea(croppedAreaPixels);
    };

    const onSelectFile=({target})=>{
        if(target.files && target.files.length>0){
            const reader=new FileReader();
            reader.readAsDataURL(target.files[0]);
            reader.addEventListener('load', ()=>{
                setImage(reader.result);
            });
        }
    };

    const onDownload=async ()=>{
        const reader=new FileReader(), canvas=await getCroppedImg(image, croppedArea);
        canvas.toBlob((blob)=>{
            reader.readAsDataURL(blob);
            reader.addEventListener('load', ()=>{
                setImage(reader.result);
            });
        }, "image/jpeg", 0.66);
    };

    return (
        <div className='custom-crop'>
            <div className='custom-crop__crop'>
                {image && (
                    <>
                        <Cropper
                            image={image}
                            crop={crop}
                            zoom={zoom}
                            aspect={1}
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
                        />
                    </>
                )}
            </div>
            <div className='custom-crop__buttons'>
                <input type='file' accept="image/*" ref={inputRef} style={{display:'none'}} onChange={onSelectFile} />
                <button type='button' onClick={()=> inputRef.current.click()}>Choose</button>
                <button type='button' onClick={onDownload}>Download</button>
            </div>
        </div>
    );
};