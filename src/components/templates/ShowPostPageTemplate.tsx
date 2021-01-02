import * as React from 'react';

import { Post } from '../../Post';
import MainLayout from '../MainLayout';

type Props = {
  post: Post;
  content: string;
};

const ShowPostPageTemplate: React.VFC<Props> = ({ post, content }) => (
  <MainLayout>
    <article className="post-page">
      <h1 className="text-3xl font-bold">{post.title}</h1>
      {/* eslint-disable-next-line react/no-danger */}
      <div dangerouslySetInnerHTML={{ __html: content }} />
    </article>
  </MainLayout>
);

export default ShowPostPageTemplate;
