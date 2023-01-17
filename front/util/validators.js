import { isMobilePhone } from 'validator';
import { isFormat } from './functionals';
import { extractNumberInText, dateToString, stringToDate, cleanSpaces } from './format';

export function validateId(id, type, required) {
    if (!id && !required)
        return null;
    if (!id)
        return `The ${type} id is required!`;
    if ((typeof id !== 'string') && typeof id !== 'number')
        return 'The ' + type + ' must be defined in text or number format!';
    if (!(/^[1-9]([0-9]+)?$/.test(id.toString())))
        return 'The ' + type + ' id must be a natural number in text or number format greater than 0!';
    return null;
}

export function validateName(name, type, obligatory) {
    let typeOf = typeof name;
    if (((typeOf === 'string' && name.trim().length < 1) || name === undefined || name === null) && !obligatory) {
        return null;
    }
    if ((typeOf === 'string' && name.trim().length < 1) || name === undefined || name === null) {
        return `The value "${typeOf}" is required!`;
    }
    if (typeOf != 'string')
        return 'The value "' + type + '" must be defined in text or numeric format!';
    if (!name && obligatory)
        return `The value "${type}" is required!`;
    if (!name)
        return null;
    name = name.trim();
    if (name.length > 50) {
        return 'The value of "' + type + '" must not contain more than 50 characters!';
    }
    else if (name.length < 2) {
        return 'The value of "' + type + '" must not contain less than 2 characters!';
    }
    else if (/^[a-zA-ZáéíóúÁÉÍÓÚÑñ][a-zA-ZáéíóúÁÉÍÓÚÑñ\-\_]*( [a-zA-ZáéíóúÁÉÍÓÚÑñ][a-zA-ZáéíóúÁÉÍÓÚÑñ\-\_]*)?$/gi.test(name) == false) {
        return 'The value of "' + type + '" can only contain some specific special characters (.\'_-)!';
    }
    return null;
}

