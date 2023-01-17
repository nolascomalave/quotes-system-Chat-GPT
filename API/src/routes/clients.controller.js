import User from '../models/User';
import Client from '../models/Client';
import {join} from 'path';

import {
    validateId,
    validateSSN,
    validateName,
    validateGender,
    validateEmail,
    validatePhone,
    validateImg,
    validateSimpleText
} from '../util/validators';
import {asignError, deleteUploadFiles, renameFile, deleteFile} from '../util/functionals';
import {extractNumberInText, firstUpper, extractExt, regexSearch, firstCharName, sanitizeString, ssre} from '../util/formats';


class ClientController {
    constructor({
        natural, name, ssn, first_name, second_name, first_lastname,
        second_lastname, email, first_phone, second_phone, gender,
        description, adress, photo, clientId, clientIdRequired, moderatorUser
    }){
        this.natural=natural===true ? true : natural.toLowerCase()==='true' ? true : natural===false ? false : natural.toLowerCase()==='false' ? false : natural;
        this.name=name;
        this.ssn=ssn;
        this.clientId=clientId;
        this.clientIdRequired=clientIdRequired;
        this.first_name=first_name;
        this.second_name=second_name;
        this.first_lastname=first_lastname;
        this.second_lastname=second_lastname;
        this.gender=gender;
        this.email=email;
        this.first_phone=extractNumberInText(first_phone);
        this.second_phone=extractNumberInText(second_phone);
        this.description=description;
        this.adress=adress;
        this.photo=photo;
        this.username=null;

        this.moderatorUser=moderatorUser;

        this.errors=null;
    }

    async validate(){
        let errors;
        if(this.clientIdRequired){
            errors=asignError(errors, 'clientId', validateId(this.clientId, 'client', true));
        }
        errors=asignError(errors, 'natural', (typeof this.natural==='boolean') ? null : 'The "natural" value must be defined in boolean format!');
        if(this.natural===true){
            errors=asignError(errors, 'ssn', validateSSN(this.ssn, true));
            errors=asignError(errors, 'first_name', validateName(this.first_name, 'first name', true));
            errors=asignError(errors, 'second_name', validateName(this.second_name, 'second name'));
            errors=asignError(errors, 'first_lastname', validateName(this.first_lastname, 'first lastname', true));
            errors=asignError(errors, 'second_lastname', validateName(this.second_lastname, 'second lastname'));
            errors=asignError(errors, 'gender', validateGender(this.gender, 'second lastname'));
        }else{
            errors=asignError(errors, 'name', validateSimpleText(this.name, 'name', 5, 500, true));
            errors=asignError(errors, 'adress', validateSimpleText(this.adress, 'adress', 5, 500, true));
            errors=asignError(errors, 'description', validateSimpleText(this.description, 'description', 5, 500));
        }
        errors=asignError(errors, 'email', validateEmail(this.email, true));
        errors=asignError(errors, 'first_phone', validatePhone(this.first_phone, 'en-US', true));
        errors=asignError(errors, 'second_phone', validatePhone(this.second_phone, 'en-US'));
        errors=asignError(errors, 'adress', validateSimpleText(this.adress, 'adress', 5, 500, true));
        errors=asignError(errors, 'photo', await validateImg(this.photo, {
            maxSize:100000,
            typeLong:'width',
            minWidth:250,
            maxWidth:800,
            minPercent: 100,
            maxPercent: 100
        }));

        if(!errors || (errors && !('name' in errors)) || (errors && !('email' in errors)) || (errors && !('ssn' in errors)) || (errors && !('first_phone' in errors))){
            this.email=this.email.toLowerCase();
            this.ssn=extractNumberInText(this.ssn);
            this.first_phone=extractNumberInText(this.first_phone);
            let query={$or:[
                {email:this.email},
                {"phones.primary":this.first_phone}
            ]};

            if(!this.natural) query['$or'].push({name:eval('/^'+ssre(this.name.trim())+'$/i')});
            else query['$or'].push({SSN:this.ssn});

            query = !this.clientId ? query : ({
                $and:[query, {_id: {$ne:this.clientId}}]
            });

            if(!errors || (errors && !errors.clientId)){
                try{
                    let exist=await Client.findOne(query);
                    if(!exist){
                        if(!this.natural){
                            if(!this.clientId) query['$or'].pop();
                            else query['$and'][0]['$or'].pop();
                        }
                        exist=await User.findOne(query);
                    }
                    if(exist){
                        if(eval('/^'+ssre(this.name.trim())+'$/i').test(exist.name)) errors=asignError(errors, 'name', 'The name entered is already registered!');
                        if(exist.email===this.email) errors=asignError(errors, 'email', 'The email entered is already registered!');
                        if(exist.SSN===this.ssn) errors=asignError(errors, 'ssn', 'The Social Security Number entered is already registered!');
                        if(exist.phones.primary===this.first_phone) errors=asignError(errors, 'first_phone', 'The number phone entered is already registered!');
                    }
                }catch(e){
                    console.log(e);
                    let clientId='An error occurred while querying the database!';
                    errors=!errors ? {clientId} : {...errors, clientId};
                }
            }
        }

        this.errors=errors;
    }

