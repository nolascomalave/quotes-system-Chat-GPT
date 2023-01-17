import Job from '../models/Job';
import Area from '../models/Area';
import {join} from 'path';

import {
    validateId,
    validateName,
    validateImg,
    validateSimpleText,
    validateExistDocument
} from '../util/validators';
import {asignError, deleteUploadFiles, renameFile, deleteFile, modelCode} from '../util/functionals';
import {extractExt, regexSearch, firstCharName, sanitizeString, ssre, convertToBoolean} from '../util/formats';

class JobController {
    constructor({
        name, areas, description, photo,
        jobId, jobIdRequired, moderatorUser
    }){
        this.name=name;
        this.areas=Array.isArray(areas) ? areas : [areas];
        this.jobId=jobId;
        this.jobIdRequired=jobIdRequired;
        this.description=description;
        this.photo=photo;

        this.moderatorUser=moderatorUser;

        this.errors=null;
    }

    async validate(){
        let errors, areasErrors=[];
        if(this.jobIdRequired){
            errors=asignError(errors, 'jobId', validateId(this.jobId, 'job', true));
        }

        errors=asignError(errors, 'name', validateName(this.name, 'name', true));

        let index=0;
        for(let area of this.areas){
            let error=null, count=0;

            for(let i of this.areas){
                if(i===area && count<index){
                    error='This item is duplicated!';
                    break;
                }
                count++;
            }
            if(!error) error=await validateExistDocument(area, Area, 'areas', true);
            areasErrors.push(error);
            index++;
        }

        if(areasErrors.some(el => !el===false)) errors=asignError(errors, 'areas', areasErrors);

        errors=asignError(errors, 'description', validateSimpleText(this.description, 'description', 5, 500));

        errors=asignError(errors, 'photo', await validateImg(this.photo, {
            maxSize:100000,
            typeLong:'width',
            minWidth:250,
            maxWidth:4000,
            minPercent: 50,
            maxPercent: 75
        }));

        if((!errors || ((errors && !('jobId' in errors))) && (errors && !('name' in errors)))){
            let query={name:eval('/^'+ssre(this.name.trim())+'$/i')};

            if(this.jobIdRequired) query={$and:[query, {_id:{$ne: this.jobId}}]};

            try{
                if(await Job.findOne(query)) errors=asignError(errors, 'name', 'The name entered is already registered!');
            }catch(e){
                let jobId='An error occurred while querying the database!';
                errors=!errors ? {jobId} : {...errors, jobId};
            }
        }

        this.errors=errors;
    }

    async completed(){
        //await this.validate();

        if(this.errors) return null;

        let job={
            name: firstCharName(sanitizeString(this.name.trim())),
            description:sanitizeString(this.description),
            areas:this.areas
        }

        if(!this.jobId){
            job.code=await modelCode('J', Job, 'code');
            job.photo=this.photo ? this.photo.filename+extractExt(this.photo.originalname) : '';
            job.createdBy=this.moderatorUser._id;
            job.updatedBy=null;
        }else{
            job.updatedBy=this.moderatorUser._id;
        }

        return !this.errors ? job : null;
    }
};

export async function getAll(req, res){
    try{
        let jobs=await Job.find({}, {
            code:true,
            name:true,
            areas:true,
            description:true,
            photo:true
        }).populate({path:'areas', select:'-_id name'});
        return res.status(200).json(jobs);
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
        let result=await Job.find({
            $or:[
                {"code": onlySearch},
                {"name": onlySearch}
            ]
        }, {
            code:true,
            name:true,
            areas:true,
            description:true,
            photo:true
        }).populate({path:'areas', select:'-_id name'});
        return res.status(200).json(result);
    }catch(e){
        console.log(e);
        return res.status(500).json({message: 'An error occurred while querying the database!', error:e});
    }
}

