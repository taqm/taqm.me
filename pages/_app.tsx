import { AppProps } from 'next/app';
import Head from 'next/head';
import { useRouter } from 'next/router';
import * as React from 'react';

import * as gtag from '../src/gtag';

import 'tailwindcss/tailwind.css';
import 'prismjs/themes/prism-okaidia.css';
import '../src/styles/global.css';
import '../src/styles/post.css';

const App = ({ Component, pageProps }: AppProps): JSX.Element => {
  const router = useRouter();
  React.useEffect(() => {
    const handleRouteChange = (url: string) => {
      setTimeout(() => gtag.pageview(url));
    };
    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);
  return (
    <>
      <Head>
        <meta name="robots" content="nofollow noindex" />
      </Head>
      <Component {...pageProps} />
    </>
  );
};

export default App;
