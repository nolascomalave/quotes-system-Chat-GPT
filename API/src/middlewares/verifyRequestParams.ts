import { Request, RequestHandler, Response, NextFunction } from "express";
import { Multer } from 'multer';
import HandlerErrors from "../util/HandlerErrors";
import { deleteRestUploadedFiles } from '../util/functionals';

// utils:
import { deleteFile } from '../util/functionals';

type RequiredRequestParams = {
    any?: string | string[];
    body?: string | string[];
    query?: string | string[];
    files?: string | string[];
} | string | string[];

export function verifyValuesInObject(req: Request, obj: 'body' | 'query' | null, values: string[]): HandlerErrors {
    let errors: HandlerErrors = new HandlerErrors();

    if(!obj || obj === 'body'){
        values.forEach(el => {
            let endMessage = !req.body ? 'la petición' : 'el cuerpo de la petición';
            if(!req.body || (!!req.body && !(el in req.body)))
                return errors.set(el, `¡El valor "${el}" es requerido en ${endMessage}!`);
        });

        if(!!obj) return errors;
    }

    if(!obj || obj === 'query'){
        values.forEach(el => {
            let endMessage = !req.body ? 'petición' : 'consulta de la petición';
            if(!req.query || (!!req.query && !(el in req.query)))
                return errors.set(el, `¡El valor "${el}" es requerido en la ${endMessage}!`);
        });
    }

    return errors;
}

function verifyFilesInObject(req: Request, values: string[]): HandlerErrors {
    let errors: HandlerErrors = new HandlerErrors(),
        existsErrors: boolean = false,
        toDelete: any[] = [];

    values.forEach((el) => {
        // Si existe el objeto files, tiene valor y no existe el archivo especificado:
        if('files' in req && !!req.files){
            if(!Array.isArray(req.files) && !(el in req.files)){
                errors.set(el, `¡El archivo "${el}" es requerido en el cuerpo de la petición!`);
                existsErrors = true;
            }else if(el in req.files){
                if(existsErrors) toDelete.push(el);
            }else if(Array.isArray(req.files)){
                let index = 0;
                let exists = req.files.some((file, i) => {
                    let some = file.fieldname === el;

                    if(some) index = i;

                    return some;
                });

                if(!exists){
                    errors.set(el, `¡El archivo "${el}" es requerido en el cuerpo de la petición!`);
                    existsErrors = true;
                }else if(existsErrors){
                    toDelete.push(index);
                }
            }
        }

        // Si existe el objeto files, tiene valor y existe el archivo especificado, pero
        // existen errores, entonces se elimina el archivo:
        if('files' in req && !!req.files && !!(el in req.files) && !!existsErrors){
            if(Array.isArray(req.files)) req.files.forEach(file=> deleteFile(file.path));

            if(typeof req.files === 'object' && !Array.isArray(req.files)){
                for(const field in req.files){
                    req.files[field].forEach(file=> deleteFile(file.path));
                }
            }
        }


        // Si existe el objeto file, tiene valor y no es el archivo especificado:
        if('file' in req && !!req.file && (el !== req.file.fieldname)){
            errors.set(el, `¡El archivo "${el}" es requerido en el cuerpo de la petición!`);
            existsErrors = true;
        }

        // Si existe el objeto file, tiene valor y es el archivo especificado, pero
        // existen errores, entonces se elimina el archivo:
        if('file' in req && !!req.file && (el === req.file.fieldname) && !!existsErrors){
            deleteFile(req.file.path);
        }
    });

    if(toDelete.length > 1) deleteRestUploadedFiles(req, toDelete);

    return errors;
}

export default function verifyRequestParams(obj: RequiredRequestParams): Function {
    return function(req: Request, res: Response, next: NextFunction): Response<any, Record<string, any>> | void {
        let errors: HandlerErrors = new HandlerErrors();

        if(typeof obj !== 'object') obj = { any: obj };

        if('any' in obj && !!obj.any){
            if(typeof obj.any === 'string') obj.any = [obj.any];
            errors.merege(verifyValuesInObject(req, null, obj.any));
        }

        if('body' in obj && !!obj.body){
            if(typeof obj.body === 'string') obj.body = [obj.body];
            errors.merege(verifyValuesInObject(req, 'body', obj.body));
        }

        if('query' in obj && !!obj.query){
            if(typeof obj.query === 'string') obj.query = [obj.query];
            errors.merege(verifyValuesInObject(req, 'query', obj.query));
        }

        if('files' in obj && !!obj.files){
            if(typeof obj.files === 'string') obj.files = [obj.files];
            errors.merege(verifyFilesInObject(req, obj.files));
        }

        if(!errors.existsErrors()) return next();

        return res.status(406).json({
            message: 'Errores en los parámetros requeridos.',
            errors: errors.getErrors(),
            data: null
        });
    }
}