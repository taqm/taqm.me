/* eslint-disable jsx-a11y/anchor-is-valid */
import Link from 'next/link';
import * as React from 'react';

import { Post } from '../Post';

type Props = {
  post: Post;
};

const PostItem: React.VFC<Props> = ({ post }) => (
  <>
    <style jsx>{`
      .link:hover {
        text-decoration: underline;
        text-decoration-color: black;
        text-underline-offset: 4px;
      }
    `}</style>
    <article>
      <div className="text-sm text-gray-500">
        {post.publishedAt.format('YYYY-MM-DD')}
      </div>
      <Link href={`/posts/${post.slug}`} prefetch={false}>
        <a className="link text-xl mt-2">{post.title}</a>
      </Link>
      <ul className="flex flex-wrap mt-2">
        {post.tags?.map((tag) => (
          <li key={tag} className="mr-2 bg-gray-200 hover:bg-gray-300">
            <Link href={`/tags/${tag}`} prefetch={false}>
              <a className="block px-2 h-full text-sm">{tag}</a>
            </Link>
          </li>
        ))}
      </ul>
    </article>
  </>
);

PostItem.displayName = 'components/PostItem';

export default PostItem;
