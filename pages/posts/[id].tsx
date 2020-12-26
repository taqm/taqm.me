import * as React from 'react';
import { NextPage, GetStaticPaths, GetStaticProps } from 'next';

import * as fs from 'fs';
import { loadPostFromMDX } from '../../src/domains/Post';

type Props = {
  id: string;
};

type QueryParam = {
  id: string;
};

const ShowPost: NextPage<Props> = ({ id }) => {
  const { post, Component } = loadPostFromMDX(id);
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
  const id = ctx.params?.id!;
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
