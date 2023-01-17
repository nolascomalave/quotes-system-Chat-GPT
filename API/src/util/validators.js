import {isMobilePhone} from 'validator';
import sharp from 'sharp';
import { extractNumberInText } from './formats';
import {isFormat} from './functionals';

export function validateId(id, type, required){
	if(!id && !required) return null;
	if(!id) return `The ${type} id is required!`;

	if(typeof id !== 'string') return 'The '+type+' id must be defined in text format!';
	id=id.trim();
	if(!/^[\da-z]{24}$/i.test(id)) return `The ${type} id is not defined correctly!`;
	return null;
}

export function validateName(name, type, obligatory){
	let typeOf=typeof name;

	if(typeOf != 'string' && typeOf != 'null') return `The format of the ${type} must be defined in text!`;

	if(!name && obligatory) return `You must enter a ${type}!`;

	name=name.trim();
	if(name){
		if(name.length>50){
			return 'The '+type+' must not contain more than 50 characters!';
		}else if(name.length<2){
			return `The ${type} must not contain less than 2 characters!`;
		}else if(/^[a-zA-ZáéíóúÁÉÍÓÚÑñ][a-zA-ZáéíóúÁÉÍÓÚÑñ\-\_]*( [a-zA-ZáéíóúÁÉÍÓÚÑñ][a-zA-ZáéíóúÁÉÍÓÚÑñ\-\_]*)?$/gi.test(name)==false){
			return 'The '+type+' must only contain the special characters (.\'_-)!';
		}
	}else if(obligatory){
		return `You must enter a ${type}!`;
	}

	return null;
}

export function validateEmail(email, obligatory){
	let error=null, type=typeof email,
	regExp=/^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i;

	if(type != 'string' && type != 'null') return 'The email format must be defined in text!';

	if(!email && obligatory) return 'You must enter an email!';

	email=email.trim();
	if(email.length>0){
		if(email.length>131){
			return 'Email must be less than 132 characters long!';
		}else if(regExp.test(email)==false){
			return 'Wrong email format!';
		}
	}else if(obligatory){
		return 'You must enter an email!';
	}

	return null;
}

export function validatePhone(phone, country, required){
	if(!phone && required) return 'You must enter a phone number!';
	if(!phone) return null;

	let type=typeof phone;
	if(type!=='string' && type!=='number') return 'The phone number must be defined in text or numeric format!';

	if(!isMobilePhone(phone, country)) return 'Invalid number phone!';
	return null;
}

export function validateImgParams({width, height, size, format}, {maxSize, typeLong, minWidth, maxWidth, minHeight, maxHeight, minPercent, maxPercent}){
    let acceptedFormats=['jpeg', 'png', 'webp', 'gif', 'svg'], percentDifference=width/height*100;

    acceptedFormats=acceptedFormats.filter((el)=> el===format.toLowerCase())[0] || null;

    if(!acceptedFormats) return 'The image format must be "jpeg", "png", "webp", "gif" or "svg"!';

    if(size>maxSize) return `The image must not be more than ${Math.floor(maxSize/1000000)}MB's!`;

    if(typeLong.toLowerCase()=='width'){
        percentDifference=height/width*100;
    }

    if(minWidth && width<minWidth) return `The width of the image must not be less than ${minWidth}px!`;
    if(maxWidth && width>maxWidth) return `The width of the image must not be greater than ${maxWidth}px!`;

    if(minHeight && height<minHeight) return `The height of the image must not be less than ${minHeight}px!`;
    if(maxHeight && height>maxHeight) return `The height of the image must not be greater than ${maxHeight}px!`;

    if(minPercent && percentDifference<minPercent){
        if(typeLong=='width') return `The height of the image must not be less than ${minPercent}% of its width!`;
        return `The width of the image must not be less than ${minPercent}% of its height!`;
    }else if(maxPercent && percentDifference>maxPercent){
        if(typeLong=='width') return `The height of the image must not be greater than ${maxPercent}% of its width!`;
        return `The width of the image must not be greater than ${maxPercent}% of its height!`;
    }

    return null;
}

export function validateFile(file){
	if(typeof file!=='object' || Array.isArray(file)) return 'The defined value is not a file!';

	let fileValues=['fieldname', 'originalname', 'encoding', 'mimetype', 'filename'], all=true;

	for(let el in fileValues){
		if(!file[el]){
			all=false;
			break;
		}
	}

	if(!file['buffer'] && (!file['path'] || !file['destination'])) return 'Values ​​are missing from file object!';

	return null;
}

export async function validateImg(file, params, required/* errors, file, fileName, params, obligatory */){
	if(!file && required) return `You must enter a photo!`;
	if(!file) return null;

	const validedFile=validateFile(file);
	if(validedFile) return validedFile;

	const acceptedFormats=['jpeg', 'png', 'webp', 'gif', 'svg'];
	if(!acceptedFormats.some(el => eval('/'+el+'$/i').test(file.mimetype))) return 'The mime type "'+file.mimetype+'" of the image is not accepted!';
	return validateImgParams(await sharp(file.path).metadata(), params);
}

export async function validateRole(role, Schema, required){
	let exist=null, invalidId=null;

	if(typeof role!='string') return 'The role ID must be defined in text format!';
	invalidId=await validateId(role, 'rol', required);

	if(invalidId) return invalidId;

	exist=await Schema.findById(role,{_id:true});

	if(!exist) return 'The selected role does not exist!';

	return null;
}

