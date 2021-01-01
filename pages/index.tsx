import { GetStaticProps, NextPage } from 'next';
import * as React from 'react';

import IndexPageTemplate from '../src/components/templates/IndexPageTemplate';
import { getAllPosts } from '../src/core/mdx-post';
import { deserializePost, SerializedPost, serializePost } from '../src/Post';

type Props = {
  post: SerializedPost[];
};

const Index: NextPage<Props> = ({ post: serializedPosts }) => {
  const posts = React.useMemo(() => serializedPosts.map(deserializePost), [
    serializedPosts,
  ]);
  return <IndexPageTemplate posts={posts} />;
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
