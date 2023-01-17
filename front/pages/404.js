import { useContext, useEffect } from 'react';
import Router from 'next/router';
import { checkCookies } from 'cookies-next';

// Layout:
import Layout from '../components/sections/Layout';

// Contexts:
import viewContext from '../contexts/viewContext';

// Utils:
import { serverPropsVerifySession } from '../util/serverGetters';

export default function NotFound() {
    const {viewState} = useContext(viewContext);

    useEffect(()=>{
        if(!checkCookies('user')) Router.push('/login');
    }, []);

    return (
        <Layout>
            <div className={`not-found centerFlex${viewState!==null ? ' hide' : ''}`}>
                <div className='not-found__container'>
                    <img src='/source/not_found.svg' alt='Not Found'/>
                    <h1>Page not found!</h1>
                </div>
            </div>

            <style jsx>{`@import '../styles/NotFound';`}</style>
        </Layout>
    )
}

//export const getServerSideProps = serverPropsVerifySession(async () => ({props:{}}));