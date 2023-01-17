import multer from 'multer';
import {join} from 'path';
import { getAll, search, add, getById, updateById, deleteById, updateImg} from './jobs.controller';
import validateParams from '../middlewares/validateParams';
import verifiquePassword from '../middlewares/verifiquePassword';

const router=require('express').Router();
const upload=multer({ dest: join(__dirname, '../uploads') });

router.get('/', async (req, res)=>{
    if(('query' in req) && Object.keys(req.query).length>0) return await search(req, res);
    return await getAll(req, res);
});

router.get('/:jobId', getById);

router.post('/', upload.single('photo'), validateParams('name', 'areas', 'description', 'photo'), add);

router.put('/', upload.none(), validateParams('jobId', 'name', 'areas', 'description'), updateById);

router.delete('/', upload.none(), verifiquePassword, validateParams('jobId'), deleteById);

router.patch('/img', upload.single('photo'), validateParams('jobId', 'photo'), updateImg);

module.exports=router;