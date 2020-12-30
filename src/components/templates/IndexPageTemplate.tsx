import Link from 'next/link';
import * as React from 'react';

import { Post } from '../../Post';
import MyHeader from '../MyHeader';

type Props = {
  posts: Post[];
};

const IndexPageTemplate: React.VFC<Props> = ({ posts }) => (
  <>
    <MyHeader isTopPage />
    <main>
      <h2>記事一覧</h2>
      <ul className="flex">
        {posts.map((post) => (
          <li key={post.slug}>
            <Link href={`/posts/${post.slug}`}>{post.title}</Link>
          </li>
        ))}
      </ul>
    </main>
  </>
);

IndexPageTemplate.displayName = 'components/templates/IndexPageTemplate';

export default IndexPageTemplate;
