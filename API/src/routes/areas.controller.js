import Area from '../models/Area';
import {join} from 'path';

import {
    validateId,
    validateName,
    validateImg,
    validateSimpleText
} from '../util/validators';
import {asignError, deleteUploadFiles, renameFile, deleteFile, modelCode} from '../util/functionals';
import {extractExt, regexSearch, firstCharName, sanitizeString, ssre, convertToBoolean} from '../util/formats';

class AreaController {
    constructor({
        name, multi_environment, internal_area, description, photo,
        areaId, areaIdRequired, moderatorUser
    }){
        this.name=name;
        this.multi_environment=convertToBoolean(multi_environment);
        this.areaId=areaId;
        this.areaIdRequired=areaIdRequired;
        this.internal_area=convertToBoolean(internal_area);
        this.description=description;
        this.photo=photo;

        this.moderatorUser=moderatorUser;

        this.errors=null;
    }

    async validate(){
        let errors;
        if(this.areaIdRequired){
            errors=asignError(errors, 'areaId', validateId(this.areaId, 'area', true));
        }

        errors=asignError(errors, 'name', validateName(this.name, 'name', true));
        errors=asignError(errors, 'description', validateSimpleText(this.description, 'description', 5, 500));

        if(typeof this.multi_environment!=='boolean') errors=asignError(errors, 'multi_environment', 'The area type need confirmation must be defined in boolean format!');
        if(typeof this.internal_area!=='boolean') errors=asignError(errors, 'internal_area', 'The internal area must be defined in boolean format!');

        errors=asignError(errors, 'photo', await validateImg(this.photo, {
            maxSize:100000,
            typeLong:'width',
            minWidth:250,
            maxWidth:4000,
            minPercent: 50,
            maxPercent: 75
        }));

        if((!errors || ((errors && !('areaId' in errors))) && (errors && !('name' in errors)))){
            let query={name:eval('/^'+ssre(this.name.trim())+'$/i')};

            if(this.areaIdRequired) query={$and:[query, {_id:{$ne: this.areaId}}]};

            try{
                if(await Area.findOne(query)) errors=asignError(errors, 'name', 'The name entered is already registered!');
            }catch(e){
                let areaId='An error occurred while querying the database!';
                errors=!errors ? {areaId} : {...errors, areaId};
            }
        }

        this.errors=errors;
    }

    async completed(){
        //await this.validate();

        if(this.errors) return null;

        let area={
            name: firstCharName(sanitizeString(this.name.trim())),
            description:sanitizeString(this.description),
            multi_environment:this.multi_environment,
            internal_area:!this.multi_environment ? this.internal_area : null
        }

        if(!this.areaId){
            area.code=await modelCode('WA', Area, 'code');
            area.photo=this.photo ? this.photo.filename+extractExt(this.photo.originalname) : '';
            area.createdBy=this.moderatorUser._id;
            area.updatedBy=null;
        }else{
            area.updatedBy=this.moderatorUser._id;
        }

        return !this.errors ? area : null;
    }
};

export async function getAll(req, res){
    try{
        let areas=await Area.find({}, {
            code:true,
            name:true,
            multi_environment:true,
            internal_area:true,
            description:true,
            photo:true
        }).populate({path:'createdBy', select:'username'}).populate({path:'updatedBy', select:'username'});
        return res.status(200).json(areas);
    }catch(e){
        return res.status(500).json({message: 'An error occurred while querying the database!', error:e});
    }
}

export async function search(req, res){
    let {search} = req.query;
    if(!search) return res.status(406).json({message: 'Values ​​are missing from the request body!', errors:{search:'The "search" value is missing from the request!'}});
    if(typeof search !== 'string' && typeof search !== 'number') return res.status(500).json({message: 'The search must be defined in text or numeric format!'});
    search=search.replace(/ +/g, ' ');
    let onlySearch=regexSearch(search);

    try{
        let result=await Area.find({
            $or:[
                {"code": onlySearch},
                {"name": onlySearch}
            ]
        }, {
            code:true,
            name:true,
            multi_environment:true,
            internal_area:true,
            description:true,
            photo:true
        });
        return res.status(200).json(result);
    }catch(e){
        console.log(e);
        return res.status(500).json({message: 'An error occurred while querying the database!', error:e});
    }
}

export async function getById({params}, res){
    try{
        if(validateId(params.areaId, 'area')!==null) return res.status(404).json({message:'Area not found!'});
        let area=await Area.findById(params.areaId).populate({path:'createdBy', select:'username'}).populate({path:'updatedBy', select:'username'});
        if(!area) return res.status(404).json({message:'Area not found!'});
        return res.status(200).json(area);
    }catch(e){
        if(('path' in e) && e.path==='_id') return res.status(404).json({message:'Area not found!'});
        return res.status(500).json({message: 'An error occurred while querying the database!', error:e});
    }
}

