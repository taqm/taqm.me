import * as fs from 'fs';

import { read as matter } from 'gray-matter';

export type Meta = {
  title: string;
};

export type Post = {
  slug: string;
  title: string;
};

export type PostWithContent = Post & {
  content: string;
};

export const getAllPosts = async (): Promise<Post[]> => {
  const files = await fs.promises.readdir('./posts');
  return files.map<Post>((filename) => {
    const { data } = matter(`./posts/${filename}`);
    return {
      slug: filename.replace('.mdx', ''),
      title: data.title,
    };
  });
};

export const getPostWithContentBySlug = (slug: string): PostWithContent => {
  const { data, content } = matter(`./posts/${slug}.mdx`);
  return {
    slug,
    title: data.title,
    content,
  };
};
