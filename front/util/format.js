export function ssre(string){
	let chars='\\/-^[]()|\'"`+$?¡¿!*.{}<>';

	for(let i=0; i<chars.length; i++){
		string=string.replace(eval('/\\'+chars.charAt(i)+'/gi'), '\\'+chars.charAt(i));
	}

	return string;
}

export function regularExpressionVocalGroup(string){
	let mal='aáäàâeéèêëiíïîìoóòôöuúûùü', bien='aaaaeeeeiiiioooouuuu', abc='abcdefghijklmnñopqrstuvwxyz';
	let a_group='[aáäàâ]', e_group='[eéèêë]', i_group='[iíïîì]', o_group='[oóòôö]', u_group='[uúûùü]';
	let result='';

	for(let i=0; i<string.length; i++){
		let numero=0, changed=false;
		for(let j=0; j<mal.length; j++){
			if(string.charAt(i)==mal.charAt(j) || string.charAt(i).toUpperCase()==mal.charAt(j).toUpperCase()){
				numero=j;
				changed=true;
				break;
			}
		}

		if(changed==true){
			if(numero<5){
				result=result+'('+a_group+'|'+a_group.toUpperCase()+')';
			}else if(numero<10){
				result=result+'('+e_group+'|'+e_group.toUpperCase()+')';
			}else if(numero<14){
				result=result+'('+i_group+'|'+i_group.toUpperCase()+')';
			}else if(numero<19){
				result=result+'('+o_group+'|'+o_group.toUpperCase()+')';
			}else{
				result=result+'('+u_group+'|'+u_group.toUpperCase()+')';
			}
		}else{
			result=result+string.charAt(i);
		}
	}

	return result;
}

export function regexSearch(string){
	string=ssre(string);
	string=regularExpressionVocalGroup(string);
	return eval('/'+string+'/i');
}

export function busqueda(busqueda, place){
	let regExp=/ /gi;
	busqueda=ssre(busqueda);
	busqueda=regularExpressionVocalGroup(busqueda);
	regExp=eval('/'+busqueda+'/gi');
	return regExp.test(place);
}

export function textToRegExp(string){
	return regularExpressionVocalGroup(ssre(string));
}

export function extractExt(filename){
	return filename.match(/\.\w+$/g)[0] || null;
}

export function cleanSpaces(string){
    return string.replace(/(\b {2,})/g, ' ').trim();
}

export function spaceXHippen(string){
	return string.replace(/ +/g, '-');
}

export function dotToLowBar(string){
	return string.replace(/\.+/g, '_');
}

export function extractNumberInText(text){
	return text.replace(/[^0-9]/g, '').toString();
}

export function adaptNumTwo(num){
	let result='';
	switch (String(num).length){
		case 1:
			result=String('0'+num);
			break;
		default :
			result=String(num);
			break;
	}
	return result;
}