export function validateEmail(email, obligatory) {
    let error = null, type = typeof email, regExp = /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i;
    if (type != 'string' && type != 'null' && type != 'undefined')
        return 'The email format must be defined in text!';
    if (!email && !obligatory)
        return null;
    if (!email)
        return 'You must enter an email!';
    email = email.trim();
    if (email.length > 0) {
        if (email.length > 131) {
            return 'Email must be less than 132 characters long!';
        }
        else if (regExp.test(email) == false) {
            return 'Wrong email format!';
        }
    }
    else if (obligatory) {
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

export function validateGender(gender, required) {
    if (!gender && !required)
        return null;
    if (!gender)
        return 'Gender is required!';
    if (typeof gender !== 'string')
        return 'The gender must be defined in text format!';
    gender = gender.trim().toLocaleLowerCase();
    if (gender !== 'male' && gender !== 'female')
        return 'The gender must be "Male" or "Female"!';
    return null;
}

export function validateSSN(ssn, required) {
    if (!ssn && !required)
        return null;
    if (!ssn)
        return 'The Social Security Number is required!';
    let type = typeof ssn;
    if (type !== 'number' && type !== 'string')
        return 'The Social Security Number must be defined in text or numeric format!';
    ssn = ssn.toString().trim();
    if (!/^(\d+|\d+\-\d+\-\d+)$/.test(ssn))
        return 'Wrong Social Security Number Format!';
    ssn = ssn.replace(/\-/g, '');
    if (ssn.length !== 9)
        return 'The Social Security Number must be contain 9 digits!';
    let part = [ssn.slice(0, 3), ssn.slice(3, 5), ssn.slice(5)];
    if (part[0] === '000')
        return 'The Area Number can\'t be "000"';
    if (part[1] === '00')
        return 'The Group Number can\'t be "00"';
    if (part[2] === '0000')
        return 'The Serial Number can\'t be "0000"';
    if (part[0] === '666' || Number(part[0]) >= 900)
        return 'The Area Number can\'t be "666" or be in the hundred of 900!';
    return null;
}

export function validatePassword(pass){
	if(typeof pass!='string' && isNaN(pass)) return 'The password must be defined in text or numeric format!';

	if(!pass) return `Password is required!`;

	if(pass.length<6) return 'The password must contain at least 6 characters!';
	if(pass.length>30) return 'The password must contain a maximum of 30 characters!';

	return null;
}

export function validateSimpleText(text, name, min, max, required) {
    if (!text && !required)
        return null;
    if (typeof text != 'string' && typeof text != 'number')
        return 'The value "' + name + '" must be defined in text or numeric format!';
    if (min === undefined || min === null)
        min = 1;
    if (min < 1)
        min = 1;
    if (max === undefined || max === null) {
        if (min - 250 < 750)
            max = 1000 - min;
        else
            max = min + 250;
    }
    else {
        if (max < min)
            max = min + 250;
    }
    text = text.toString().trim();
    if (text.length < 1)
        return 'The value "' + name + '" is required!';
    if (text.length < min)
        return 'The value "' + name + '" must not contain less than ' + min + ' characters!';
    if (text.length > max)
        return 'The value "' + name + '" must not contain more than ' + max + ' characters!';
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

export function validateCuantity({ num, name, min, max, int, required }) {
    if ((!num && num !== '0' && num !== 0) && !required)
        return null;
    if (!name)
        name = 'quantity';
    if ((!num && num !== '0' && num !== 0))
        return `The ${name} is required!`;
    let type = typeof num;
    if (type !== 'string' && type !== 'number')
        return `The ${name} must be defined in text or number format!`;
    if (type === 'string' && isNaN(num))
        return `The ${name} is not a number!`;
    num = Number(num);
    if (int && !Number.isInteger(num))
        return `The ${name} must be an integer!`;
    if (!min) {
        min = 0;
    }
    else {
        let valid = validateCuantity({ num: min, name: 'minimum quantity', int });
        if (valid)
            return valid;
    }
    if (!!max) {
        let valid = validateCuantity({ num: max, name: 'maximum quantity', min, int });
        if (valid)
            return valid;
    }
    if (num < min)
        return `The ${name} must not be less than ${min}!`;
    if (!!max && num > max)
        return `The ${name} must not be greater than ${max}!`;
    return null;
}

export function validateDate(date, type, minDate, maxDate, required) {
    if (!date && !required)
        return null;
    if (!date)
        return `The ${type} date is required!`;
    if ((typeof date !== 'string') && !(date instanceof Date))
        return `The date format must be "dd-mm-yy", or an instance of the "Date" object!`;
    if (typeof date === 'string') {
        if (!/^\d+\-\d{1,2}\-\d{1,2}$/.test(date))
            return `The date format must be "dd-mm-yy", or an instance of the "Date" object!`;
        date = stringToDate(date);
    }
    if (!!minDate && !!maxDate) {
        if (maxDate.getTime() < minDate.getTime())
            return `The defined minimum date ("${dateToString(maxDate)}") must not be greater than the maximum date ("${dateToString(maxDate)}")`;
    }
    if (minDate !== null) {
        if (minDate.getTime() > date.getTime())
            return `The date in ${type} "${dateToString(date)}" must not be less than "${dateToString(minDate)}"`;
    }
    if (maxDate !== null) {
        if (maxDate.getTime() < date.getTime())
            return `The date in ${type} "${dateToString(date)}" must not be greater than "${dateToString(maxDate)}"`;
    }
    return null;
}

export function validatePhoneNumber(phone, required) {
    if ((!phone && (typeof phone !== 'boolean')) && !required)
        return null;
    if ((!phone && (typeof phone !== 'boolean')))
        return 'Phone number is required!';
    if ((typeof phone !== 'string' && typeof phone !== 'number'))
        return 'The phone number must be defined in text or numeric format!';
    phone = cleanSpaces((typeof phone === 'string') ? phone : phone.toString());
    if (!/^(\+\d{1,3} ?)?\(?0?\d{3}\)?[- ]?\d{3}-?\d{4}$/.test(phone))
        return 'Invalid phone number!';
    return null;
}