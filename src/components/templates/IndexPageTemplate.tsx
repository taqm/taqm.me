import * as React from 'react';

import { Post } from '../../Post';
import MainLayout from '../MainLayout';
import PostItem from '../PostItem';

type Props = {
  posts: Post[];
};

const IndexPageTemplate: React.VFC<Props> = ({ posts }) => (
  <>
    <style jsx>{`
      .post-item:first-child {
        padding-top: 1em !important;
      }
    `}</style>
    <MainLayout headerProps={{ isTopPage: true }}>
      <h2 className="font-bold sm:text-center text-2xl">Posts</h2>
      <ul className="flex flex-wrap">
        {posts.map((post) => (
          <li key={post.slug} className="post-item w-full border-b-2 px-2 py-4">
            <PostItem post={post} />
          </li>
        ))}
      </ul>
    </MainLayout>
  </>
);
IndexPageTemplate.displayName = 'components/templates/IndexPageTemplate';

export default IndexPageTemplate;