export function sanitizeString(string){
	string=string.trim();
	string=string.replace(/\</gi, '&lt;');
	string=string.replace(/\>/gi, '&gt;');
	string=string.replace(/\"/gi, '&quot;');
	return string;
}

export function quitSpace(string){
	return string.replace(/ /g, '').toLowerCase();
}

export function destilde(string){
	let a='[áäàâ]', e='[éèêë]', i='[íïîì]', o='[óòôö]', u='[úûùü]';
	string=string.replace(eval('/'+a+'/gi'), 'a');
	string=string.replace(eval('/'+e+'/gi'), 'e');
	string=string.replace(eval('/'+i+'/gi'), 'i');
	string=string.replace(eval('/'+o+'/gi'), 'o');
	string=string.replace(eval('/'+u+'/gi'), 'u');

	return string.replace(/ñ/gi, 'nh');
}

export function firstUpper(name){
	return name.charAt(0).toUpperCase()+name.slice(1).toLowerCase();
}

export function firstCharName(name){
	name=name.split(' ');

	for(let i=0;i<name.length;i++){
		name[i]=name[i].charAt(0).toUpperCase()+name[i].slice(1);
	}

	name=name.join(' ');

	return name;
}

export function entityFormat(string){
	string=string.replace(/ {2,}/g, ' ').trim();
	string=string.replace(/\B_/g, '');
	return firstCharName(string.replace(/\B-/g, ''));
}

export function puntoDigito(number){

	number=extractNumberInText(number);

	if(number.length>0 && Number(number)==0){
		number='';
	}

	let numero='';
	for(let i=0;i<number.length;i++){
		if(number.charAt(i)!='.'){
			numero=numero+number.charAt(i);
		}
	}
	number=numero;

	let n=3;
	let x=0;
	if(number.length>n+x){
		if(number>999){
			number=number.split('');
			do{
				let j=n+x;
				let h=0;
				for(let i=0; i<=n+x; i++){
					let act=number.length-h;
					number[number.length-h]=number[act-1];
					h++;
				}
				x++;
				number[number.length-n-x]='.';
				n=n+3;
			}while(number.length>n+x);
			number=number.join('');
		}else{
			number=number;
		}
	}

	return number;
}

export function rifFormat(rif){
	let rifNumber=extractNumberInText(rif);
	rifNumber=rifNumber.substring(0, rifNumber.length-1);
	return rif.charAt(0).toUpperCase()+'-'+rifNumber+'-'+rif.charAt(rif.length-1);
}

// Formateo de Fechas:
export function extractNumberDate(date){
	date=date.split('/');
	return Number(adaptNumTwo(date[2])+''+adaptNumTwo(date[1])+''+adaptNumTwo(date[0]));
}

export function getDateLikeJSON(date){
	date=date.split('/');
	return {
		day: Number(date[0]),
		month: Number(date[1]),
		year: Number(date[2])
	}
}

export function organizeDate(date){
	date=date.split('-');
	return adaptNumTwo(date[2])+'/'+adaptNumTwo(date[1])+'/'+adaptNumTwo(date[0]);
}

export function moneyFormat(money){
	if(isNaN(money)){
		if(typeof money !== 'string') return '0,00';
	}else{
		money=money.toString();
	}

	money=Number(extractNumberInText(money)).toString();

	if(money.length<3) for(let i=0; i<(3-money.length); i++) money='0'+money;

	money=money.split('');
	money.splice(money.length-2,0,',');
	return money.length<4 ? '0'+money.join('') : money.join('');
}

export function quantityFormat(number){
	if(isNaN(number) && (typeof number!=='string')) return 0;
	return Number(number).toString();
}

export function dateStringToLocalDate(date){
	if(typeof date !== 'string') return date;
	let newDate=date.match(/\d+(\-\d{2}){2}/g);
	if(!newDate) return date;
	newDate=newDate[0].split('-');
	return newDate.reverse().join('/');
}

export function reformatNum(num, type){
	if(typeof num === 'number') return num;
	if(typeof num !== 'string' || (typeof num === 'string' && num.trim().length < 1)) return 0;

	if(!type || (!!type && type.toLowerCase() === 'en')){
		num = num.trim().replace(/[^\d.]/g, '');
	}else{
		num = num.trim().replace(/[^\d,]/g, '').replace(/,/g, '.');
	}



	return /[^0-9.]/g.test(num) ? 0 : parseFloat(num);
}

export function enUSNumberFormat(num, digits){
	if(typeof num !== 'number' && typeof num !== 'string') return num;

	num = num.toString().replace(/,/g, '');

	if(/[^0-9.]/g.test(num)) return 0;

	let newNum = new Intl.NumberFormat('en-US').format(num);
	let rest = newNum.replace(/(^(\d+,?)+\.|^\d*$|\d{1,3},(\d+\.?)|,\d{1,3})/g, '');

	if(newNum === isNaN) return 0;
	if(rest.length < digits){
		rest = rest + ('0').repeat(digits - rest.length);
	}else if(rest.length > digits){
		rest = parseFloat(('0.').concat(rest)).toFixed(digits).replace(/^((\d+[.,])+|\d+)(\d{3})?/g, '');
	}else{
		return newNum;
	}

	return newNum.replace(/\.\d+$/, '').concat('.' + rest);
}

export function convertMillisecondsToMinutesSeconds(milliseconds) {
  //return `${Math.floor(milliseconds / 60000)}:${(milliseconds % 60000)}`;
  	if(milliseconds === Infinity) return '00:00';

	const minutes = Math.floor(milliseconds / 60000);
	const seconds = ((milliseconds - (minutes * 60000)) / 1000).toFixed(0);

	if(seconds === 60) {
		minutes = minutes + 1;
		seconds = 0;
	}

	return `${adaptNumTwo(minutes)}:${adaptNumTwo(seconds)}`;
}

export function dateToString(date, type) {
    let newDate = date.toLocaleString();
    newDate = newDate.split('/').map((el, i) => (i === 2 ? el : adaptNumTwo(el)));
    newDate = (type !== 'es') ? newDate.reverse() : newDate;
    return newDate.join('');
}

export function stringToDate(date) {
    let newDate;
    date = quitSpace(date);
    if (!/^\d+\-\d{1,2}\-\d{1,2}$/.test(date))
        return new Date();
    newDate = date.split('-');
    newDate = newDate.map((el) => Number(el));
    return new Date(newDate[2], newDate[1] - 1, newDate[0]);
}