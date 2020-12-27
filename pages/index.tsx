import { NextPage, GetStaticProps } from 'next';
import Link from 'next/link';
import * as React from 'react';
import { loadPostFromMDX, Post } from '../src/domains/Post';
import * as fs from 'fs';
import MyHeader from '../src/components/MyHeader';

type Props = {
  posts: Post[];
};

const Index: NextPage<Props> = ({ posts }) => {
  return (
    <div>
      <MyHeader />
      <h1>index page</h1>
      <ul>
        {posts.map((post) => (
          <li key={post.id}>
            <Link href={'/posts/' + post.id}>{post.title}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

Index.displayName = 'pages/Index';

export const getStaticProps: GetStaticProps<Props> = async () => {
  const postPaths = await fs.promises.readdir('./posts');
  const postMetas = postPaths.map((fp) => {
    const { post } = loadPostFromMDX(fp.replace('.mdx', ''));
    return post;
  });
  return {
    props: {
      posts: postMetas,
    },
  };
};

export default Index;
