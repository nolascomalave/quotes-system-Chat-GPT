import User from '../models/User';
import Role from '../models/Role';
import Client from '../models/Client';
import {hashSync, compareSync} from 'bcryptjs';
import {join} from 'path';
import HandlerErrors from '../util/HandlerErrors';

// User Services:
import { resetPassword as userResetPassword } from '../services/user.js';

import {
    validateId,
    validateSSN,
    validateName,
    validateGender,
    validateEmail,
    validatePhone,
    validateImg,
    validateMultipleRoles,
    validateSimpleText
} from '../util/validators';
import {asignError, deleteUploadFiles, usernameInMongoose, renameFile, deleteFile} from '../util/functionals';
import {extractNumberInText, firstUpper, extractExt, regexSearch, firstCharName, sanitizeString} from '../util/formats';


class UserController {
    constructor({
        ssn, first_name, second_name, first_lastname,
        second_lastname, email, first_phone, gender,
        second_phone, adress, photo, userId, userIdRequired, moderatorUser
    }){
        this.ssn=ssn;
        this.userId=userId;
        this.userIdRequired=userIdRequired;
        this.first_name=first_name;
        this.second_name=second_name;
        this.first_lastname=first_lastname;
        this.second_lastname=second_lastname;
        this.gender=gender;
        this.email=email;
        this.first_phone=extractNumberInText(first_phone);
        this.second_phone=extractNumberInText(second_phone);
        this.adress=adress;
        this.photo=photo;
        this.username=null;

        this.moderatorUser=moderatorUser;

        this.errors=null;
    }

    async validate(){
        let errors;
        if(this.userIdRequired){
            errors=asignError(errors, 'userId', validateId(this.userId, 'user', true));

            if(!errors || !errors.userId){
                try{
                    let user=await User.findById(this.userId);
                    if(!user) return null;
                    this.username=user.username;
                }catch(e){
                    return null;
                }
            }
        }
        errors=asignError(errors, 'ssn', validateSSN(this.ssn, true));
        errors=asignError(errors, 'first_name', validateName(this.first_name, 'first name', true));
        errors=asignError(errors, 'second_name', validateName(this.second_name, 'second name'));
        errors=asignError(errors, 'first_lastname', validateName(this.first_lastname, 'first lastname', true));
        errors=asignError(errors, 'second_lastname', validateName(this.second_lastname, 'second lastname'));
        errors=asignError(errors, 'gender', validateGender(this.gender, 'second lastname'));
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

        if(!errors || (errors && !('email' in errors)) || (errors && !('ssn' in errors)) || (errors && !('first_phone' in errors))){
            this.email=this.email.toLowerCase();
            this.ssn=extractNumberInText(this.ssn);
            this.first_phone=extractNumberInText(this.first_phone);
            let query = !this.userId ? ({
                $or:[
                    {email:this.email},
                    {SSN:this.ssn},
                    {"phones.primary":this.first_phone}
                ]
            }) : ({
                $and:[
                    {
                        $or:[
                            {email:this.email},
                            {SSN:this.ssn},
                            {"phones.primary":this.first_phone}
                        ]
                    },
                    {_id: {$ne:this.userId}}
                ]
            });

            if(!errors || (errors && !errors.userId)){
                try{
                    let exist=await User.findOne(query);
                    if(!exist) exist=await Client.findOne(query);
                    if(exist){
                        if(exist.email===this.email) errors=asignError(errors, 'email', 'The email entered is already registered!');
                        if(exist.SSN===this.ssn) errors=asignError(errors, 'ssn', 'The Social Security Number entered is already registered!');
                        if(exist.phones.primary===this.first_phone) errors=asignError(errors, 'first_phone', 'The number phone entered is already registered!');
                    }
                }catch(e){
                    userId='An error occurred while querying the database!';
                    errors=!errors ? {userId} : {...errors, userId};
                }
            }
        }

        this.errors=errors;
    }

    async completed(){
        await this.validate();
        if(!this.errors && !this.username){
            let username=await usernameInMongoose(this.first_name, this.first_lastname, User, 'username');
            if(username.error){
                return null;
            }
            this.username=username.username;
        }

        if(this.errors) return null;

        let user={
            SSN:this.ssn,
            names:{
                first:firstCharName(this.first_name),
                second:firstCharName(this.second_name)
            },
            lastnames:{
                first:firstCharName(this.first_lastname),
                second:firstCharName(this.second_lastname)
            },
            gender:firstUpper(this.gender),
            email:this.email,
            phones:{
                primary:extractNumberInText(this.first_phone),
                secondary:extractNumberInText(this.second_phone)
            },
            adress:sanitizeString(this.adress)
        }

        if(!this.userId){
            user.username=this.username;
            user.roles=[await Role.findOne({role:'user'})];
            user._enable=true;
            user.password=hashSync(user.username, 10);
            user.photo=this.photo ? this.photo.filename+extractExt(this.photo.originalname) : '';
            user.createdBy=this.moderatorUser._id;
            user.updatedBy=null;
        }else{
            user.updatedBy=this.moderatorUser._id;
            //user.photo=null;
        }

        return !this.errors ? user : null;
    }
}


