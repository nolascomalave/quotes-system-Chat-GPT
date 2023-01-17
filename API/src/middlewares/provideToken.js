import User from '../models/User';
import {sign} from 'jsonwebtoken';

module.exports=async function provideToken(req, res, next){
    try{
        const user=await User.findOne({username:'ADMIN'},{_id:true});
        const token=sign({id:user._id.toString()}, process.env.SECRET, {expiresIn: 86400});
        req.headers['x-access-token']=token;
        next();
    }catch(e){
        console.log(e);
        return res.status(500).json({message:'¡Un error ha ocurrido al generar el token de modo de desarrollo!'});
    }
}