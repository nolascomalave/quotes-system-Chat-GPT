import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import './lib/dbConnection';


// -----------------------------------------------------------------------------
// -- dotenv.config() se ejecuta en el script de conexión de la base de datos --
// -----------------------------------------------------------------------------

// Settings:
const app = express(),
    session = require('express-session'),
    MongoStore = require('connect-mongo');

app.set('port', process.env.DEV_PORT);


// Session Middleware:
const sessionMiddleware = session({
    /* store: MongoStore.create({
        mongoUrl: process.env.MONGO_URI,
        autoRemove: 'native'
    }), */
    key: process.env.SESSION_KEY,
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    /*cookie: {
        sameSite: false,
        httpOnly: false
    } */
});


// Middlewares:
app.use(require('cors')({credentials: true, origin: ['http://localhost:3001']}));
app.use(express.urlencoded({extended:false}));
app.use(express.json());
app.use(sessionMiddleware);
// app.use(cookieParser());
app.use(require('./middlewares/provideToken'));


// Static Files:
app.use(express.static(path.join(__dirname, 'public')));


// Routes:
app.use(require('./routes/auth'));

    // Middleware que protege las rutas si no hay token de usuario:
    app.use(require('./middlewares/verifyToken'));

app.use('/products', require('./routes/products'));
app.use('/areas', require('./routes/areas'));
app.use('/jobs', require('./routes/jobs'));
app.use('/clients', require('./routes/clients'));

    // Middleware que protege las rutas si el usuario no es "master" o "admin":
    //app.use(require('./middlewares/verifiqueRoles')('master', 'admin'));

app.use('/users', require('./routes/users'));
app.use('/roles', require('./routes/roles'));


// Not Found:
app.use((req, res)=>{
    res.status(404).json({message:'Not found!'});
});

export default app;