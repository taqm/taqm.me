/* eslint-disable jsx-a11y/anchor-is-valid */

import Link from 'next/link';
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
      <div className="text-sm text-gray-500">
        {post.publishedAt.format('YYYY-MM-DD')}
      </div>
      <h1 className="text-2xl font-bold">{post.title}</h1>
      <ul className="flex flex-wrap mt-2">
        {post.tags?.map((tag) => (
          <li key={tag} className="mr-2 bg-gray-200 hover:bg-gray-300">
            <Link href={`/tags/${tag}`} prefetch={false}>
              <a className="block px-2 h-full text-sm">{tag}</a>
            </Link>
          </li>
        ))}
      </ul>
      {/* eslint-disable-next-line react/no-danger */}
      <div className="mt-10" dangerouslySetInnerHTML={{ __html: content }} />
    </article>
  </MainLayout>
);

export default ShowPostPageTemplate;
