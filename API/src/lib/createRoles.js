import Role from '../models/Role';
const {EventEmitter}=require('events');

const rolesArray=[
    'master',
    'admin',
    'user'
], rolesEmiter=new EventEmitter();

async function verifyRole(role, roles){
    if(!roles.some(el => el.role==role)) await Role.create({role});
};

async function createRoles(){
    let actualRoles=await Role.find();

    await rolesArray.forEach(async (el)=>{
        await verifyRole(el, actualRoles);
    });

    setTimeout(()=>{
        require('./createAdmin').start();
    }, 5000);
}

class CreateRoles {
    constructor(emiter){
        this.emiter=emiter;
    }

    start(){
        this.emiter.emit('create-roles');
    }
};

rolesEmiter.once('create-roles', async () =>{
    await createRoles();
});

module.exports=new CreateRoles(rolesEmiter);