import app from './app';

// Startin Server:
app.listen(app.get('port'), ()=> console.log(`Servidor iniciado correctamente en el puerto "${app.get('port')}"`));