export async function getAll(req, res){
    try{
        let users=await User.find({username: {$ne:'ADMIN'}}, {
            username:true,
            names:true,
            lastnames:true,
            photo:true,
            roles:true,
            _enable:true
        }).populate({path:'roles', select:'role'});
        return res.json(users);
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
        let result=await User.find({
            $and:[
                {
                    $or:[
                        {"SSN": onlySearch},
                        {"username": onlySearch},
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
            username:true,
            names:true,
            lastnames:true,
            email:true,
            roles:true,
            photo:true,
            _enable:true
        }).populate('roles');

        result=result.filter(el => {
            if(onlySearch.test(el.SSN) || onlySearch.test(el.username) || onlySearch.test(el.email) || onlySearch.test(el.names.first) || onlySearch.test(el.names.second) || onlySearch.test(el.lastnames.first) || onlySearch.test(el.lastnames.second)) return true;
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
    console.log(req.session);
    let user=new UserController({...req.body, photo:req.file, moderatorUser: req.user});
    await user.validate();
    let errors=user.errors;
    if(errors){
        deleteUploadFiles(req);
        return res.status(406).json({message:"Errors in the required data!", errors});
    }

    let newUser=await user.completed();
    if(!newUser){
        deleteUploadFiles(req);
        return res.status(500).json({message: 'An error occurred while querying the database!'});
    }
    try{
        newUser=await User.create(newUser);
    }catch(e){
        deleteUploadFiles(req);
        return res.status(500).json({message: 'An error occurred while querying the database!', error:e});
    }

    if(req.file){
        if(renameFile(join(__dirname, '../public/users_photos/'+newUser.photo),
        req.file.path)) return res.status(201).json({message:'The user record has been created, but an error occurred while storing the photo on the server!'});
    }
    return res.status(201).json({message:'User registration completed!'});
}

export async function getById({params}, res){
    try{
        if(validateId(params.userId, 'user')) return res.status(404).json({message:'User not found!'});
        let user=await User.findById(params.userId, {password:false}).populate('roles');
        if(!user) return res.status(404).json({message:'User not found!'});
        return res.status(200).json(user);
    }catch(e){
        if(('path' in e) && e.path==='_id') return res.status(404).json({message:'User not found!'});
        return res.status(500).json({message: 'An error occurred while querying the database!', error:e});
    }
}

export async function getByUsername({params}, res){
    try{
        if(validateName(params.username, 'username', true)) return res.status(404).json({message:'User not found!'});
        let user = await User.findOne({username: params.username}, {password: false, roles: false}).populate('roles');
        if(!user) return res.status(404).json({message:'User not found!'});

        let parsedUser = {
            id: user._id,
            SSN: user.SSN,
            username: user.username,
            first_name: user.names.first,
            second_name: user.names.second,
            first_last_name: user.lastnames.first,
            second_last_name: user.lastnames.second,
            first_phone: user.phones.primary,
            second_phone: user.phones.secondary,
            address: user.adress,
            email: user.email,
            gender: user.gender,
            photo: user.photo,
            _enable: user._enable
        };

        delete parsedUser.names;
        delete parsedUser.lastnames;
        delete parsedUser.phones;
        delete parsedUser.adress;

        return res.status(200).json({data: parsedUser});
    }catch(e){
        return res.status(500).json({message: 'An error occurred while querying the database!', error:e});
    }
}

export async function updateById(req, res){
    let user=new UserController({...req.body, moderatorUser: req.user, userIdRequired:true});
    await user.validate();
    let errors=user.errors;
    if(errors) return res.status(406).json({message:"Errors in the required data!", errors});

    let editUser=await user.completed();
    if(!editUser) return res.status(500).json({message: 'An error occurred while querying the database!'});

    try{
        let foundEditUser=await User.findById(req.body.userId);
        if(!foundEditUser) return res.status(404).json({message:'User not found!'});
        if(foundEditUser._enable===false) return res.status(406).json({message:"Errors in the required data!", errors:{userId:'To edit user data, the user must be enable!'}});

        foundEditUser=await User.findByIdAndUpdate(req.body.userId, editUser);
        if(!foundEditUser) return res.status(404).json({message:'User not found!'});
        return res.status(200).json({message:"User updated successfully!"});
    }catch(e){
        if(('path' in e) && e.path==='_id') return res.status(404).json({message:'User not found!'});
        return res.status(500).json({message: 'An error occurred while querying the database!', error:e});
    }
}

export async function disableById(req, res){
    let errors=asignError(errors, 'userId', validateId(req.body.userId, 'user', true));
    if(errors) return res.status(406).json({message:"Errors in the required data!", errors});

    try{
        let disableUser=await User.findOne({$and:[{_id:req.body.userId}, {_enable:true}]});
        if(!disableUser) return res.status(404).json({message:'User not found!'});

        let photo=disableUser.photo;

        disableUser._enable=false;
        disableUser.photo=null;
        disableUser.save();

        if(photo!==null && photo!==''){
            let deletedFile=deleteFile(join(__dirname, '../public/users_photos/'+photo));
            if(!deletedFile) return res.status(200).json({message:'The user record has been disabled, but an error occurred while deleting the user photo!'});
        }
        return res.status(200).json({message:'User successfully disabled!'});
    }catch(e){
        if(('path' in e) && e.path==='_id') return res.status(404).json({message:'User not found!'});
        return res.status(500).json({message: 'An error occurred while querying the database!', error:e});
    }
}

export async function enableById(req, res){
    let errors=asignError(errors, 'userId', validateId(req.body.userId, 'user', true));
    if(errors) return res.status(406).json({message:"Errors in the required data!", errors});

    try{
        let disableUser=await User.findById(req.body.userId);
        if(!disableUser) return res.status(404).json({message:'User not found!'});
        if(disableUser._enable===true) return res.status(200).json({message:'User enabled successfully!'});

        disableUser._enable=true;
        disableUser.save();
        return res.status(200).json({message:'User enabled successfully!'});
    }catch(e){
        if(('path' in e) && e.path==='_id') return res.status(404).json({message:'User not found!'});
        return res.status(500).json({message: 'An error occurred while querying the database!', error:e});
    }
}

export async function deleteById(req, res){
    let errors=asignError(errors, 'userId', validateId(req.body.userId, 'user', true));
    if(errors) return res.status(406).json({message:"Errors in the required data!", errors});

    try{
        let deletedUser=await User.findById(req.body.userId, {_enable:true});
        if(!deletedUser) return res.status(404).json({message:'User not found!'});
        if(deletedUser._enable===true) return res.status(406).json({message:"Errors in the required data!", errors:{userId:'To delete user record, the user must be disable!'}});

        deletedUser=await User.findByIdAndRemove(req.body.userId, {photo:true});
        return res.status(200).json({message:'User removed successfully!'});
    }catch(e){
        if(('path' in e) && e.path==='_id') return res.status(404).json({message:'User not found!'});
        return res.status(500).json({message: 'An error occurred while querying the database!', error:e});
    }
}

export async function updateRolesById({body}, res){
    let errors={};

    let {userId, roles}=body;

    errors=asignError(errors, 'userId', validateId(userId, 'user', true));
    errors=await asignError(errors, 'roles', await validateMultipleRoles(roles, Role));

    if(errors) return res.status(406).json({message:"Errors in the required data!", errors});

    if(!Array.isArray(roles)) roles=[roles];

    try{
        let user=await User.findById(userId);
        if(!user) return res.status(404).json({message: 'User not found!'});
        user.roles=roles;
        await user.save();
        return res.sendStatus(200);
    }catch(e){
        if(('path' in e) && e.path==='_id') return res.status(404).json({message:'User not found!'});
        return res.status(500).json({message: 'An error occurred while querying the database!', error:e});
    }
};

export async function resetPassword(req, res){
    let errors = new HandlerErrors();

    /*if(req.user._id.toString() === req.body.userId){
        return res.status(406).json({data: null, message: 'To change your password you must do it through the change password option!', errors: {userId: 'To change your password you must do it through the change password option!'}});
    }*/

    let result = await userResetPassword(req.body.userId);

    errors.merege(errors);

    if(!errors.existsErrors()) return res.status(200).json({...result, errors: null});

    return res.status(errors.exists('server') ? 500 : 406).json({...result, errors: errors.getErrors()});
}

/* export async function resetPassword({body, user}, res){
    let errors={};

    let {userId}=body;

    errors=asignError(errors, 'userId', validateId(userId, 'user', true));
    if(errors) return res.status(406).json({message:"Errors in the required data!", errors});

    try{
        await User.findByIdAndUpdate(userId, {password:hashSync(user.username, 10)});
        return res.sendStatus(200);
    }catch(e){
        if(('path' in e) && e.path==='_id') return res.status(404).json({message:'User not found!'});
        return res.status(500).json({message: 'An error occurred while querying the database!', error:e});
    }
} */