import * as React from 'react';

import { Post } from '../../Post';
import MainLayout from '../MainLayout';

import 'highlight.js/styles/default.css';

type Props = {
  post: Post;
  content: string;
};

const ShowPostPageTemplate: React.VFC<Props> = ({ post, content }) => (
  <MainLayout>
    <article>
      <h1 className="text-2xl font-bold">{post.title}</h1>
      {/* eslint-disable-next-line react/no-danger */}
      <div dangerouslySetInnerHTML={{ __html: content }} />
    </article>
  </MainLayout>
);

export default ShowPostPageTemplate;
