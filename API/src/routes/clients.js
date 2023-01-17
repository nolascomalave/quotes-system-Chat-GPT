import multer from 'multer';
import {join} from 'path';
import { getAll, search, add, getById, getClient, updateById, deleteById} from './clients.controller';
import validateParams from '../middlewares/validateParams';
import verifiquePassword from '../middlewares/verifiquePassword';
import denySelfOperation from '../middlewares/denySelfOperation';
import verifiqueRoles from '../middlewares/verifiqueRoles';

const router=require('express').Router();
const upload=multer({ dest: join(__dirname, '../uploads') });


router.get('/', async (req, res)=>{
    if(('query' in req) && Object.keys(req.query).length>0) return await search(req, res);
    return await getAll(req, res);
});

router.post('/', upload.single('photo'), validateParams('natural', 'name', 'ssn', 'first_name', 'second_name', 'first_lastname',
'second_lastname', 'gender', 'email', 'first_phone', 'second_phone', 'adress', 'description', 'photo'),
add);

router.get('/:clientId', getById);

router.get('/byId/:clientId', getClient);

router.put('/', upload.none(), validateParams('clientId', 'natural', 'name', 'ssn', 'first_name', 'second_name', 'first_lastname',
'second_lastname', 'gender', 'email', 'first_phone', 'second_phone', 'adress', 'description'),
updateById);

router.delete('/', upload.none(), verifiqueRoles('master'), verifiquePassword, validateParams('clientId'), denySelfOperation, deleteById);

module.exports=router;