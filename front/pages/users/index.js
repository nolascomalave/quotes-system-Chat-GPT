import {useState, useEffect, useRef, useReducer} from 'react';
import Head from 'next/head';
import {AbortController} from 'node-abort-controller';
import { useSnackbar } from 'notistack';

// Utils:
import { getServerData, serverPropsVerifySession } from '../../util/serverGetters';
import { parseFetchToken } from '../../util/functionals';

// Layout:
import Layout from '../../components/sections/Layout';

// Components:
import MainContainer from '../../components/sections/MainContainer';
import MainSection from '../../components/MainSection';
import RequirePasswordAlert from '../../components/RequirePasswordAlert';
import UserCard from '../../components/UserCard';
import AddItemButton from '../../components/AddItemButton';
import Input from '../../components/floatLabel/Input';
import Loader from '../../components/Loader';

// Material Icons:
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';

// Reducers:
import usersOpReducer, {initialState} from '../../reducers/usersOpReducer';
import TYPES from '../../reducers/usersOpReducer.types';

// Const's:
const initialSearchData = {status:0, data:null, error:null, message:null};


export default function Users({users:usersData}) {
    // Reducer:
    const [state, dispatch]=useReducer(usersOpReducer, {...initialState, users: usersData});
    const { enqueueSnackbar }=useSnackbar();

    const [searchShow, setSearchShow]=useState(false);
    const [search, setSearch]=useState('');
    const [searchData, setSearchData]=useState(initialSearchData);
    const [searchInterval, setSearchInterval] = useState();
    const [aborter, setAborter] = useState(new AbortController());
    const [loading, setLoading] = useState(false);
    const searchInput=useRef();
    const passwordInput=useRef();

    const handleSearch=async (aborter)=>{
      setTimeout(()=> aborter.abort(), 60000);
      setLoading(true);
      let result={...initialSearchData, status:0};

      try{
          let res=await fetch(`${process.env.API+'users'}${search ? '?search='+search : ''}`, parseFetchToken({signal:aborter.signal}));
          let data=null;

          switch(res.status){
            case 200:
              data=await res.json();
              result={...result, data: data.data};
              break;

            case 400:
              data=await res.json();
              result={...result, error:data.message, message:data.message};
              break;

            case 404:
              result={...result, error:'API not found!', message:'API not found!'};
              break;

            case 500:
              data=await res.json();
              result={...result, error:data.message, message:data.message};
              break;

            default:
              result={...result, error:'Failed to establish connection to server!', message:'Failed to establish connection to server!'};
              break;
          }

          result.status=res.status;
      }catch(e){
          result.error=typeof e==='object' && (!Array.isArray(e) && {...e});
          result.message=aborter.signal.aborted ? 'API request timeout has expired!' : 'Failed to establish connection to server!';
      }
      setLoading(false);
      setSearchData(result);
    }

    useEffect(()=>{
      if(typeof searchInterval === 'number') setSearchInterval(clearInterval(searchInterval));

      if(search.trim().length>1){
          if(aborter.signal.aborted==true) setAborter(new AbortController());
          setSearchInterval(setTimeout(async ()=> await handleSearch(aborter), 750));
      }else{
        setSearchData(initialSearchData);
        if(loading===true) setLoading(false);
      }
    }, [search]);

    const changeUserState = async ()=>{
        if(!state.password.value){
          dispatch({type:TYPES.CHANGE_PASSWORD, payload:{value:state.password.value, error:'The password is required!'}});
        }else{
          const aborter=new AbortController(), body=new FormData();
          setTimeout(()=>aborter.abort(), 30000);

          body.append('id_user', state.userToModify.id);
          body.append('userPass', state.password.value);

          try{
            const res=await fetch(process.env.API+'users/'+(state.operationIsDelete ? '' : state.userToModify._enable ? 'disable' : 'enable'), parseFetchToken({
                method:state.operationIsDelete ? 'DELETE' : 'PATCH',
                body
            }));
            let data=null, {status}=res;

            if(status===200 || status===401 || status===403 || status===404 || status===406 || status===500) data=await res.json();

            switch(res.status){
              case 200:
                //serviceWorker.postMessage("ali");
                if(!state.operationIsDelete){
                  dispatch({type: TYPES.CHANGE_USERS_STATE, payload:state.users.data.map(el=>{
                    if(el.id===state.userToModify.id) el._enable=!el._enable;
                    return el;
                  })});
                  if(searchData.data) setSearchData({...searchData, data:searchData.data.map(el=>{
                    if(el.id===state.userToModify.id) el._enable=!el._enable;
                    return el;
                  })});
                }else{
                  dispatch({type: TYPES.CHANGE_USERS_STATE, payload:state.users.data.filter(el => el.id!==state.userToModify.id)});
                  if(searchData.data) setSearchData({...searchData, data:searchData.data.filter(el => el.id!==state.userToModify.id)});
                }

                enqueueSnackbar(data.message, {variant:'success'});
                break;

              case 401:
                enqueueSnackbar(data.message, {variant:'warning'});
                break;

              case 403:
                enqueueSnackbar(data.message, {variant:'warning'});
                break;

              case 404:
                enqueueSnackbar(data.message, {variant:'error'});
                break;

              case 406:
                let message= data.errors ?
                Object.keys(data.errors).length>0 ?
                data.errors.password &&
                data.errors.password :
                data.errors[Object.keys(data.errors)[0]] :
                data.message;

                enqueueSnackbar(message, {variant:'error'});
                break;

              case 500:
                enqueueSnackbar(data.message, {variant:'error'});
                break;

              default:
                enqueueSnackbar('Unexpected response!', {variant:'error'});
                break;
            }
          }catch(e){
            let message=aborter.signal.aborted ? 'API request timeout has expired!' : 'Failed to establish connection to server!';
            enqueueSnackbar(message, {variant:'error'});
          }
          dispatch({type:TYPES.CLEAR_SELECTED_USER});
        }
    }

    const handleAbailability=(user, deleteUser)=>{
      dispatch({type:TYPES.ADD_SELECTED_USER, payload:{user, delete:deleteUser}});
    };

    const setRequirePassword=(stateRequirePassword)=>{
      dispatch({type:TYPES.CHANGE_REQUIRE_PASSWORD, payload:stateRequirePassword});
    }

  return (
    <Layout>
      <Head>
        <title>{process.env.SITE_NAME} - Users</title>
      </Head>
      <MainContainer id='Users'>
        <div className={`main-header bettwenFlex${searchShow ? ' open-search' : ''}`}>
            <h2>
              {searchData!==initialSearchData ? 'Search Result:' : 'All Users'}
            </h2>
            <div className="search-input startFlex">
              {!searchShow ? (
                <button
                    className='startFlex'
                    onClick={()=> {
                      setSearchShow(true);
                      searchInput.current.focus();
                    }}
                >
                    <SearchIcon/>
                </button>
              ) : (
                <button
                    className='startFlex'
                    onClick={()=>{
                      setSearchShow(false);
                      setSearch('');
                      if(aborter.signal.aborted==true) setAborter(new AbortController());
                      setSearchData(initialSearchData);
                      if(loading===true) setLoading(false);
                    }}
                >
                    <CloseIcon/>
                </button>
              )}
              <input
                type='text'
                ref={searchInput}
                value={search}
                placeholder="Search..."
                onChange={(e)=> setSearch(e.target.value)}
                onBlur={()=> search.length<1 ? setSearchShow(false) : null}
              />
            </div>
        </div>
        <MainSection
          className={`main-content${loading ? ' hide' : (searchData!==initialSearchData ? ' hide' : '')}`}
          error={state.users.error}
          message={state.users.message ? state.users.message : state.users.data!=null ? state.users.data.length<1 ? 'No users found!' : null : null}
        >
          {state.users.data && state.users.data.map((el)=><UserCard key={el.id} user={el} handleAbailability={handleAbailability} />)}
        </MainSection>
        <MainSection
          className={`main-search${loading ? ' hide' : searchData===initialSearchData ? ' hide' : ''}`}
          error={searchData.error}
          message={searchData.message ? searchData.message : searchData.data!=null ? searchData.data.length<1 ? 'No users found!' : null : null}
        >
          {searchData.data && searchData.data.map((el)=><UserCard key={el.id} user={el} handleAbailability={handleAbailability} />)}
        </MainSection>

        <div className={`loader-section${loading ? ' show' : ''}`}>
          <Loader/>
        </div>
        <AddItemButton>
          <AddIcon/>
        </AddItemButton>
      </MainContainer>
      <RequirePasswordAlert
          acceptAction={{action:changeUserState, close:false}}
          open={()=> passwordInput.current.focus()}
          close={state.closeRequirePassword}
          show={state.requirePassword}
          setShow={setRequirePassword}
          title='Are you sure?'
          message={state.operationMessage}
      >
          <Input
            type="password"
            reference={passwordInput}
            label="Password"
            value={state.password.value}
            error={state.password.error}
            required={true}
            onChange={(e)=>dispatch({type:TYPES.CHANGE_PASSWORD, payload:{value:e.target.value, error:null}})}
          />
      </RequirePasswordAlert>
    </Layout>
  );
}

