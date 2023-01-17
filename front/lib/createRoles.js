const {EventEmitter}=require('events');
const Role=require('../models/Role');

const rolesArray=[
    'master',
    'admin',
    'user',
    'client'
], rolesEmiter=new EventEmitter();

async function verifyRole(role, roles){
    if(!roles.some(el => el.role==role)) await Role.create({role});
};

async function createRoles(){
    let actualRoles=await Role.find();

    await rolesArray.forEach(async (el)=>{
        await verifyRole(el, actualRoles);
    });
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