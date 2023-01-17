export default function renderString(text: string, vars: any): string {
	if((typeof vars !== 'object') || Array.isArray(vars)) return text;

	let matches: RegExpMatchArray | null = text.match(/{{ *(BOOLEAN:)?\w+ *}}/g);

	if(!matches) return text;

	matches.forEach(el => {
		el = el.replace(/({{ *(BOOLEAN:)?| *}})/g, '');

		if(!(el in vars)) return;

		let regExp: RegExp = eval(`/{{ *${el} *}}/g`);
		text = text.replace(regExp, vars[el]);

		let booleanVal = '<div class="boolean-val ' + (!vars[el] ? 'false' : 'true') + '"></div>';

		regExp = eval(`/{{ *BOOLEAN:${el} *}}/g`);
		text = text.replace(regExp, vars[el]);
	});

	return text;
}