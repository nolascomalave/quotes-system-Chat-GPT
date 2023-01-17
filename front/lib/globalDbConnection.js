const mongoose=require('mongoose');

// Starting Eviroment Vars:
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
	useUnifiedTopology: true,
	serverSelectionTimeoutMS: 10000
});

const db=mongoose.connection;

db.once('open', ()=>{
    console.log('¡La base de datos ha sido conectada correctamente!');
});

db.once('error', ()=>{
    console.error('¡Ha ocurrido un error al establecer la conexión con la base de datos!');
});

module.exports=db;