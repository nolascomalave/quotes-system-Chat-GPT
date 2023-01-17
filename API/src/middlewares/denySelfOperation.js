module.exports=function denySelfOperation({user, body}, res, next){
    if(user._id.toString()===body.userId) return res.status(403).json({message:'A user cannot make significant changes to your system registry!'});
    next();
}