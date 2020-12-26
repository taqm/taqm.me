export type Meta = {
  title: string;
};

export type Post = {
  id: string;
  title: string;
};

export const loadPostFromMDX = (id: string) => {
  const mdx = require(`../../posts/${id}`);
  const meta: Meta = mdx.meta;
  const Component: () => JSX.Element = mdx.default;
  return {
    post: {
      id,
      title: meta.title,
    },
    Component,
  };
};
