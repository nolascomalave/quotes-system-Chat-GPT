import User from '../models/User';
import jwt from 'jsonwebtoken';
import { hashSync, compareSync } from 'bcryptjs';
import verifySession from '../middlewares/verifySession';
//import { serialize } from "cookie";

// User Services:
import { resetPassword } from '../services/user.js';

// Middlewares:
import validateParams from '../middlewares/validateParams';
import verifyRequestParams from '../middlewares/verifyRequestParams';

// Utils:
import {validateChangePassword} from '../util/validators';
import {asignError} from '../util/functionals';
import HandlerErrors from '../util/HandlerErrors';

const router=require('express').Router();
const upload=require('multer')();

router.post('/login', upload.none(), verifyRequestParams({body: ['username', 'password']}), async (req, res)=>{
    let errors = new HandlerErrors(), {username, password} = req.body;
    if(typeof username !== 'string') errors.set('username', 'The username must be defined in text format!');
    if(typeof password !== 'string' && typeof password !== 'number') errors.set('password', 'The password must be defined in text or number format!');

    if(errors.existsErrors()) return res.status(406).json({message:"Errors in the required data!", errors: errors.getErrors(), data: null});

    username = username.toUpperCase();

    try{
        let user=await User.findOne({username:username},{
            username:true,
            password:true,
            names:true,
            gender:true,
            roles:true
        }).populate('roles');
        if(!user) return res.status(406).json({message:"Errors in the required data!", errors:{general:'Wrong username or password!'}});
        if(!compareSync(password, user.password)) return res.status(406).json({message:"Errors in the required data!", errors:{general:'Wrong username or password!'}});

        let roles=user.roles.map(el => el.role);

        user = {
            id:user._id.toString(),
            username:user.username,
            names:user.names,
            roles:roles,
            gender:user.gender
        };

        req.session.user = user;

        console.log(req.session);

        return res.status(200).json({ user: user });
    }catch(e){
        return res.status(500).json({message: 'An error occurred while querying the database!', error:e});
    }

    
});

router.post('/server-auth', upload.none(), validateParams('username', 'password'), async (req, res)=>{
    let errors={}, {username, password}=req.body;
    if(typeof username !== 'string') errors.username='The username must be defined in text format!';
    if(typeof password !== 'string' && typeof password !== 'number') errors.password='The password must be defined in text or number format!';

    if(Object.keys(errors).length>0) return res.status(406).json({message:"Errors in the required data!", errors});

    username=username.toUpperCase();
    try{
        let user=await User.findOne({username:username},{
            username:true,
            password:true,
            names:true,
            gender:true,
            roles:true
        }).populate('roles');
        if(!user) return res.status(406).json({message:"Errors in the required data!", errors:{general:'Wrong username or password!'}});
        if(!compareSync(password, user.password)) return res.status(406).json({message:"Errors in the required data!", errors:{general:'Wrong username or password!'}});

        let roles=user.roles.map(el => el.role);

        user={
            id:user._id.toString(),
            username:user.username,
            names:user.names,
            roles:roles,
            gender:user.gender
        };

        return res.status(200).json({
            token:jwt.sign(user, process.env.SECRET, {
                expiresIn:(process.env.MAX_TIME_SESSION/1000) // 24 hrs
            }),
            user: user
        });
    }catch(e){
        return res.status(500).json({message: 'An error occurred while querying the database!', error:e});
    }
});

router.patch('/extend-session', upload.none(), validateParams('token'), async (req, res)=>{
    let {token} = req.body;

    let user=null;

    try{
        user=jwt.verify(token, process.env.SECRET);
    }catch(e){
        return res.status(403).json({message:"Invalid token!"});
    }

    delete user.iat;
    delete user.exp;

    try{
        return res.status(200).json({
            token:jwt.sign(user, process.env.SECRET, {
                expiresIn:(process.env.MAX_TIME_SESSION/1000) // 24 hrs
            }),
            user: user
        });
    }catch(e){
        console.log(user);
        return res.status(500).json({message: 'An error occurred while querying the database!', error:e});
    }
});

router.patch('/change-password', upload.none(), validateParams('userPass', 'password', 'password_confirm'), verifySession,
async ({body, user}, res)=>{
    let errors={};

    let {password, password_confirm} = body;
    let [errorPass1, errorPass2] = validateChangePassword(password, password_confirm);

    errors = asignError(errors, 'password', errorPass1);
    errors = asignError(errors, 'password_confirm', errorPass2);

    if(errors) return res.status(406).json({message:"Errors in the required data!", errors});

    try{
        let userId=user._id, newPass = hashSync(password, 10);
        let actualized=await User.findByIdAndUpdate(userId, { password: newPass });

        if(!actualized) return res.status(404).json({message: 'User not found!'});
        return res.sendStatus(200);
    }catch(e){
        if(('path' in e) && e.path==='_id') return res.status(404).json({message: 'User not found!'});
        return res.status(500).json({message: 'An error occurred while querying the database!', error:e});
    }
});

/* router.patch('/reset-password', upload.none(), verifyRequestParams({body: 'userId'}), verifySession, async (req, res)=>{
    let errors = new HandlerErrors();

    //if(req.user._id.toString() === req.body.userId){
        //return res.status(406).json({data: null, message: 'To change your password you must do it through the change password option!', errors: {userId: 'To change your password you must do it through the change password option!'}});
    //}

    let result = await resetPassword(req.body.userId);

    errors.merege(errors);

    if(!errors.existsErrors()) return res.status(200).json({...result, errors: null});

    return res.status(errors.exists('server') ? 500 : 406).json({...result, errors: errors.getErrors()});
}); */

module.exports = router;