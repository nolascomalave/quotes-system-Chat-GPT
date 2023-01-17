import styles from '../styles/global.scss';
import { Provider as ReduxProvider } from 'react-redux';
import { store } from '../app/store.js';
import { SnackbarProvider } from 'notistack';

// Contexts:
import {AlertsContextProvider} from '../contexts/alertsContext';
import {ViewContextProvider} from '../contexts/viewContext';
import {GlobalLoaderContextProvider} from '../contexts/globalLoaderContext';
import {BreadcrumbsContextProvider} from '../contexts/breadcrumbsContext';
import {SessionContextProvider} from '../contexts/SessionContext';
import {ProviderRequirePasswordAlert} from '../contexts/requirePasswordAlert';

/* import {useState} from 'react';
import styles from '../styles/global.scss';
import Head from 'next/head';
import { SnackbarProvider } from 'notistack';

// Components:
import Body from '../components/sections/Body';
import Header from '../components/sections/Header';
import Menu from '../components/sections/Menu';
import Notifications from '../components/sections/Notifications';
import MobileMenu from '../components/sections/MobileMenu';

// Contexts:
import {ViewContextProvider} from '../contexts/viewContext';
import {AlertsContextProvider} from '../contexts/alertsContext';

function MyApp({ Component, pageProps }) {
  const [menuState, setMenuState]=useState(false);

  return (
    <>
      <Head>
        <link rel='icon' type="image/png" sizes='16x16' href="/logo.png"/>
        <title>{process.env.SITE_NAME}</title>
      </Head>
      <BreadcrumbsContextProvider>
        <ViewContextProvider>
          <GlobalLoaderContextProvider>
            <AlertsContextProvider>
              <SnackbarProvider>
                <Menu menuState={menuState} />
                <Body>
                  <Header menuState={menuState} setMenuState={setMenuState} />
                  <MobileMenu/>
                  <Notifications/>
                  <Component {...pageProps} />
                </Body>
              </SnackbarProvider>
            </AlertsContextProvider>
          </GlobalLoaderContextProvider>
        </ViewContextProvider>
      </BreadcrumbsContextProvider>
    </>
  );
} */

const MyApp=({ Component, pageProps })=>{
  return (
    <ReduxProvider store={store}>
      <SnackbarProvider>
        <ViewContextProvider>
          <GlobalLoaderContextProvider>
            <SessionContextProvider>
              <AlertsContextProvider>
                <ProviderRequirePasswordAlert>
                  <BreadcrumbsContextProvider>
                    <Component {...pageProps} />
                  </BreadcrumbsContextProvider>
                </ProviderRequirePasswordAlert>
              </AlertsContextProvider>
            </SessionContextProvider>
          </GlobalLoaderContextProvider>
        </ViewContextProvider>
      </SnackbarProvider>
    </ReduxProvider>
  );
};

export default MyApp;