import * as fs from 'fs';

import { GetStaticProps, NextPage } from 'next';
import * as React from 'react';

import IndexPageTemplate from '../src/components/templates/IndexPageTemplate';
import { loadPostWithMDX, Post } from '../src/domains/Post';

type Props = {
  posts: Post[];
};

const Index: NextPage<Props> = ({ posts }) => (
  <IndexPageTemplate posts={posts} />
);

Index.displayName = 'pages/Index';

export const getStaticProps: GetStaticProps<Props> = async () => {
  const postPaths = await fs.promises.readdir('./posts');
  const posts = postPaths.map((fp) => {
    const { post } = loadPostWithMDX(fp.replace('.mdx', ''));
    return post;
  });
  return {
    props: { posts },
  };
};

export default Index;
