import multer from 'multer';
import {join} from 'path';
import { getAll, search, add, getById, updateById, deleteById, deleteMultiple, updateImg} from './products.controller';
import validateParams from '../middlewares/validateParams';
import verifiquePassword from '../middlewares/verifiquePassword';
import denySelfOperation from '../middlewares/denySelfOperation';
import verifiqueRoles from '../middlewares/verifiqueRoles';

const router=require('express').Router();
const upload=multer({ dest: join(__dirname, '../uploads') });

//router.get('/', getAll);
router.get('/', async (req, res)=>{
    if(('query' in req) && Object.keys(req.query).length>0) return await search(req, res);
    return await getAll(req, res);
});

router.post('/', upload.single('photo'), validateParams('category', 'name', 'brand', 'sale_price',
'cost_price', 'stock', 'min_stock', 'max_stock', 'description', 'photo'), add);

router.get('/:productId', getById);

router.put('/', upload.single('photo'), validateParams('productId', 'category', 'name', 'brand', 'sale_price',
'cost_price', 'stock', 'min_stock', 'max_stock', 'description', 'photo', 'delete_photo'), updateById);

router.delete('/', upload.none(), verifiquePassword, validateParams('productId'), deleteById);

router.delete('/multiple', upload.none(), verifiqueRoles('master'), verifiquePassword, validateParams('products'), deleteMultiple);

router.patch('/img', upload.single('photo'), validateParams('productId', 'photo'), updateImg);

/* router.get('/', async (req, res)=>{
    if(('query' in req) && Object.keys(req.query).length>0) return await search(req, res);
    return await getAll(req, res);
});

router.post('/', upload.single('photo'), validateParams('natural', 'name', 'ssn', 'first_name', 'second_name', 'first_lastname',
'second_lastname', 'gender', 'email', 'first_phone', 'second_phone', 'adress', 'description', 'photo'),
add);

router.get('/:clientId', getById);

router.put('/', upload.none(), validateParams('clientId', 'natural', 'name', 'ssn', 'first_name', 'second_name', 'first_lastname',
'second_lastname', 'gender', 'email', 'first_phone', 'second_phone', 'adress', 'description'),
updateById);

router.delete('/', upload.none(), verifiqueRoles('master'), verifiquePassword, validateParams('clientId'), denySelfOperation, deleteById); */

module.exports=router;