import fs from 'fs';
import { addDots, dateToString, stringToDate, extractNumberInText, cleanSpaces } from '../util/newFormats';

// Type:
type ReturnValidator<Type> = Type | null;

export function validatePassword(pass: any): ReturnValidator<string> {
	if(!pass) return `Password is required!`;
	if(typeof pass!=='string' && typeof pass!=='number') return 'The password must be defined in text or numeric format!';

	if(typeof pass!=='string') pass = pass.toString();

	if(pass.length<4) return 'The password must contain at least 4 characters!';
	if(pass.length>30) return 'The password must not contain more than 30 characters!';

	return null;
}

export function validateSimpleText(text: any, name: string, min?: number, max?: null | number, required?: boolean): ReturnValidator<string> {
	if(!text && !required) return null;
	if(typeof text!='string' && typeof text!='number') return 'The value "'+name+'" must be defined in text or numeric format!';

	if(min === undefined || min === null) min = 1;
	if(min<1) min=1;

	if(max === undefined || max === null) {
		if(min-250<750) max=1000-min;
		else max = min+250;
	}else{
		if(max<min) max=min+250;
	}

	text = text.toString().trim();
	if(text.length<1) return 'The value "'+name+'" is required!';
	if(text.length<min) return 'The value "'+name+'" must not contain less than '+min+' characters!';
	if(text.length>max) return 'The value "'+name+'" must not contain more than '+max+' characters!';

	return null;
}

export function validateName(name: any, type: string, obligatory?: null | boolean): ReturnValidator<string> {
	let typeOf: string = typeof name;

	if(((typeOf === 'string' && name.trim().length < 1) || name === undefined || name === null) && !obligatory){
		return null;
	}

	if((typeOf === 'string' && name.trim().length < 1) || name === undefined || name === null){
		return `The value "${typeOf}" is required!`;
	}

	if(typeOf != 'string') return 'The value "'+ type +'" must be defined in text or numeric format!';

	if(!name && obligatory) return `The value "${type}" is required!`;

	if(!name) return null;

	name = name.trim();

	if(name.length>50){
		return 'The value of "'+type+'" must not contain more than 50 characters!';
	}else if(name.length<2){
		return 'The value of "' + type + '" must not contain less than 2 characters!';
	}else if(/^[a-zA-ZáéíóúÁÉÍÓÚÑñ][a-zA-ZáéíóúÁÉÍÓÚÑñ\-\_]*( [a-zA-ZáéíóúÁÉÍÓÚÑñ][a-zA-ZáéíóúÁÉÍÓÚÑñ\-\_]*)?$/gi.test(name)==false){
		return 'The value of "'+type+'" can only contain some specific special characters (.\'_-)!';
	}

	return null;
}



export function validateGender(gender: string, required?: boolean): ReturnValidator<string>{
	if(!gender && !required) return null;
	if(!gender) return 'Gender is required!';

	if(typeof gender!=='string') return 'The gender must be defined in text format!';
	gender=gender.trim().toLocaleLowerCase();

	if(gender!=='male' && gender!=='female') return 'The gender must be "Male" or "Female"!';
	return null;
}



/* export function validateEmail(email: any, obligatory?: boolean | null): ReturnValidator<string> {
	let error=null, type: string = typeof email,
	regExp=/^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i;

	if(type != 'string' && type != 'null' && type != 'undefined') return 'The email format must be defined in text!';

	if(!email && !obligatory) return null;

	if(!email) return 'You must enter an email!';

	email = email.trim();
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
} */



export function validateDate(date: any | string | Date, type: string, minDate: null | Date, maxDate: null | Date, required?: boolean): ReturnValidator<string> {
	if(!date && !required) return null;

	if(!date) return `The ${type} date is required!`;

	if((typeof date !== 'string') && !(date instanceof Date)) return `The date format must be "dd-mm-yy", or an instance of the "Date" object!`;

	if(typeof date === 'string'){
		if(!/^\d+\-\d{1,2}\-\d{1,2}$/.test(date)) return `The date format must be "dd-mm-yy", or an instance of the "Date" object!`;

		date = stringToDate(date);
	}

	if(!!minDate && !!maxDate){
		if(maxDate.getTime() < minDate.getTime()) return `The defined minimum date ("${dateToString(maxDate)}") must not be greater than the maximum date ("${dateToString(maxDate)}")`;
	}


	if(!!minDate){
		if(minDate.getTime() > date.getTime()) return `The date in ${type} "${dateToString(date)}" must not be less than "${dateToString(minDate)}"`;
	}

	if(!!maxDate){
		if(maxDate.getTime() < date.getTime()) return `The date in ${type} "${dateToString(date)}" must not be greater than "${dateToString(maxDate)}"`;
	}

	return null;
}

export function validatePhoneNumber(phone: any, required?: boolean): ReturnValidator<string>  {
	if((!phone && (typeof phone !== 'boolean')) && !required) return null;
	if((!phone && (typeof phone !== 'boolean'))) return 'Phone number is required!';

	if((typeof phone !== 'string' && typeof phone !== 'number')) return 'The phone number must be defined in text or numeric format!';

	phone = cleanSpaces((typeof phone === 'string') ? phone : phone.toString());

	if(!/^(\+\d{1,3} ?)?\(?0?\d{3}\)?[- ]?\d{3}-?\d{4}$/.test(phone)) return 'Invalid phone number!';

	return null;
}

