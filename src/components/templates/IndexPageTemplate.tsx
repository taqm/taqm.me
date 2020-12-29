import Link from 'next/link';
import * as React from 'react';

import { Post } from '../../domains/Post';
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
          <li key={post.id}>
            <Link href={`/posts/${post.id}`}>{post.title}</Link>
          </li>
        ))}
      </ul>
    </main>
  </>
);

IndexPageTemplate.displayName = 'components/templates/IndexPageTemplate';

export default IndexPageTemplate;
