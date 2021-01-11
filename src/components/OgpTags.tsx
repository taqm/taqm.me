import Head from 'next/head';
import * as React from 'react';

type Props = {
  title: string;
  pageUrl: string;
  type: 'website' | 'article';
  description: string;
  image: string;
  siteName: string;
  twitter?: {
    cardType: 'summary';
    site: string;
  };
};

const OgpTags: React.VFC<Props> = ({
  title,
  pageUrl,
  type,
  description,
  image,
  siteName,
  twitter,
}) => (
  <Head>
    <meta property="og:url" content={pageUrl} />
    <meta property="og:type" content={type} />
    <meta property="og:title" content={title} />
    <meta property="og:image" content={image} />
    <meta property="og:description" content={description} />
    <meta property="og:site_name" content={siteName} />

    {twitter && (
      <>
        <meta name="twitter:card" content={twitter.cardType} />
        <meta name="twitter:site" content={twitter.site} />
      </>
    )}
  </Head>
);

export default OgpTags;
