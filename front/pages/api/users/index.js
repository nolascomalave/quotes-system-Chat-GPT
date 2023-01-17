import formidable from 'formidable-serverless';
/* import multer from 'multer';
const upload=multer({ dest: process.env.FILES_ROUTE }); */
export const config = {
    api: {
      bodyParser: {
          sizeLimit: '10mb'
      },
    },
}

// Controllers:
import { add, getAll, edit } from '../../../controllers/users';

export default async function handler(req, res) {
    switch(req.method.toUpperCase()){
        case 'POST':
            return await add(req, res);
        case 'GET':
            return await getAll(req, res);
        case 'DELETE':
            return await add(req, res);
        case 'PUT':
            return await edit(req, res);
        default:
            return res.status(405).send('Method Not Allowed');
    }
}

/* import nc from "next-connect";
import multer from "multer";
import {deleteUploadFiles} from '../../../util/functionals';

const router=nc();
const upload = multer({ dest: process.env.FILES_ROUTE });

//router.use();

router.post(upload.any('photo'), async (req, res)=>{
    console.log(req.body);

    res.status(200).json(req.body);
});

export default router; */

/* export default async function handler(req, res){
    const form=formidable({
        multiples:true,
        uploadDir:process.env.FILES_ROUTE
    });
    form.keepExtensions = true;
    form.keepFilename = true;

    const reqParsed=await new Promise((resolve, reject)=>{
        const form = new formidable.IncomingForm();
        form.uploadDir = process.env.FILES_ROUTE;
        form.keepExtensions = true;
        form.parse(req, async function (err, fields, files) {
            if(err) return reject(err);
            return resolve(files);
            //res.status(201).json(req.body);
        });
    });

    res.status(201).json(reqParsed);
} */