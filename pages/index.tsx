import { GetStaticProps, NextPage } from 'next';
import Head from 'next/head';
import * as React from 'react';

import OgpTags from '../src/components/OgpTags';
import IndexPageTemplate from '../src/components/templates/IndexPageTemplate';
import { getAllPosts } from '../src/core/markdown';
import { deserializePost, SerializedPost, serializePost } from '../src/Post';

type Props = {
  post: SerializedPost[];
};

const Index: NextPage<Props> = ({ post: serializedPosts }) => {
  const posts = React.useMemo(() => serializedPosts.map(deserializePost), [
    serializedPosts,
  ]);
  const tags = new Set(
    posts.reduce<string[]>((acc, cur) => [...acc, ...(cur?.tags ?? [])], []),
  );
  return (
    <>
      <Head>
        <title key="title">taqm&apos;s blog</title>
        <meta name="keywords" content={Array.from(tags).join(',')} />
        <meta
          name="description"
          content="個人的なブログです。プログラミングやその他趣味についてまとめます。"
        />
      </Head>
      <OgpTags
        pageUrl="https://taqm.me"
        description="個人的なブログです。プログラミングやその他趣味についてまとめます。"
        siteName="taqm.me"
        title="taqm's blog"
        image="https://taqm.me/static/site_logo.png"
        type="website"
        twitter={{
          cardType: 'summary',
          site: 'taqm',
        }}
      />
      <IndexPageTemplate posts={posts} />
    </>
  );
};

Index.displayName = 'pages/Index';

export const getStaticProps: GetStaticProps<Props> = async () => {
  const posts = await getAllPosts();
  const serializedPosts = posts.map(serializePost);
  return {
    props: { post: serializedPosts },
  };
};

export default Index;
