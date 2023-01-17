// const globalDb=require('./lib/globalDbConnection');
// const createRoles=require('./lib/createRoles');
const path=require('path');
const {PHASE_DEVELOPMENT_SERVER}=require('next/constants');
const os=require('os');

const networkInterfaces=os.networkInterfaces();
let ip='127.0.0.1', newIp=ip;

for(let i in networkInterfaces){
  for(let eth of networkInterfaces[i]){
    if(/^(\d{1,3}(\.)?){4}$/.test(eth.address) && eth.address!==ip){
      newIp=eth.address;
      break;
    }
  }
  if(newIp!==ip){
    ip=newIp;
    break;
  }
}


//globalDb.once('open', ()=> createRoles.start());

module.exports = async (phase) =>{
  const isDevelopment = PHASE_DEVELOPMENT_SERVER === phase;

  return {
    reactStrictMode: true,

    sassOptions: {
      includePaths: [path.join(__dirname, 'styles')],
    },

    env:{
      API:'https://'+ip+':3000/',
      SITE_NAME: 'N.E. Quotes System',
      MONGODB_URI: isDevelopment ? process.env.MONGODB_URI : '',
      FILES_ROUTE: path.join(__dirname, '/uploads'),
      PUBLIC_ROUTE: path.join(__dirname, '/public'),
      ENV: isDevelopment ? 'development' : 'production'
    }
  };
};
