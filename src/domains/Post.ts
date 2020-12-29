/* eslint-disable @typescript-eslint/no-var-requires, import/no-dynamic-require, global-require */

import * as React from 'react';

export type Meta = {
  title: string;
};

export type Post = {
  id: string;
  title: string;
};

type PostWithMDX = {
  post: Post;
  Component: React.ComponentType;
};
export const loadPostWithMDX = (id: string): PostWithMDX => {
  const mdx = require(`../../posts/${id}.mdx`);
  const { meta } = mdx;
  const Component: () => JSX.Element = mdx.default;
  return {
    post: {
      id,
      title: meta.title,
    },
    Component,
  };
};
