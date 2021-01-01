import * as fs from 'fs';

import { GetStaticPaths, GetStaticProps, NextPage } from 'next';
import hydrate from 'next-mdx-remote/hydrate';
import renderToString from 'next-mdx-remote/render-to-string';
import * as React from 'react';

import { getPostWithContentBySlug } from '../../src/core/mdx-post';
import { deserializePost, SerializedPost, serializePost } from '../../src/Post';

type Props = {
  post: SerializedPost;
  source: unknown;
};

type PathParams = {
  slug: string;
};

const ShowPost: NextPage<Props> = ({ post: serializedPost, source }) => {
  const post = deserializePost(serializedPost);
  const content = hydrate(source, {});
  return (
    <div>
      <div>{post.title}</div>
      <div>{post.slug}</div>
      {content}
    </div>
  );
};

ShowPost.displayName = 'pages/posts/[slug]';

export const getStaticProps: GetStaticProps<Props, PathParams> = async (
  ctx,
) => {
  if (ctx.params === undefined) {
    return { notFound: true };
  }
  const { content, ...post } = getPostWithContentBySlug(ctx.params.slug);
  return {
    props: {
      post: serializePost(post),
      source: await renderToString(content),
    },
  };
};

export const getStaticPaths: GetStaticPaths<PathParams> = async () => {
  const posts = await fs.promises.readdir('./posts');
  return {
    paths: posts.map((fp) => ({ params: { slug: fp.replace('.mdx', '') } })),
    fallback: false,
  };
};

export default ShowPost;