    async completed(){
        //await this.validate();

        if(this.errors) return null;

        let client={
            natural: this.natural,
            name:!this.natural ? sanitizeString(this.name.trim()) : null,
            SSN:this.natural ? this.ssn : null,
            names:{
                first:this.natural ? firstCharName(this.first_name) : null,
                second:this.natural ? firstCharName(this.second_name) : null
            },
            lastnames:{
                first:this.natural ? firstCharName(this.first_lastname) : null,
                second:this.natural ? firstCharName(this.second_lastname) : null
            },
            gender:this.natural ? firstUpper(this.gender) : null,
            email:this.email,
            phones:{
                primary:extractNumberInText(this.first_phone),
                secondary:extractNumberInText(this.second_phone)
            },
            description:!this.natural ? sanitizeString(this.description) : null,
            adress:sanitizeString(this.adress)
        };

        if(!this.clientId){
            client.photo=this.photo ? this.photo.filename+extractExt(this.photo.originalname) : '';
            client.createdBy=this.moderatorUser._id;
            client.updatedBy=null;
        }else{
            client.updatedBy=this.moderatorUser._id;
        }

        return !this.errors ? client : null;
    }
}


export async function getAll(req, res){
    try{
        let clients=await Client.find({}, {
            natural:true,
            name:true,
            names:true,
            email:true,
            lastnames:true,
            phones:true,
            photo:true,
        }).populate({path:'createdBy', select:'username'}).populate({path:'updatedBy', select:'username'});
        return res.status(200).json(clients);
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
    let searchCompound=search.split(' ');
    searchCompound.push(search);

    searchCompound=searchCompound.map((el)=> regexSearch(el));

    try{
        let result=await Client.find({
            $and:[
                {
                    $or:[
                        {"SSN": onlySearch},
                        {"name": onlySearch},
                        {"names.first": {$in: searchCompound}},
                        {"names.second": {$in: searchCompound}},
                        {"lastnames.first": {$in: searchCompound}},
                        {"lastnames.second": {$in: searchCompound}},
                        {"email": onlySearch}
                    ]
                },
                {username: {$ne:'ADMIN'}}
            ]
        }, {
            SSN:true,
            name:true,
            names:true,
            lastnames:true,
            email:true,
            phones:true,
            photo:true,
            _enable:true
        });

        result=result.filter(el => {
            if(onlySearch.test(el.SSN) || onlySearch.test(el.name) || onlySearch.test(el.email) || onlySearch.test(el.names.first) || onlySearch.test(el.names.second) || onlySearch.test(el.lastnames.first) || onlySearch.test(el.lastnames.second)) return true;
            if(onlySearch.test(el.names.first+' '+el.names.second+' '+el.lastnames.first+' '+el.lastnames.second)) return true;
            if(onlySearch.test(el.names.first+' '+el.lastnames.first)) return true;
            return false;
        });
        return res.status(200).json(result);
    }catch(e){
        console.log(e);
        return res.status(500).json({message: 'An error occurred while querying the database!', error:e});
    }
}

export async function add(req, res){
    let client=new ClientController({...req.body, photo:req.file, moderatorUser:req.user/* , natural:req.body.natural ? true : false */});
    await client.validate();
    let errors=client.errors;
    if(errors){
        deleteUploadFiles(req);
        return res.status(406).json({message:"Errors in the required data!", errors});
    }

    let newClient=await client.completed();
    if(!newClient){
        deleteUploadFiles(req);
        return res.status(500).json({message: 'An error occurred while querying the database!'});
    }
    try{
        newClient=await Client.create(newClient);
    }catch(e){
        console.log(e);
        deleteUploadFiles(req);
        return res.status(500).json({message: 'An error occurred while querying the database!', error:e});
    }

    if(req.file){
        if(renameFile(join(__dirname, '../public/clients_photos/'+newClient.photo),
        req.file.path)) return res.status(201).json({message:'The client record has been created, but an error occurred while storing the photo on the server!'});
    }
    return res.status(201).json({message:'Client registration completed!'});
}

export async function getClient({params}, res){
    try{
        if(validateId(params.clientId, 'client')!==null) return res.status(404).json({message:'Client not found!'});
        let client=await Client.findById(params.clientId).populate({path:'createdBy', select:'username'}).populate({path:'updatedBy', select:'username'});
        if(!client) return res.status(404).json({message:'Client not found!'});

        let parsedClient = {
            id: client._id,
            natural: client.natural,
            SSN: client.SSN,
            first_phone: client.phones.primary,
            second_phone: client.phones.secondary,
            address: client.adress,
            email: client.email,
            gender: client.gender,
            photo: client.photo,
            _enable: client._enable
        };

        if(client.natural === true){
            parsedClient = {
                ...parsedClient,
                first_name: client.names.first,
                second_name: client.names.second,
                first_last_name: client.lastnames.first,
                second_last_name: client.lastnames.second,
            }
        }else{
            parsedClient.name = client.name;
        }

        return res.status(200).json({data: parsedClient});
    }catch(e){
        return res.status(500).json({message: 'An error occurred while querying the database!', error:e, data: null});
    }
}

export async function getById({params}, res){
    try{
        if(validateId(params.clientId, 'client')!==null) return res.status(404).json({message:'Client not found!'});
        let client=await Client.findById(params.clientId).populate({path:'createdBy', select:'username'}).populate({path:'updatedBy', select:'username'});
        if(!client) return res.status(404).json({message:'Client not found!'});
        return res.status(200).json(client);
    }catch(e){
        if(('path' in e) && e.path==='_id') return res.status(404).json({message:'Client not found!'});
        return res.status(500).json({message: 'An error occurred while querying the database!', error:e});
    }
}

export async function updateById(req, res){
    let client=new ClientController({...req.body, moderatorUser:req.user, clientIdRequired:true/* , natural:req.body.natural ? true : false */});
    await client.validate();
    let errors=client.errors;
    if(errors) return res.status(406).json({message:"Errors in the required data!", errors});

    let editClient=await client.completed();
    if(!editClient) return res.status(500).json({message: 'An error occurred while querying the database!'});

    let {natural}=req.body;
    req.body.natural=natural===true ? true : natural.toLowerCase()==='true' ? true : natural===false ? false : natural.toLowerCase()==='false' ? false : natural;

    try{
        let foundEditClient=await Client.findById(req.body.clientId);
        if(!foundEditClient) return res.status(404).json({message:'Client not found!'});
        if((req.body.natural && !foundEditClient.natural) || (!req.body.natural && foundEditClient.natural)) return res.status(406).json({message:"Errors in the required data!", errors:{natural:'The client cannot change its entity type!'}});

        foundEditClient=await Client.findByIdAndUpdate(req.body.clientId, editClient);
        if(!foundEditClient) return res.status(404).json({message:'Client not found!'});
        return res.status(200).json({message:"Client updated successfully!"});
    }catch(e){
        if(('path' in e) && e.path==='_id') return res.status(404).json({message:'Client not found!'});
        return res.status(500).json({message: 'An error occurred while querying the database!', error:e});
    }
}

export async function deleteById(req, res){
    let errors=asignError(errors, 'clientId', validateId(req.body.clientId, 'client', true));
    if(errors) return res.status(406).json({message:"Errors in the required data!", errors});

    try{
        let deletedClient=await Client.findByIdAndRemove(req.body.clientId, {photo:true});
        if(!deletedClient) return res.status(404).json({message:'Client not found!'});
        if(deletedClient.photo!==null){
            let deletedFile=deleteFile(join(__dirname, '../public/clients_photos/'+deletedClient.photo));
            if(!deletedFile) return res.status(200).json({message:'The client record has been disabled, but an error occurred while deleting the area photo!'});
        }
        return res.status(200).json({message:'Client removed successfully!'});
    }catch(e){
        if(('path' in e) && e.path==='_id') return res.status(404).json({message:'Client not found!'});
        return res.status(500).json({message: 'An error occurred while querying the database!', error:e});
    }
}