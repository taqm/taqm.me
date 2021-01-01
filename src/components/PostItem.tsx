import Link from 'next/link';
import * as React from 'react';

import { Post } from '../Post';

type Props = {
  post: Post;
};

const PostItem: React.VFC<Props> = ({ post }) => (
  <article className="p-2 border border-gray-200">
    <div className="text-sm text-gray-500">
      {post.publishedAt.format('YYYY-MM-DD')}
    </div>
    <Link href={`/posts/${post.slug}`}>
      <a className="hover:underline">{post.title}</a>
    </Link>
  </article>
);

PostItem.displayName = 'components/PostItem';

export default PostItem;
