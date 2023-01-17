import Role from '../../../models/role';
export const config = {
    api: {
      bodyParser: {
          sizeLimit: '1mb'
      },
    },
}

export default async function handler(req, res) {
    if(req.method.toUpperCase()==='GET'){
        try{
            return res.status(200).json(await Role.find());
        }catch(e){
            return res.status(500).json({message: 'An error occurred while querying the database!', error:e});
        }
    }else{
        return res.status(405).send('Method Not Allowed');
    }
}