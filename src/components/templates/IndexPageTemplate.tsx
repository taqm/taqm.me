import Link from 'next/link';
import * as React from 'react';

import { Post } from '../../Post';
import MainLayout from '../MainLayout';

type Props = {
  posts: Post[];
};

const IndexPageTemplate: React.VFC<Props> = ({ posts }) => (
  <MainLayout headerProps={{ isTopPage: true }}>
    <h2 className="font-bold text-2xl">記事一覧</h2>
    <ul className="flex flex-wrap py-4">
      {posts.map((post) => (
        <li key={post.slug} className="md:w-1/2 w-full p-1">
          <Link href={`/posts/${post.slug}`}>
            <a className="border-gray-200 border p-3 w-full flex">
              {post.title}
            </a>
          </Link>
        </li>
      ))}
    </ul>
  </MainLayout>
);

IndexPageTemplate.displayName = 'components/templates/IndexPageTemplate';

export default IndexPageTemplate;
