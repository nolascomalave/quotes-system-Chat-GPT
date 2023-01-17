import multer from 'multer';
import {join} from 'path';
import { getAll, search, add, getById, updateById, disableById, enableById, deleteById, updateRolesById, resetPassword, getByUsername } from './users.controller';
import validateParams from '../middlewares/validateParams';
import verifiquePassword from '../middlewares/verifiquePassword';
import denySelfOperation from '../middlewares/denySelfOperation';


const router=require('express').Router();
const upload=multer({ dest: join(__dirname, '../uploads') });


router.get('/', async (req, res)=>{
    if(('query' in req) && Object.keys(req.query).length>0) return await search(req, res);
    return await getAll(req, res);
});

router.post('/', upload.single('photo'), validateParams('ssn', 'first_name', 'second_name', 'first_lastname',
'second_lastname', 'gender', 'email', 'first_phone', 'second_phone', 'adress', 'photo'),
add);

router.get('/:userId', getById);

router.get('/username/:username', getByUsername);

router.put('/', upload.none(), validateParams('userId', 'ssn', 'first_name', 'second_name', 'first_lastname',
'second_lastname', 'gender', 'email', 'first_phone', 'second_phone', 'adress'),
updateById);

router.patch('/reset-password', upload.none(), /*verifiquePassword,*/ validateParams('userId'), resetPassword);

router.patch('/roles', upload.none(), verifiquePassword, validateParams('userId', 'roles'), denySelfOperation, updateRolesById);

router.patch('/disable', upload.none(), verifiquePassword, validateParams('userId'), denySelfOperation, disableById);

router.patch('/enable', upload.none(), verifiquePassword, validateParams('userId'), denySelfOperation, enableById);

router.delete('/', upload.none(), verifiquePassword, validateParams('userId'), denySelfOperation, deleteById);

module.exports=router;