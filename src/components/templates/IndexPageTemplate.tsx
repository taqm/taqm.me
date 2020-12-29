import * as React from 'react';
import MyHeader from '../MyHeader';
import { Post } from '../../domains/Post';
import Link from 'next/link';

type Props = {
  posts: Post[];
};

const IndexPageTemplate: React.VFC<Props> = ({ posts }) => {
  return (
    <>
      <MyHeader isTopPage />
      <main>
        <h2>記事一覧</h2>
        <ul>
          {posts.map((post) => (
            <li key={post.id}>
              <Link href={`/posts/${post.id}`}>{post.title}</Link>
            </li>
          ))}
        </ul>
      </main>
    </>
  );
};

IndexPageTemplate.displayName = 'components/templates/IndexPageTemplate';

export default IndexPageTemplate;
