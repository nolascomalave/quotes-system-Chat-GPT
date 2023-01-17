import Product from "../models/Product";
import User from '../models/User';
import {join} from 'path';

import {
    validateId,
    validateImg,
    validateSimpleText,
    validatePrice,
    validateCuantity
} from '../util/validators';
import {asignError, deleteUploadFiles, usernameInMongoose, renameFile, deleteFile, existAllErrors} from '../util/functionals';
import {extractNumberInText, firstUpper, extractExt, regexSearch, firstCharName, sanitizeString, ssre, cleanSpaces} from '../util/formats';

export class ProductController {
    constructor({
        category, name, brand, sale_price, cost_price,
        stock, min_stock, max_stock, description, photo,
        productId, productIdRequired, moderatorUser, delete_photo
    }){
        this.category=category;
        this.name=name;
        this.brand=brand;
        this.sale_price=sale_price;
        this.cost_price=cost_price;
        this.stock=stock;
        this.min_stock=min_stock;
        this.max_stock=max_stock==='null' ? null : !max_stock ? null : max_stock;
        this.description=description;
        this.photo=photo;
        this.delete_photo=delete_photo;
        this.productId=productId;
        this.productIdRequired=productIdRequired;
        this.moderatorUser=moderatorUser;

        this.errors=null;
    }

    async validate(){
        let errors;
        if(this.productIdRequired){
            errors=asignError(errors, 'productId', validateId(this.productId, 'product', true));
        }
        errors=asignError(errors, 'name', validateSimpleText(this.name, 'name', 2, 50, true));
        errors=asignError(errors, 'category', validateSimpleText(this.category, 'product category', 3, 15));
        errors=asignError(errors, 'brand', validateSimpleText(this.brand, 'brand of the product', 2, 20));
        errors=asignError(errors, 'min_stock', validateCuantity({num:this.min_stock, name:'minimum stock', int:true, required:true}));
        errors=asignError(errors, 'max_stock', validateCuantity({num:this.max_stock, name:'maximum stock', min:this.min_stock, int:true}));
        errors=asignError(errors, 'stock', validateCuantity({num:this.stock, name:'stock', min:this.min_stock, max:this.max_stock, int:true, required:true}));
        errors=asignError(errors, 'cost_price', validatePrice(this.cost_price, 'cost price', '0,01', true));
        errors=asignError(errors, 'sale_price', validatePrice(this.sale_price, 'sale price', this.cost_price, true));
        errors=asignError(errors, 'description', validateSimpleText(this.description, 'description', 5, 150));
        errors=asignError(errors, 'photo', await validateImg(this.photo, {
            maxSize:100000,
            typeLong:'width',
            minWidth:250,
            maxWidth:800,
            minPercent: 30,
            maxPercent: 300
        }));

        if(!existAllErrors(errors, 'name', 'productId')){
            let name=eval('/^'+ssre(cleanSpaces(this.name))+'$/i');
            let query=!this.productIdRequired ? ({name:name}) : ({$and:[{name:name}, {_id:{$ne:this.productId}}]});

            if(!errors || (errors && !errors.productId)){
                try{
                    let exist=await Product.findOne(query);
                    if(exist) errors=asignError(errors, 'name', 'The name entered is already registered!');
                }catch(e){
                    console.log(e);
                    let name='An error occurred while querying the database!';
                    errors=!errors ? {name} : {...errors, name};
                }
            }
        }

        this.errors=errors;
    }

    async completed(){
        if(this.errors) return null;
        let product={
            name:cleanSpaces(this.name),
            category:firstUpper(cleanSpaces(this.category)),
            brand:firstUpper(cleanSpaces(this.brand)),
            cost_price:this.cost_price,
            sale_price:this.sale_price,
            stock:!this.stock ? null : this.stock,
            min_stock:!this.min_stock ? null : this.min_stock,
            max_stock:!this.max_stock ? null : this.max_stock,
            description:cleanSpaces(this.description)
        }

        if(!this.productIdRequired){
            product.photo=this.photo ? this.photo.filename+extractExt(this.photo.originalname) : null;
            product.createdBy=this.moderatorUser._id;
            product.updatedBy=null;
        }else{
            product.photo=!this.delete_photo ? this.photo ? this.photo.filename+extractExt(this.photo.originalname) : null : null;
            product.updatedBy=this.moderatorUser._id;
        }

        return !this.errors ? product : null;
    }
}


