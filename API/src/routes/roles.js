import Role from '../models/Role';
const router=require('express').Router();


router.get('/', async (req, res)=>{
    try{
        return res.json(await Role.find());
    }catch(e){
        return res.status(500).json({message: 'An error occurred while querying the database!', error:e});
    }
});

module.exports=router;