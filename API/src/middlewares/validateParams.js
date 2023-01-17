import {deleteUploadFiles} from '../util/functionals';

export default (...values)=>{
    return (req, res, next)=>{
        let errors={}, body=req.body || {}, files=req.files || {},  params=req.params || {},  query=req.query || {},  file=req.file || {};

        values.forEach(el => {
            if(!(el in body) && !(el in files) && !(el in params) && !(el in query) && !('fieldname' in file && el === file.fieldname)) errors[el]=`The "${el}" value is missing from the request!`;
        });

        if(Object.keys(errors).length>0){
            deleteUploadFiles(req);
            return res.status(406).json({message: 'Values ​​are missing from the request body!', errors});
        }
        return next();
    }
}