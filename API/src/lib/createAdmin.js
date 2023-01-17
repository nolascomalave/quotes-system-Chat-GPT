import Role from '../models/Role';
import User from '../models/User';
const {EventEmitter}=require('events');
const {hashSync}=require('bcryptjs');

const createMaster=new EventEmitter();

async function createMasterUser(){
    let masterRole=await Role.findOne({role:'master'});
    let master=await User.findOne({username:'ADMIN'});

    try{
        if(!master) master=await User.create({
            username:'ADMIN',
            names:{
                first:'admin',
                second:null
            },
            lastnames:{
                first:'admin',
                second:null
            },
            gender:'Male',
            SSN:'000000000',
            email:'admin@admin.admin',
            phones:{
                primary:1111111111,
                secondary:null
            },
            adress:'admin',
            password:hashSync('admin',10),
            roles:[masterRole._id],
            _enable:true,
            createdBy:null,
            updatedBy:null
        });
    }catch(e){
        console.log(e);
    }
}

class CreateMaster {
    constructor(emiter){
        this.emiter=emiter;
    }

    start(){
        this.emiter.emit('create-master');
    }
};

createMaster.once('create-master', async () =>{
    await createMasterUser();
});

module.exports=new CreateMaster(createMaster);