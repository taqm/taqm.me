import { AppProps } from 'next/app';
import Head from 'next/head';
import * as React from 'react';

import 'tailwindcss/tailwind.css';
import 'prismjs/themes/prism-okaidia.css';
import '../src/styles/post.css';

const App = ({ Component, pageProps }: AppProps): JSX.Element => (
  <>
    <Head>
      <meta name="robots" content="nofollow noindex" />
    </Head>
    <Component {...pageProps} />
  </>
);

export default App;
