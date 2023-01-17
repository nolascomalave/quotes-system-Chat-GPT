import {useRouter} from 'next/router';

export default function useActiveLink(href){
    const {pathname, asPath}=useRouter();
    return href.toLowerCase() === pathname.toLowerCase() || href.toLowerCase() === asPath.toLowerCase();
}