export async function getById({params}, res){
    try{
        if(validateId(params.jobId, 'job')!==null) return res.status(404).json({message:'Job not found!'});
        let job=await Job.findById(params.jobId).populate({path:'createdBy', select:'username'}).populate({path:'updatedBy', select:'username'}).populate({path:'areas', select:'name'});
        if(!job) return res.status(404).json({message:'Job not found!'});
        return res.status(200).json(job);
    }catch(e){
        if(('path' in e) && e.path==='_id') return res.status(404).json({message:'Job not found!'});
        return res.status(500).json({message: 'An error occurred while querying the database!', error:e});
    }
}

export async function add(req, res){
    let job=new JobController({...req.body, photo:req.file, moderatorUser:req.user});
    await job.validate();
    let errors=job.errors;
    if(errors){
        deleteUploadFiles(req);
        return res.status(406).json({message:"Errors in the required data!", errors});
    }

    let newJob=await job.completed();
    if(!newJob){
        deleteUploadFiles(req);
        return res.status(500).json({message: 'An error occurred while querying the database!'});
    }
    try{
        newJob=await Job.create(newJob);
    }catch(e){
        console.log(e);
        deleteUploadFiles(req);
        return res.status(500).json({message: 'An error occurred while querying the database!', error:e});
    }

    if(req.file){
        if(renameFile(join(__dirname, '../public/jobs_photos/'+newJob.photo),
        req.file.path)) return res.status(201).json({message:'The job record has been created, but an error occurred while storing the photo on the server!'});
    }
    return res.status(201).json({message:'Jobs registration completed!'});
}

export async function updateById(req, res){
    let job=new JobController({...req.body, photo:req.file, moderatorUser:req.user, jobIdRequired:true});
    await job.validate();
    let errors=job.errors;
    if(errors) return res.status(406).json({message:"Errors in the required data!", errors});

    let editJob=await job.completed();
    if(!editJob) return res.status(500).json({message: 'An error occurred while querying the database!'});

    try{
        let foundJob=await Job.findByIdAndUpdate(req.body.jobId, editJob);
        if(!foundJob) return res.status(404).json({message:'Job not found!'});
        return res.status(200).json({message:"Job updated successfully!"});
    }catch(e){
        if(('path' in e) && e.path==='_id') return res.status(404).json({message:'Job not found!'});
        return res.status(500).json({message: 'An error occurred while querying the database!', error:e});
    }
}

export async function deleteById(req, res){
    let errors=asignError(errors, 'jobId', validateId(req.body.jobId, 'job', true));
    if(errors) return res.status(406).json({message:"Errors in the required data!", errors});

    try{
        let deletedJob=await Job.findByIdAndRemove(req.body.jobId, {photo:true});
        if(!deletedJob) return res.status(404).json({message:'Job not found!'});
        if(!deletedJob.photo!==true){
            let deletedFile=deleteFile(join(__dirname, '../public/jobs_photos/'+deletedJob.photo));
            if(!deletedFile) return res.status(200).json({message:'The job record has been removed, but an error occurred while deleting the job photo!'});
        }
        return res.status(200).json({message:'Job removed successfully!'});
    }catch(e){
        if(('path' in e) && e.path==='_id') return res.status(404).json({message:'Job not found!'});
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
        let updatedJob=await Job.findByIdAndUpdate(req.body.jobId, {photo:newFile});
        if(!updatedJob){
            deleteUploadFiles(req);
            return res.status(404).json({message:'Job not found!'});
        }

        if(!updatedJob.photo===false) deleteFile(join(__dirname, '../public/jobs_photos/'+updatedJob.photo));

        if(!newFile===false){
            let rename=renameFile(join(__dirname, '../public/jobs_photos/'+newFile), file.path);

            if(rename){
                deleteUploadFiles(req);
                return res.status(500).json({message:'An error occurred while storing the photo on the server!'});
            }
        }

        return res.status(200).json({message:!newFile ? 'Image removed successfully!' : 'Image updated successfully!', img:newFile});
    }catch(e){
        if(('path' in e) && e.path==='_id') return res.status(404).json({message:'Job not found!'});
        return res.status(500).json({message: 'An error occurred while querying the database!', error:e});
    }
};