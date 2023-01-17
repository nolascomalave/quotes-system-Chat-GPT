/* Ordena una lista de unidades de medidas por tipo y subtipos gregándolos a un objeto JSON con la siguiente estructura:
	{
		__values: [] // Unidades de medida sin tipo

		// Tipos definidos:
		exampleType: {
			__values: [] // Unidades de medida sin subtipo.
			exampleSubtype: [] // Unidades de medida con subtipo.
		}
	}
*/
export default function helpUnitMeasurementOrderingList(data) {
	let list = {__values: []};

	data.forEach((unit) => {
		let value = { name: unit.name, symbol: unit.symbol, id: unit.id };

		// Si la unidad no tiene tipo, entonces se agrega a la lista de valoles y retorna:
		if(!unit.type) return list.__values.push(value);

		// Si el tipo de la unidad no existe en la lista, entonces agrega el tipo al objeto lista y dale como valor un JSON con lista de valores vacía:
		if(!(unit.type in list)) list[unit.type] = {__values: []};

		// Si la unidad no tiene subtipo, entonces agrégale el valor a la lista de valores del tipo de la unidad:
		if(!unit.sub_type) return list[unit.type].__values.push(value);

		// Si el subtipo de la unidad no existe en la lista, entonces agrega el subtipo al la lista de valores del tipo de la unidad, dale como valor un arreglo que contenga como único elemento la unidad, y retorna:
		if(!(unit.sub_type in list[unit.type])) return list[unit.type][unit.sub_type] = [value];

		// Agrega la unidad al subtipo de la unidad que pertenece al tipo de la misma que se encuentra declarado en la lista.
		list[unit.type][unit.sub_type].push(value);
	});

	return list;
}