export async function validateMultipleRoles(array, Schema){
	let errors=[], errorsCount=0;

	if(!Array.isArray(array)) array=[array];

	let i=0;
	for(let el of array){
		errors.push(await validateRole(el, Schema, i==1 ? true : false));

		if(errors[i]){
			errorsCount++;
		}else{
			let duplicated=array.some((element, j)=>{
				if(el===element && i!=j) return true;
				return false;
			});

			if(duplicated){
				errors[i]='The role must not be defined more than once!';
				errorsCount++;
			}
		}
		i++;
	}

	if(errorsCount==1) return errors[0];
	if(errorsCount>0) return errors;

	return null;
}

export function validateGender(gender, required){
	if(!gender && !required) return;
	if(!gender) return 'Gender is required!';

	if(typeof gender!=='string') return 'The gender must be defined in text format!';
	gender=gender.trim().toLocaleLowerCase();

	if(gender!=='male' && gender!=='female') return 'The gender must be "Male" or "Female"!';
	return null;
}

export function validateSSN(ssn, required){
	if(!ssn && !required) return;
	if(!ssn) return 'The Social Security Number is required!';

	let type=typeof ssn;
	if(type!=='number' && type!=='string') return 'The Social Security Number must be defined in text or numeric format!';
	ssn=ssn.toString().trim();
	if(!/^(\d+|\d+\-\d+\-\d+)$/.test(ssn)) return 'Wrong Social Security Number Format!';

	ssn=ssn.replace(/\-/g, '');

	if(ssn.length!==9) return 'The Social Security Number must be contain 9 digits!';

	let part=[ssn.slice(0,3), ssn.slice(3,5), ssn.slice(5)];

	if(part[0]==='000') return 'The Area Number can\'t be "000"';
	if(part[1]==='00') return 'The Group Number can\'t be "00"';
	if(part[2]==='0000') return 'The Serial Number can\'t be "0000"';

	if(part[0]==='666' || Number(part[0])>=900) return 'The Area Number can\'t be "666" or be in the hundred of 900!';

	return;
}

export function validatePassword(pass){
	if(typeof pass!='string' && isNaN(pass)) return 'The password must be defined in text or numeric format!';

	if(!pass) return `Password is required!`;

	if(pass.length<6) return 'The password must contain at least 6 characters!';
	if(pass.length>30) return 'The password must contain a maximum of 30 characters!';

	return null;
}

export function validateSimpleText(string, name, min, max, required){
	if(!string && !required) return;
	if(typeof string!='string' && typeof string!='number') return 'The '+name+' must be defined in text or numeric format!';
	if(!min==true || min<1) min=1;
	if(!max){
		if(min-250<750) max=1000-min;
		else max = min+250;
	}else{
		if(max<min) max=min+250;
	}

	string=string.toString().trim();
	if(string.length<1) return 'The '+name+' is required!';
	if(string.length<min) return 'The '+name+' must contain at least '+min+' characters!';
	if(string.length>max) return 'The '+name+' must contain a maximum of '+max+' characters!';
	return null;
}

export function validateChangePassword(pass1, pass2){
	let result1=null, result2=null;

	result1=validatePassword(pass1);
	if(typeof pass2!='string' && isNaN(pass2)) result2='The password must be defined in text or numeric format!';
	if(result1 || result2) return [result1, result2];

	if(!pass2) return [null, 'Password is required!'];

	if(pass1!=pass2) result1='Passwords do not match!';
	if(result1) result2=result1;

	return [result1, result2];
}

export function validatePrice(price, name, min, required){
	if(!price && !required) return null;
	if(!name) name='price';
	if(!price) return `The ${name} is required!`;

	if(typeof price!==`string`) return `The ${name} must be defined in text format!`;
	price=price.trim();

	if(!price) return `The ${name} is required!`;

	if(/^\d+,\d{2}$/.test(price)===false) return `The ${name} format is wrong!`;

	if(!min){
		min=`0,01`;
	}else{
		/* let validate=validatePrice(min, 'minimum price', `0,01`, true);
		if(validate) return validate; */

		if(typeof min!==`string`) return `The minimum price must be defined in text format!`;
		min=min.trim();

		if(!min) return `The minimum price is required!`;

		if(/^\d+,\d{2}$/.test(min)===false) return `The minimum price format is wrong!`;

		if(Number(extractNumberInText(min))<1) return `The minimum price must not be less than 0,01$!`;
	}

	if(Number(extractNumberInText(price))<Number(extractNumberInText(min))) return `The ${name} must not be less than ${min}$!`;

	return null;
}

export function validateCuantity({num, name, min, max, int, required}){
	if((!num && num!=='0' && num!==0) && !required) return null;
	if(!name) name='quantity';
	if((!num && num!=='0' && num!==0)) return `The ${name} is required!`;

	let type=typeof num;
	if(type!=='string' && type!=='number') return `The ${name} must be defined in text or number format!`;
	if(type==='string' && isNaN(num)) return `The ${name} is not a number!`;
	num=Number(num);

	if(int && !Number.isInteger(num)) return `The ${name} must be an integer!`;

	if(!min){
		min=0;
	}else{
		let valid=validateCuantity({num:min, name:'minimum quantity', int});
		if(valid) return valid;
	}

	if(!max===false){
		let valid=validateCuantity({num:max, name:'maximum quantity', min, int});
		if(valid) return valid;
	}

	if(num<min) return `The ${name} must not be less than ${min}!`;

	if(!max===false && num>max) return `The ${name} must not be greater than ${max}!`;

	return null;
}

export async function validateExistDocument(id, Schema, name, required){
	let error=validateId(id, 'item', true);
	if(error) return error;

	try{
		let exist=await Schema.findById(id, {_id:true});
		if(!exist && !required) return null;
		if(!exist) return 'Not found item!';
		return null;
	}catch(e){
		if(('path' in e) && e.path==='_id') return 'Area not found!';
		return 'An error occurred while querying the database!';
	}
}