export async function add(req, res){
    let area=new AreaController({...req.body, photo:req.file, moderatorUser:req.user});
    await area.validate();
    let errors=area.errors;
    if(errors){
        deleteUploadFiles(req);
        return res.status(406).json({message:"Errors in the required data!", errors});
    }

    let newArea=await area.completed();
    if(!newArea){
        deleteUploadFiles(req);
        return res.status(500).json({message: 'An error occurred while querying the database!'});
    }
    try{
        newArea=await Area.create(newArea);
    }catch(e){
        console.log(e);
        deleteUploadFiles(req);
        return res.status(500).json({message: 'An error occurred while querying the database!', error:e});
    }

    if(req.file){
        if(renameFile(join(__dirname, '../public/areas_photos/'+newArea.photo),
        req.file.path)) return res.status(201).json({message:'The area record has been created, but an error occurred while storing the photo on the server!'});
    }
    return res.status(201).json({message:'Areas registration completed!'});
}

export async function updateById(req, res){
    let area=new AreaController({...req.body, photo:req.file, moderatorUser:req.user, areaIdRequired:true});
    await area.validate();
    let errors=area.errors;
    if(errors) return res.status(406).json({message:"Errors in the required data!", errors});

    let editArea=await area.completed();
    if(!editArea) return res.status(500).json({message: 'An error occurred while querying the database!'});

    try{
        let foundArea=await Area.findByIdAndUpdate(req.body.areaId, editArea);
        if(!foundArea) return res.status(404).json({message:'Area not found!'});
        return res.status(200).json({message:"Area updated successfully!"});
    }catch(e){
        if(('path' in e) && e.path==='_id') return res.status(404).json({message:'Area not found!'});
        return res.status(500).json({message: 'An error occurred while querying the database!', error:e});
    }
}

export async function deleteById(req, res){
    let errors=asignError(errors, 'areaId', validateId(req.body.areaId, 'area', true));
    if(errors) return res.status(406).json({message:"Errors in the required data!", errors});

    try{
        let deletedArea=await Area.findByIdAndRemove(req.body.areaId, {photo:true});
        if(!deletedArea) return res.status(404).json({message:'Area not found!'});
        if(deletedArea.photo!==null){
            let deletedFile=deleteFile(join(__dirname, '../public/areas_photos/'+deletedArea.photo));
            if(!deletedFile) return res.status(200).json({message:'The area record has been removed, but an error occurred while deleting the area photo!'});
        }
        return res.status(200).json({message:'Area removed successfully!'});
    }catch(e){
        if(('path' in e) && e.path==='_id') return res.status(404).json({message:'Area not found!'});
        return res.status(500).json({message: 'An error occurred while querying the database!', error:e});
    }
}

export async function updateImg(req, res){
    let {file} = req, newFile='';
    if('file' in req){
        if(/\.\w$/.test(file.originalname)===false) file.originalname+=file.mimetype.replace(/^image\//, '.').toLowerCase();

        let errors=asignError(errors, 'photo', await validateImg(file, {
            maxSize:100000,
            typeLong:'width',
            minWidth:250,
            maxWidth:4000,
            minPercent: 50,
            maxPercent: 75
        }));

        if(errors) return res.status(406).json({message:"Errors in the required data!", errors});

        newFile=file.filename+extractExt(file.originalname);
    }else{
        newFile=null;
    }

    try{
        let updatedArea=await Area.findByIdAndUpdate(req.body.areaId, {photo:newFile});
        if(!updatedArea){
            deleteUploadFiles(req);
            return res.status(404).json({message:'Area not found!'});
        }

        if(!updatedArea.photo===false) deleteFile(join(__dirname, '../public/areas_photos/'+updatedArea.photo));

        if(!newFile===false){
            let rename=renameFile(join(__dirname, '../public/areas_photos/'+newFile), file.path);

            if(rename){
                deleteUploadFiles(req);
                return res.status(500).json({message:'An error occurred while storing the photo on the server!'});
            }
        }

        return res.status(200).json({message:!newFile ? 'Image removed successfully!' : 'Image updated successfully!', img:newFile});
    }catch(e){
        if(('path' in e) && e.path==='_id') return res.status(404).json({message:'Area not found!'});
        return res.status(500).json({message: 'An error occurred while querying the database!', error:e});
    }
};