//import {dbConnect} from "../lib/dbConnection";
import User from '../models/User';
import Role from '../models/Role';
import multer from "multer";
import {hashSync, compareSync} from 'bcryptjs';

import {
    validateId,
    validateName,
    validateEmail,
    validatePhone,
    //validateImg,
    validateMultipleRoles
} from '../util/validators';
import {asignError, validateParams, deleteUploadFiles, usernameInMongoose} from '../util/functionals';
import {extractNumberInText, firstUpper} from '../util/format';

// Open DB Connection:
//dbConnect();

// Multer Config:
const upload = multer({ dest: process.env.FILES_ROUTE });

class UserController {
    constructor({
        first_name, second_name, first_lastname, second_lastname,
        /* document, */ /* type_document, */ email, first_phone,
        second_phone, photo, roles, userId
    }){
        this.userId=userId;
        this.first_name=first_name;
        this.second_name=second_name;
        this.first_lastname=first_lastname;
        this.second_lastname=second_lastname;
        //this.document=document;
        //this.type_document=type_document;
        this.email=email;
        this.first_phone=extractNumberInText(first_phone);
        this.second_phone=extractNumberInText(second_phone);
        this.photo=photo;
        this.username=null;

        if(!Array.isArray(roles)) roles=[roles];
        this.roles=roles;

        this.errors=null;
    }

    async validate(){
        let errors;
        if(this.userId){
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
        errors=asignError(errors, 'first_name', validateName(this.first_name, 'first name', true));
        errors=asignError(errors, 'second_name', validateName(this.second_name, 'second name'));
        errors=asignError(errors, 'first_lastname', validateName(this.first_lastname, 'first lastname', true));
        errors=asignError(errors, 'second_lastname', validateName(this.second_lastname, 'second lastname'));
        errors=asignError(errors, 'email', validateEmail(this.email, true));
        errors=asignError(errors, 'first_phone', validatePhone(this.first_phone, 'en-US', true));
        errors=asignError(errors, 'second_phone', validatePhone(this.second_phone, 'en-US'));
        errors=asignError(errors, 'roles', await validateMultipleRoles(this.roles, Role));

        if(!errors || (errors && !('email' in errors))){
            let query = !this.userId ? ({email:this.email}) : ({$and:[{email:this.email}, {_id: {$ne:this.userId}}]});
            let exist=await User.findOne(query);
            if(exist) errors=asignError(errors, 'email', 'The email entered is already registered!');
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
            names:{
                first:firstUpper(this.first_name),
                second:firstUpper(this.second_name)
            },
            lastnames:{
                first:firstUpper(this.first_lastname),
                second:firstUpper(this.second_lastname)
            },
            email:this.email.toLowerCase(),
            phones:{
                primary:this.first_phone,
                secondary:this.second_phone
            },
            photo:''
        }

        if(!this.userId){
            user.username=this.username;
            user.roles=this.roles;
            user._enable=true;
            user.password=hashSync(user.username, 10);
        }

        return !this.errors ? user : null;
    }
}

/* const user=new UserController({
    first_name:'Nolasco',
    second_name:'Rafael',
    first_lastname:'Malavé',
    second_lastname:'Castro',
    //document:26916136,
    //type_document:'V',
    email:'nolascomalave@hotmail.com',
    first_phone:'6147352842',
    second_phone:null,
    photo:null
}); */

/* export async function add(req, res){
const promesa = await new Promise((resolve, reject)=>{
    upload.single('photo')(req, res, async (err) =>(async (req, res)=>{
        console.log(req.file, req.files, req.body, err);
        resolve(req.file);
        //res.status(400).send('hola, fsadfsdfsdfsdfsd, 123456, abcdef');
        console.log('hola 2');
        if(err){
            resolve();
        }
        console.log('hola 3');

        let errors=validateParams(req, 'first_name', 'second_name', 'first_lastname', 'second_lastname', 'email', 'first_phone', 'second_phone', 'photo');
        console.log('hola 4');
        if(errors){
            //deleteUploadFiles(req);
            console.log('hola 5');
            res.status(406).json(errors);
            return resolve();
        }

        let user=new UserController({...req.body, photo:req.file});
        console.log('hola 6');
        await user.validate();
        console.log(user.errors);
        errors=user.errors;
        if(errors){
            console.log('hola 7');
            //deleteUploadFiles(req);
            res.status(406).json(errors);
            return resolve();
        }

        res.send(user.errors);
        return resolve();
    }));
});

console.log(promesa);
return promesa;
} */

/* export default async function add(req, res){
    let errors=validateParams(req, 'first_name', 'second_name', 'first_lastname', 'second_lastname', 'email', 'first_phone', 'second_phone', 'photo');
    if(errors){
        deleteUploadFiles(req);
        return res.status(406).json(errors);
    }

    let user=new UserController({...req.body, photo:req.file});

    await user.validate();
    errors=user.errors;
    if(errors){
        deleteUploadFiles(req);
        return res.status(406).json(errors);
    }

    return res.send(user.errors);
} */

export async function getAll(req, res){
    try{
        return res.status(200).json(await User.find());
    }catch(e){
        return res.status(500).json({message: 'An error occurred while querying the database!', error:e});
    }
}

export async function add(req, res){
    let errors=validateParams(req, 'first_name', 'second_name', 'first_lastname', 'second_lastname', 'email', 'first_phone', 'second_phone', 'photo', 'roles');
    if(errors) return res.status(406).json(errors);

    let user=new UserController({...req.body});
    await user.validate();
    errors=user.errors;
    if(errors) return res.status(406).json({message:"Errors in the required data!", errors});

    let newUser=await user.completed();
    if(!newUser) return res.status(500).json({message: 'An error occurred while querying the database!'});
    try{
        newUser=await User.create(newUser);
    }catch(e){
        return res.status(500).json({message: 'An error occurred while querying the database!', error:e});
    }
    return res.status(201).json(newUser);
}

export async function edit(req, res){
    let errors=validateParams(req, 'userId', 'first_name', 'second_name', 'first_lastname', 'second_lastname', 'email', 'first_phone', 'second_phone', 'photo', 'roles');
    if(errors) return res.status(406).json(errors);

    let user=new UserController({...req.body});
    await user.validate();
    errors=user.errors;
    if(errors) return res.status(406).json({message:"Errors in the required data!", errors});

    let editUser=await user.completed();
    if(!editUser) return res.status(500).json({message: 'An error occurred while querying the database!'});
    try{
        editUser=await User.findByIdAndUpdate(req.body.userId, editUser);
    }catch(e){
        return res.status(500).json({message: 'An error occurred while querying the database!', error:e});
    }
    return res.status(201).json(editUser);
}