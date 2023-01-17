import fs from 'fs';
import path from 'path';
import { hashSync } from 'bcryptjs';
import User from '../models/User';

// Services:
import mailer from './mailer';

// Utils:
import HandlerErrors from '../util/HandlerErrors';
import { getRandomString } from '../util/formats';
import renderString from '../util/renderString';
import { base64_encode } from '../util/functionals';

//const logo = base64_encode(path.resolve(__dirname, '../public/icons/logo.png'));
//console.log(logo);

export async function resetPassword(userId){
	// Template:
	const generalTemplate = fs.readFileSync(path.resolve(__dirname, '../public/info.mail.html'), {encoding:'utf8'});

	let errors = new HandlerErrors();

	try{
		let newPassword = getRandomString(8),
			hashPass = hashSync(newPassword, 10),
			user = await User.findById(userId);

		user.password = hashPass;

		await user.save();

		// await User.findByIdAndUpdate(userId, { password: newPassword });

		if(!(user.username === 'admin')){
			let htmlVars = {
					HTML: `Hello, ${user.names.first} ${user.names.second}.
						<p>Your new password has been generated to enter the quotation system. We recommend that, once you log in to the system, you change this temporary password to one that you will remember.</p>
						<h2 style="margin-top: 1em">Your new password: <u>${newPassword}</u></h2>`,
					Title: 'Security',
					Subtitle: 'Password renewal'
			};

			let html = renderString(generalTemplate, htmlVars);

			await mailer({
				to: user.email, // list of receivers
				subject: "Password renewal.", // Subject line
				html: html // html body
			});
		}

		return {errors, message: 'Password updated successfully!', data: newPassword};
	}catch(e){
		console.log(e);
		if(('path' in e) && e.path==='_id'){
			errors.set('userId', 'User not found!');
			return {errors, message: errors.get('userId'), data: null};
		}

		errors.set('server', (typeof e === 'object' && !Array.isArray(e)) ? {...e} : e.toString());
        return {message: 'An error occurred while querying the database!', errors, data: null};
	}
}