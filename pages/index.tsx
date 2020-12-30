import { GetStaticProps, NextPage } from 'next';
import * as React from 'react';

import IndexPageTemplate from '../src/components/templates/IndexPageTemplate';
import { getAllPosts, Post } from '../src/Post';

type Props = {
  posts: Post[];
};

const Index: NextPage<Props> = ({ posts }) => (
  <IndexPageTemplate posts={posts} />
);

Index.displayName = 'pages/Index';

export const getStaticProps: GetStaticProps<Props> = async () => {
  const posts = await getAllPosts();
  return {
    props: { posts },
  };
};

export default Index;
