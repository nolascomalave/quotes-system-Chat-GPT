import getConnection from '../lib/getConnection';
import Quote from '../models/Quote';
import Product, { ProductSchema } from '../models/Product';
import Job, { JobSchema } from '../models/Job';
import { ProductController } from '../routes/products.controller';
import { JobController } from '../routes/products.controller';
import HandlerErrors from '../util/HandlerErrors';

// validators:
import {
	validateSimpleText
} from '../util/validators';
import User from '../models/User';

export async function newQuote({
	doc_number,
	id_customer,
	products,
	services,
	coin,
	added_values,
	description,
	notes,
	id_user,
	voice_notes,
	attachments,
}){
	let errors = new HandlerErrors(),
		transact_conn = null
		tSession = null,
		quote = new Quote();

	products = Array.isArray(products) ? products : [];
	services = Array.isArray(services) ? services : [];

	try {
		transact_conn = await getConnection();
		tSession = await transact_conn.startSession();

		errors.merege(validateDocNumber(doc_number));

		if(products.length < 1 && services.length < 1){
			errors.set('products', 'You must define at least one product or service to set up a quote');
			errors.set('services', errors.get('products'));
		}else{
			let productsDefinition = await quoteProducts(products, id_user, null, transact_conn),
				servicesDefinition = await quoteServices(services, id_user, null, transact_conn);
			
			errors.merege(productsDefinition.errors);
			errors.merege(servicesDefinition.errors);

			products = productsDefinition.products;
			services = servicesDefinition.services;
		}

		await tSession.commitTransaction();
	}catch(e){
		if(tSession) await tSession.abortTransaction();
	}

	if(transact_conn){
		tSession.endSession();
		transact_conn.disconnect();
	}
}



// Function than create the products not exists and add the new products and exists products with its params:
export async function quoteProducts(products, user_id, id_quote, transact_conn){
	let errors = new HandlerErrors(),
		tSession = null,
		ProductModel = !transact_conn ? Product : transact_conn.model('Product', ProductSchema);
	
	if(!transact_conn){
		transact_conn = await getConnection();
		tSession = await transact_conn.startSession();
	}

	try {
		products = await products.map(async (prod) => {
			let product = null;

			// if(errors.existsErrors()) return prod;

			if(typeof prod !== 'object' || Array.isArray(prod)) {
				errors.set('products', [...(errors.get('products') ?? []), 'The new product must be defined in JSON format!']);

				return prod;
			} else if(!('product' in prod)){
				// prod must contains: {name, brand?, price, stock, min_stock, moderator_user, cost_price, sale_price}
				product = new ProductController({
					...prod,
					cost_price: '0,01',
					sale_price: (typeof prod.price === 'number') ? prod.price.toSting().replace(/\./g, '.') : prod.price,
					stock: 0,
					min_stock: 0,
					moderatorUser: {_id: user_id},
				});
	
				await product.validate();
	
				if(product.errors){
					errors.set('product', [...(errors.get('products') ?? []), product.errors]);
					return prod;
				}

				product = await product.completed();
			} else {
				product = await ProductModel.findById(prod.product);

				if(!product) {
					errors.set('products', [...(errors.get('products') ?? []), 'Product not found!']);
					return prod;
				}
			}

			prod = {
				...prod,
				name: product.name,
				brand: product.brand,
				model: product.model ?? null
			}

			errors.set('price', validateCuantity({num: prod.price, name: 'price', int: false, required: true}));
			errors.set('quantity', validateCuantity({num: prod.quantity, name: 'quantity', int: false, required: true}));

			if(!errors.exists('price') && !errors.exists('quantity')) prod.total = Number(prod.price) * Number(prod.quantity);

			return prod;
		});

		if(errors.existsErrors()) throw 'errors';

		if(tSession !== null) {
			await tSession.commitTransaction();
			tSession.endSession();
			transact_conn.disconnect();
		}
	} catch(e) {
		if(tSession !== null) {
			await tSession.abortTransaction();
			tSession.endSession();
			transact_conn.disconnect();
		}

		if(e !== 'errors') throw e;
	}

	return {products, errors};
}


export async function servicesDefinition(services, user_id, id_quote, transact_conn){
	let errors = new HandlerErrors(),
		tSession = null,
		JobModel = !transact_conn ? Job : transact_conn.model('Job', JobSchema);
	
	if(!transact_conn){
		transact_conn = await getConnection();
		tSession = await transact_conn.startSession();
	}

	try {
		services = await services.map(async (serv) => {
			let service = null;

			if(errors.existsErrors()) return serv;

			if(typeof serv !== 'object' || Array.isArray(serv)) {
				errors.set('services', [...(errors.get('services') ?? []), 'The new service must be defined in JSON format!']);

				return ser;
			} else if(!('job' in serv)){
				// prod must contains: {name, brand?, price, stock, min_stock, moderator_user, cost_price, sale_price}
				service = new JobController({
					...serv,
					cost_price: '0,01',
					sale_price: (typeof prod.price === 'number') ? prod.price.toSting().replace(/\./g, '.') : prod.price,
					stock: 0,
					min_stock: 0,
					moderatorUser: {_id: user_id},
				});
	
				await service.validate();
	
				if(service.errors){
					errors.set('service', [...(errors.get('services') ?? []), service.errors]);
					return prod;
				}

				service = await service.completed();
			} else {
				product = await JobModel.findById(prod.product);

				if(!product) {
					errors.set('services', [...(errors.get('services') ?? []), 'Product not found!']);
					return prod;
				}
			}

			prod = {
				...prod,
				name: product.name,
				brand: product.brand,
				model: product.model ?? null
			}

			errors.set('price', validateCuantity({num: prod.price, name: 'price', int: false, required: true}));
			errors.set('quantity', validateCuantity({num: prod.quantity, name: 'quantity', int: false, required: true}));

			if(!errors.exists('price') && !errors.exists('quantity')) prod.total = Number(prod.price) * Number(prod.quantity);

			return prod;
		});

		if(tSession !== null) {
			await tSession.commitTransaction();
			tSession.endSession();
			transact_conn.disconnect();
		}
	} catch(e) {
		if(tSession !== null) {
			await tSession.abortTransaction();
			tSession.endSession();
			transact_conn.disconnect();
		}
	}

	return {products, errors};
}




// validations:
export async function validateDocNumber(doc_number, id_quote){
	let errors = new HandlerErrors();

	errors.set('doc_number', validateSimpleText(doc_number, 'document number', 2, 20, true));

	if(errors.existsErrors()) return errors;

	if(/^[a-z0-9-_]+$/i.test(doc_number.trim())) errors.set('doc_number', `The document number only accepts numbers and letters, hyphens and underscores!`);

	if(errors.existsErrors()) return errors;

	let query = !!id_quote ? {$and: [
			{_id: {$ne: id_quote}},
			{doc_number: doc_number.toUpperCase()}
		]} : {doc_number: doc_number.toUpperCase()};

	let existDocNumber = await Quote.count(query);

	if(existDocNumber > 0) errors.set('doc_number', `Another quote containing the same document number already exists, you must define a different document number!`);

	return errors;
}