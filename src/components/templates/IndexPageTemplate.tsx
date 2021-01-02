import * as React from 'react';

import { Post } from '../../Post';
import MainLayout from '../MainLayout';
import PostItem from '../PostItem';

type Props = {
  posts: Post[];
};

const IndexPageTemplate: React.VFC<Props> = ({ posts }) => (
  <MainLayout headerProps={{ isTopPage: true }}>
    <h2 className="font-bold text-2xl">Posts</h2>
    <ul className="flex flex-wrap">
      {posts.map((post) => (
        <li key={post.slug} className="w-full border-b-2 px-2 py-4">
          <PostItem post={post} />
        </li>
      ))}
    </ul>
  </MainLayout>
);
IndexPageTemplate.displayName = 'components/templates/IndexPageTemplate';

export default IndexPageTemplate;