export async function getAll(req, res){
    try{
        let products=await Product.find({}, {
            name:true,
            category:true,
            brand:true,
            sale_price:true,
            stock:true,
            min_stock:true,
            photo:true
        }).populate({path:'createdBy', select:'username'}).populate({path:'updatedBy', select:'username'});
        return res.status(200).json(products);
    }catch(e){
        return res.status(500).json({message: 'An error occurred while querying the database!', error:e});
    }
}

export async function search(req, res){
    let {search} = req.query;
    if(!search) return res.status(406).json({message: 'Values ​​are missing from the request body!', errors:{search:'The "search" value is missing from the request!'}});
    if(typeof search !== 'string' && typeof search !== 'number') return res.status(500).json({message: 'The search must be defined in text or numeric format!'});
    search=search.replace(/ +/g, ' ');
    let onlySearch=regexSearch(search);

    try{
        let result=await Product.find({
            $or:[
                {"brand": onlySearch},
                {"name": onlySearch},
                {"category": onlySearch}
            ]
        }, {
            name:true,
            category:true,
            brand:true,
            sale_price:true,
            stock:true,
            photo:true
        });
        return res.status(200).json(result);
    }catch(e){
        console.log(e);
        return res.status(500).json({message: 'An error occurred while querying the database!', error:e});
    }
}

export async function add(req, res){
    let product=new ProductController({...req.body, photo:req.file, moderatorUser:req.user});
    await product.validate();
    let errors=product.errors;
    if(errors){
        deleteUploadFiles(req);
        return res.status(406).json({message:"Errors in the required data!", errors});
    }

    let newProduct=await product.completed();
    if(!newProduct){
        deleteUploadFiles(req);
        return res.status(500).json({message: 'An error occurred while querying the database!'});
    }
    try{
        newProduct=await Product.create(newProduct);
    }catch(e){
        console.log(e);
        deleteUploadFiles(req);
        return res.status(500).json({message: 'An error occurred while querying the database!', error:e});
    }

    if(req.file){
        if(renameFile(join(__dirname, '../public/products_photos/'+newProduct.photo),
        req.file.path)) return res.status(201).json({message:'The product record has been created, but an error occurred while storing the photo on the server!'});
    }
    return res.status(201).json({message:'Product registration completed!'});
}

export async function getById({params}, res){
    try{
        if(validateId(params.productId, 'product')!==null) return res.status(404).json({message:'Product not found!'});
        let product=await Product.findById(params.productId).populate({path:'createdBy', select:'username'}).populate({path:'updatedBy', select:'username'});
        if(!product) return res.status(404).json({message:'Product not found!'});
        return res.status(200).json(product);
    }catch(e){
        if(('path' in e) && e.path==='_id') return res.status(404).json({message:'Product not found!'});
        return res.status(500).json({message: 'An error occurred while querying the database!', error:e});
    }
}

export async function updateById(req, res){
    let product=new ProductController({...req.body, photo:req.file, moderatorUser:req.user, productIdRequired:true});
    await product.validate();
    let errors=product.errors;
    if(errors){
        deleteUploadFiles(req);
        return res.status(406).json({message:"Errors in the required data!", errors});
    }

    let editProduct=await product.completed(), foundEditProduct=null;
    if(!editProduct){
        deleteUploadFiles(req);
        return res.status(500).json({message: 'An error occurred while querying the database!'});
    }

    try{
        foundEditProduct=await Product.findById(req.body.productId);
        if(!foundEditProduct){
            deleteUploadFiles(req);
            return res.status(404).json({message:'Product not found!'});
        }

        foundEditProduct=await Product.findByIdAndUpdate(req.body.productId, editProduct);
        if(!foundEditProduct){
            deleteUploadFiles(req);
            return res.status(404).json({message:'Product not found!'});
        }
        if(req.body.delete_photo) deleteFile(foundEditProduct.photo);
    }catch(e){
        deleteUploadFiles(req);
        if(('path' in e) && e.path==='_id') return res.status(404).json({message:'Product not found!'});
        return res.status(500).json({message: 'An error occurred while querying the database!', error:e});
    }

    if(req.file && !req.body.delete_photo){
        console.log(req.body.delete_photo);
        if(!foundEditProduct===false) deleteFile(join(__dirname, '../public/products_photos/'+foundEditProduct.photo));
        if(renameFile(join(__dirname, '../public/products_photos/'+req.file.filename+extractExt(req.file.originalname)),
        req.file.path)) return res.status(201).json({message:'The product record has been created, but an error occurred while storing the photo on the server!'});
    }else if(req.body.delete_photo){
        deleteUploadFiles(req);
        if(!foundEditProduct===false) deleteFile(join(__dirname, '../public/products_photos/'+foundEditProduct.photo));
    }

    return res.status(200).json({message:"Product updated successfully!"});
}

