import * as fs from 'fs';

import dayjs from 'dayjs';
import { read as matter } from 'gray-matter';

import { Meta, Post } from '../Post';

export type PostWithContent = Post & {
  content: string;
};

const pickMeta = (data: Record<string, string>): Meta => ({
  title: data.title,
  publishedAt: dayjs(data.publishedAt),
});

export const getAllPosts = async (): Promise<Post[]> => {
  const files = await fs.promises.readdir('./posts');
  return files.map<Post>((filename) => {
    const { data } = matter(`./posts/${filename}`);
    return {
      slug: filename.replace('.mdx', ''),
      ...pickMeta(data),
    };
  });
};

export const getPostWithContentBySlug = (slug: string): PostWithContent => {
  const { data, content } = matter(`./posts/${slug}.mdx`);
  return {
    slug,
    ...pickMeta(data),
    content,
  };
};
