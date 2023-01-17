import User from '../models/User';
import jwt from 'jsonwebtoken';

module.exports = async function verifyToken(req, res, next){
    const token=req.headers["x-access-token"];

    if(!token) return res.status(403).json({message:"No token provided!"});

    let decoded=null;

    try{
        decoded=jwt.verify(token, process.env.SECRET);
    }catch(e){
        return res.status(403).json({message:"Invalid token!"});
    }

    if(!decoded.id) return res.status(403).json({message:'No user id provided in access token!'});

    try{
        const user=await User.findOne({_id:decoded.id}, {username:true, roles:true, password:true}).populate({path:'roles', select:{role:true}});

        if(!user) return res.status(404).json({message:'Not user found!'});
        req.user=user;

        next();
    }catch(e){
        if(('path' in e) && e.path==='_id') return res.status(404).json({message: 'User not found!'});
        return res.status(500).json({message: 'An error occurred while querying the database!', error:e});
    }
}