export async function deleteById(req, res){
    let errors=asignError(errors, 'productId', validateId(req.body.productId, 'product', true));
    if(errors) return res.status(406).json({message:"Errors in the required data!", errors});

    try{
        let deletedProduct=await Product.findByIdAndRemove(req.body.productId, {photo:true});
        if(!deletedProduct) return res.status(404).json({message:'Product not found!'});
        if(deletedProduct.photo!==null){
            let deletedFile=deleteFile(join(__dirname, '../public/products_photos/'+deletedProduct.photo));
            if(!deletedFile) return res.status(200).json({message:'The product record has been disabled, but an error occurred while deleting the product photo!'});
        }
        return res.status(200).json({message:'Product removed successfully!'});
    }catch(e){
        if(('path' in e) && e.path==='_id') return res.status(404).json({message:'Product not found!'});
        return res.status(500).json({message: 'An error occurred while querying the database!', error:e});
    }
}

export async function deleteMultiple(req, res){
    if(!Array.isArray(req.body.products)) req.body.products=[req.body.products];
    for(let i of req.body.products){
        if(validateId(i, 'product', true)) return res.status(406).json({message:"Errors in the required data!", errors:{products:'There are wrongly defined product IDs!'}});
    }

    try{
        let products=await Product.find({_id:{$in:req.body.products}});
        if(products.length<1) return res.status(404).json({message:'Products not found!'});
        let deletedProducts=await Product.deleteMany({_id:{$in:req.body.products}});
        if(deletedProducts.deletedCount<1) return res.status(404).json({message:'Products not found!'});

        return res.status(200).json({
            message:deletedProducts.deletedCount<req.body.products.length
            ? 'Products removed successfully!, but there are products that have not been removed.'
            : 'Products removed successfully!',
            deleted:products.map(el => el._id.toString())
        });
    }catch(e){
        return res.status(500).json({message: 'An error occurred while querying the database!', error:e});
    }

    /* try{
        let deletedProduct=await Product.findByIdAndRemove(req.body.productId, {photo:true});
        if(!deletedProduct) return res.status(404).json({message:'Product not found!'});
        if(deletedProduct.photo!==null){
            let deletedFile=deleteFile(join(__dirname, '../public/products_photos/'+deletedProduct.photo));
            if(!deletedFile) return res.status(200).json({message:'The product record has been disabled, but an error occurred while deleting the user photo!'});
        }
        return res.status(200).json({message:'Product removed successfully!'});
    }catch(e){
        if(('path' in e) && e.path==='_id') return res.status(404).json({message:'Product not found!'});
        return res.status(500).json({message: 'An error occurred while querying the database!', error:e});
    } */
}

export async function updateImg(req, res){
    let {file} = req, newFile='';
    if('file' in req){
        if(/\.\w$/.test(file.originalname)===false) file.originalname+=file.mimetype.replace(/^image\//, '.').toLowerCase();

        let errors=asignError(errors, 'photo', await validateImg(file, {
            maxSize:100000,
            typeLong:'width',
            minWidth:250,
            maxWidth:4000,
            minPercent: 30,
            maxPercent: 300
        }));

        if(errors) return res.status(406).json({message:"Errors in the required data!", errors});

        newFile=file.filename+extractExt(file.originalname);
    }else{
        newFile=null;
    }

    try{
        let updatedProduct=await Product.findByIdAndUpdate(req.body.productId, {photo:newFile});
        if(!updatedProduct){
            deleteUploadFiles(req);
            return res.status(404).json({message:'Product not found!'});
        }

        if(!updatedProduct.photo===false) deleteFile(join(__dirname, '../public/products_photos/'+updatedProduct.photo));

        if(!newFile===false){
            let rename=renameFile(join(__dirname, '../public/products_photos/'+newFile), file.path);

            if(rename){
                deleteUploadFiles(req);
                return res.status(500).json({message:'An error occurred while storing the photo on the server!'});
            }
        }

        return res.status(200).json({message:!newFile ? 'Image removed successfully!' : 'Image updated successfully!', img:newFile});
    }catch(e){
        if(('path' in e) && e.path==='_id') return res.status(404).json({message:'Product not found!'});
        return res.status(500).json({message: 'An error occurred while querying the database!', error:e});
    }
};

