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
        text-underline-offset: 2px;
      }
    `}</style>
    <article>
      <div className="text-sm text-gray-500">
        {post.publishedAt.format('YYYY-MM-DD')}
      </div>
      <Link href={`/posts/${post.slug}`}>
        <a className="link text-xl">{post.title}</a>
      </Link>
    </article>
  </>
);

PostItem.displayName = 'components/PostItem';

export default PostItem;
