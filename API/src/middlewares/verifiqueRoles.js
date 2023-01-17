module.exports=function verifiqueRoles(...roles){
    return (req, res, next)=>{
        let exist=false;

        if(req.user){
            let {roles: userRoles}=req.user;
            exist = userRoles.some(role=> roles.some(el => el==role.role));
        }

        if(exist) return next();
        return res.status(403).json({message:'You do not have the necessary permissions!'});
    }
}