export function validateIdDocument(doc: any, min: null | number, max: null | number, required?: boolean): ReturnValidator<string>{
	if((doc === undefined || doc === null || doc === '') && !required) return null;

	if(typeof doc !== 'string' && typeof doc !== 'number') return 'The identity document must be defined in text or numeric format!';

	doc = (typeof doc !== 'number') ? Number(doc).toString() : doc;

	if(!(/^[a-z0-9]{1,50}$/i.test(doc.trim()))) return 'The identity document must be defined as a number only, without additional characters or leading zeros!';

	return null;
}

export function validateFile(file: any, exts: string | string[] | null, route: boolean, required?: boolean): ReturnValidator<string> {
	let filetype = typeof file;

	if(((filetype !== 'boolean') && !file) && !required) return null;
	if(((filetype !== 'boolean') && !file)) return 'The file is required!';

	if(filetype !== 'string') return 'The file params must be defined in text format';

	if(!!exts){
		let ext: string = file.trim().replace(/((\w:?)(\\|\/)(.+(\\|\/)))?(.*\.)/g, '').toLowerCase(),
			valid: boolean = (typeof exts === 'string') ? exts.toLowerCase() === ext : exts.some(el => el.toLowerCase() === ext);

		if(!valid) return `The file type is incorrect. The accepted types are: ${(typeof exts === 'string') ? exts : exts.join(', ')}!`;
	}

	if(route === true && !fs.existsSync(file)) return 'File not found!';

	return null;
}

export function validateDoc(doc: any, type: string, min: number | null, max: number | null, required?: boolean): ReturnValidator<string> {
	let typeOf=typeof doc, acceptedTypes=['string', 'number', 'null', 'undefined'], acceptedTypesDoc=['V', 'E', 'P'];

	if(!acceptedTypes.some(el => el==typeOf)) return 'The ID number must be defined in numeric or text format!';

	if(!doc && required) return 'You must enter the identity document number!';
	else if(!required) return null;

	if(!type) return 'You must define the type of document, that is, if the document is Venezuelan (V), foreign (E), or is it a passport (P)!';

	if(!acceptedTypesDoc.some(el => el==type.toUpperCase())) return 'The accepted values ​​for the identity document type are "V", "E" and "P"!';

	if(!min) min=1;
	if(min < 1) min=1;
	if(!max) max=20;
	if(max < min) max=min;

	min=Math.round(min);
	if(max!=20) max=Math.round(max);

	if(typeOf=='string') doc=doc.trim();

	if(isNaN(doc) && doc!=addDots(doc)) return `The format of the identity document is incorrect, that is, it must be a number, and only points are accepted to determine units greater than a thousand!`;
	doc=Number(extractNumberInText(doc)).toString();

	if(doc.length<min) return `The length of the identity document must not be less than ${min}!`;
	if(doc.length>max) return `The length of the identity document must not be greater than ${max}!`;

	return null;
}

function getLastNumRif(RIF: string): null | number {
	let rifLetter: string,
		rifNumber: string,
		sumRIF: number = 0,
		multi: number[] = [3, 2, 7, 6, 5, 4, 3, 2];

	RIF = RIF.toUpperCase();
	rifLetter = RIF.charAt(0);
	rifNumber = RIF.slice(1);

	if(!/^[vpgej]$/i.test(rifLetter) || rifNumber.length !== 8 || !Number(rifNumber)) return null;

	switch(rifLetter){
		case "V":
			sumRIF = (1*4);
			break;

		case "E":
			sumRIF = (2*4);
			break;

		case "J":
			sumRIF = (3*4);
			break;

		case "P":
			sumRIF = (4*4);
			break;

		case "G":
			sumRIF = (5*4);
			break;

		default:
			return null;
	}

	for(let i: number = 0; i < 8; i++) sumRIF += (parseInt(rifNumber.charAt(i)) * multi[i]);

	let EntRIF: number = parseInt((sumRIF/11).toString()),
		Residuo: number = sumRIF - (EntRIF * 11),
		DigiVal: number = 11 - Residuo;

	if (DigiVal > 9) DigiVal = 0;

	return DigiVal;
}

export function validateRif(rif: any, obligatory?: boolean): ReturnValidator<string> {
	if(typeof rif !== 'string' && rif !== undefined && rif !== null) return 'The rif must be defined in text format!';

	if(!rif && !obligatory) return null;

	if(!rif) return 'The Rif is required!';

	if(!/[a-z]-?\d{8}-?\d/i.test(rif)) return 'The rif format must contain the letter that identifies the type and nine numbers, no more (V133455669 or V-13345566-9)!';

	if(!/^[vjpge]$/i.test(rif.charAt(0))) return 'Wrong code format letter!';

	rif = rif.replace(/-/, '').toUpperCase();

	if(parseInt(rif.slice(rif.length - 1)) !== getLastNumRif(rif.slice(0, rif.length -1))) return 'Wrong rif!';

	return null;
}