import Head from 'next/head';

// Layout:
import Layout from '../../components/sections/Layout';

// Components:
import MainContainer from '../../components/sections/MainContainer';
import AddItemButton from '../../components/AddItemButton';

// Material Icons:
import AddIcon from '@mui/icons-material/Add';

export default function AddQuotes() {
  return (
    <Layout>
      <Head>
        <title>{process.env.SITE_NAME} - Quotes</title>
      </Head>
      <MainContainer id='Quotes'>
        Hola
        <AddItemButton>
          <AddIcon/>
        </AddItemButton>
      </MainContainer>
    </Layout>
  )
}
