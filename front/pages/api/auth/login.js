import { serialize } from "cookie";
import { ServerFetch } from '../../../util/Fetching';

const secret = process.env.SECRET;

export default async function (req, res) {
  const { username, password } = req.body;
  const ftc = new ServerFetch();

  try{
    let data=null;
    console.log(process.env.API+'login');
    let response = await ftc.post({
        url:process.env.API+'server-auth',
        data: { username, password },
        timeout: 120000
    });

    if(ftc.isStatus(response.status, 200, 406, 500)){
        data = await response.json();
        if(response.status === 200){
          const serialised = serialize("x-access-token", data.token, {
            httpOnly: true,
            secure: process.env.ENV !== "development",
            maxAge: 60 * 60 * 24,
            sameSite: 'strict',
            path: "/",
          });

          res.setHeader("Set-Cookie", serialised);
        }

        if('token' in data) delete data.token;

        res.status(response.status).json(data);
    }
  }catch(e){
    console.error(e);
    return res.status(500).json({
      data: null,
      errors: (typeof e === 'object' && !Array.isArray(e)) ? {...e} : {messaje:'hola'},
      message: ftc.aborted() ? 'API request timeout has expired!' : 'An unexpected error has occurred!'
    });
  }
}