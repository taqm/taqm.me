import * as fs from 'fs';

import { GetStaticPaths, GetStaticProps, NextPage } from 'next';
import * as React from 'react';

import { loadPostWithMDX } from '../../src/domains/Post';

type Props = {
  id: string;
};

type QueryParam = {
  id: string;
};

const ShowPost: NextPage<Props> = ({ id }) => {
  const { post, Component } = loadPostWithMDX(id);
  return (
    <div>
      <div>{post.title}</div>
      <div>{post.id}</div>
      <Component />
    </div>
  );
};

ShowPost.displayName = 'pages/posts/[slug]';

export const getStaticProps: GetStaticProps<Props, QueryParam> = async (
  ctx,
) => {
  if (ctx.params === undefined) {
    return { notFound: true };
  }
  const { id } = ctx.params;
  return {
    props: { id },
  };
};

export const getStaticPaths: GetStaticPaths<QueryParam> = async () => {
  const posts = await fs.promises.readdir('./posts');
  return {
    paths: posts.map((fp) => ({ params: { id: fp.replace('.mdx', '') } })),
    fallback: false,
  };
};

export default ShowPost;
