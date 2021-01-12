import Document, { Head, Html, Main, NextScript } from 'next/document';
import * as React from 'react';

import { GA_TRACKING_ID } from '../src/gtag';

export default class extends Document {
  render() {
    return (
      <Html lang="ja">
        <Head>
          {/* eslint-disable-next-line @typescript-eslint/no-use-before-define */}
          <Gtag />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

const Gtag = () => {
  if (!GA_TRACKING_ID) {
    console.warn('not found GA_TRACKING_ID');
    return null;
  }

  return (
    <>
      <script
        async
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
      />
      <script
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_TRACKING_ID}', {
              page_path: window.location.pathname,
            });
          `
            .replace(/ {2,}/g, ' ')
            .replace(/\n/g, ''),
        }}
      />
    </>
  );
};
