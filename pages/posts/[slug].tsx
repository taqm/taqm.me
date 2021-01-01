import * as fs from 'fs';

import { GetStaticPaths, GetStaticProps, NextPage } from 'next';
import * as React from 'react';

import {
  getPostWithContentBySlug,
  markdownToHtml,
} from '../../src/core/markdown';
import { deserializePost, SerializedPost, serializePost } from '../../src/Post';

type Props = {
  post: SerializedPost;
  content: string;
};

type PathParams = {
  slug: string;
};

const ShowPost: NextPage<Props> = ({ post: serializedPost, content }) => {
  const post = deserializePost(serializedPost);
  return (
    <div>
      <div>{post.title}</div>
      <div>{post.slug}</div>
      {/* eslint-disable-next-line react/no-danger */}
      <div dangerouslySetInnerHTML={{ __html: content }} />
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
      content: markdownToHtml(content),
    },
  };
};

export const getStaticPaths: GetStaticPaths<PathParams> = async () => {
  const posts = await fs.promises.readdir('./posts');
  return {
    paths: posts.map((fp) => ({ params: { slug: fp.replace(/.md/, '') } })),
    fallback: false,
  };
};

export default ShowPost;
