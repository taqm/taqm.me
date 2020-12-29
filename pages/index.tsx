import { NextPage, GetStaticProps } from 'next';
import * as React from 'react';
import { loadPostFromMDX, Post } from '../src/domains/Post';
import * as fs from 'fs';
import IndexPageTemplate from '../src/components/templates/IndexPageTemplate';

type Props = {
  posts: Post[];
};

const Index: NextPage<Props> = ({ posts }) => {
  return <IndexPageTemplate posts={posts} />;
};

Index.displayName = 'pages/Index';

export const getStaticProps: GetStaticProps<Props> = async () => {
  const postPaths = await fs.promises.readdir('./posts');
  const posts = postPaths.map((fp) => {
    const { post } = loadPostFromMDX(fp.replace('.mdx', ''));
    return post;
  });
  return {
    props: { posts },
  };
};

export default Index;