/* export async function getServerSideProps(context) {
  let data={data:null, error:null, message:null};
  let fetcher=new ServerFetch();

  try{
    let res=await fetcher.get({
      url:process.env.API+'users',
      timeout: 30000
    });

    let response=null, isAccepted=isStatus(res.status, 200, 403, 404, 500);

    if(isAccepted){
      response=await res.json();

      data=res.status=== 200 ? ({
        ...data,
        data:response.length<1 ? null : response,
        message:response.length<1 ? 'Users not found!' : null
      }) : ({
        ...data,
        message:response.message,
        error:response.message
      });
    }else{
      data={...data, message:'Unexpected response!', error:'Unexpected response!'};
    }
  }catch(e){
    data={
      ...data,
      error: fetcher.aborted() ? 'API request timeout has expired!' : 'Failed to establish connection to server!'
    };

    data.message=data.error;
  }

  return {
    props:{users:data} // will be passed to the page component as props
  }
} */

/* export async function getServerSideProps(context) {
  return {
    props:{
      users: await getServerData('users', 30000)
    }
  }
}; */

export const getServerSideProps=serverPropsVerifySession(async function(ctx){
  let {req, res}=ctx;

  return {
    props:{
      users: await getServerData('users', 30000, {req, res})
    }
  }
}, {users:'data'});