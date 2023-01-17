// Layout:
import Layout from '../components/sections/Layout';

// Utils:
import { serverPropsVerifySession } from '../util/serverGetters';

export default function Home() {
  return (
    <Layout>
    </Layout>
  );
}

export const getServerSideProps=serverPropsVerifySession();