import { compareSync } from "bcryptjs";

export default function verifiquePassword({body, user}, res, next){
    if(('userPass' in body)==false) return res.status(406).json({message:"Errors in the required data!", errors:{userPass:'The "userPass" value is missing from the request!'}});
    if(!compareSync(body.userPass, user.password)) return res.status(401).json({message:'Incorrect password!'});
    else next();
}