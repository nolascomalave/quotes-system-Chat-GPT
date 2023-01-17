import {unlinkSync, existsSync, renameSync, readFileSync} from 'fs';
import { destilde, adaptZerosNum, extractNumberInText } from './formats';

export function asignError(errors, name, error){
    if(!errors) errors={};
    if(error){
        errors[name]=error;
    }else if(errors[name]){
        delete errors[name];
    }
    if(Object.keys(errors).length<1) return null;
    return errors;
}

export function acceptedMethods(method, ...methods){
    let error=405;
    for(let i of methods){
        if(i.toUpperCase()===method){
            error=null;
            break;
        }
    }

    return error;
}

export function validateParams(req, ...values){
    let errors={}, body=req.body || {}, files=req.files || {},  params=req.params || {},  query=req.query || {},  file=req.file || {};

    values.forEach(el => {
        if(!(el in body) && !(el in files) && !(el in params) && !(el in query) && !('fieldname' in file && el === file.fieldname)) errors[el]=`The "${el}" value is missing from the request!`;
    });

    if(Object.keys(errors).length>0) return {message: 'Values ​​are missing from the request body!', errors};
    return null;
}

export function deleteFile(path){
    if(existsSync(path)){
        try{
            unlinkSync(path);
            return path;
        }catch(e){
            return null;
        }
    }
}

export function deleteUploadFiles(req){
    if('file' in req) deleteFile(req.file.path);

    if('files' in req){
        let {files}=req, isArray=Array.isArray(files);

        if(isArray) files.forEach(file=> deleteFile(file.path));

        if(typeof files === 'object' && !isArray){
            for(const field in files){
                files[field].forEach(file=> deleteFile(file.path));
            }
        }
    }

    return;
}

export function renameFile(path, odlPath){
    if(existsSync(odlPath)){
        try{
            renameSync(odlPath, path);
            return null;
        }catch(e){
            console.log(e);
            return odlPath;
        }
    }
    return odlPath;
}

export function isFormat(format, formats){
    return formats.find(el => eval(`/${el}$/i`).test(format)) || false;
}

export async function usernameInMongoose(name, fname, schema, valName){
	let abc='abcdefghijklmnñopqrstuvwxyz', username=destilde(fname+name.charAt(0)).toUpperCase(), exist=false, error=null,
    initialUserName=username;
    abc=abc.toUpperCase();

    try{
        // Consulta a la base de datos para comprobar si existe el nombre de usuario generado:
        let result=await schema.findOne({[valName]:username}, {[valName]:true, _id:false});
        if(result){
            exist=true;
        }
    }catch(e){
        error=e;
    }

	if(exist==true){
		let iterations=[0];

		do{
			let add='';
			for(let i=0; i<iterations.length; i++){
				add+=abc.charAt(iterations[i]);
			}

			username=username+add;

			for(let j=0; j<27; j++){
				exist=false;
				username=username.split('');
				username[username.length-1]=abc.charAt(j);
				username=username.join('');

                try{
                    // Consulta a la base de datos para comprobar si existe el nombre de usuario generado:
                    let result=await schema.findOne({[valName]:username}, {[valName]:true, _id:false});

                    if(result){
                        exist=true;
                    }else{
                        break;
                    }
                }catch(e){
                    break;
                }
			}

			if(exist==true){
				username=initialUserName;

				if(iterations.length>1){
					for(let i=iterations.length; i>0; i--){
						if(iterations[i-1]<26){
							iterations[i-1]++;
							break;
						}else{
							iterations[i-1]=0;
							if(i-1==0){
								iterations.push(0);
								break;
							}
						}
					}
				}else{
					iterations.push(0);
				}
			}
		}while(exist==true);
	}

	return {
        error,
        username
    };
}

export async function modelCode(initials, schema, valName){
    let exist=true, count=await schema.findOne({}).sort({$natural:-1});
    count=!count ? 0 : Number(extractNumberInText(count.code));
    count++;

    do{
        let code=initials+adaptZerosNum(count, 3);
        if(!await schema.findOne({[valName]:code})) return code;
        count++;
    }while(exist===true);
}

export function existAllErrors(errors, ...values){
    if(!errors) return false;
    let count=0;
    for(let i of values){
        if(i in errors) count++;
    }

    if(count>=values.length) return true;
    return false;
}

// Convert IMG to Base 64:
export function base64_encode(file) {
    // read binary data
    var bitmap = readFileSync(file);
    // convert binary data to base64 encoded string
    return new Buffer(bitmap).toString('base64');
}