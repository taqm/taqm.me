import * as fs from 'fs';

import { GetStaticPaths, GetStaticProps, NextPage } from 'next';
import Head from 'next/head';
import * as React from 'react';

import OgpTags from '../../src/components/OgpTags';
import ShowPostPageTemplate from '../../src/components/templates/ShowPostPageTemplate';
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
    <>
      <Head>
        <title key="title">{post.title} | taqm&apos;s blog</title>
        <meta name="keywords" content={post?.tags.join(',')} />
        <meta name="description" content={post.description} />
      </Head>
      <OgpTags
        pageUrl={`https://taqm.me/posts/${post.slug}`}
        description={post.description}
        siteName="taqm.me"
        title={`${post.title} | taqm&apos;s blog`}
        image="https://taqm.me/static/site_logo.png"
        type="article"
        twitter={{
          cardType: 'summary',
          site: 'taqm',
        }}
      />
      <ShowPostPageTemplate post={post} content={content} />
    </>
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
