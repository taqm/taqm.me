import * as fs from 'fs';

import dayjs from 'dayjs';
import { read as matter } from 'gray-matter';
import rehypeStringify from 'rehype-stringify';
import highlight from 'remark-highlight.js';
import parse from 'remark-parse';
import remark2rehype from 'remark-rehype';
import unified from 'unified';

import { Meta, Post } from '../Post';
import { appendCodeFilename } from './rehype-plugin';
import { addFilenameToProperties, headingLevelDown } from './remark-plugin';

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
      slug: filename.replace(/.md/, ''),
      ...pickMeta(data),
    };
  });
};

export const getPostWithContentBySlug = (slug: string): PostWithContent => {
  const fp = `./posts/${slug}.md`;
  const { data, content } = matter(fp);
  return {
    slug,
    ...pickMeta(data),
    content,
  };
};

export const markdownToHtml = (text: string): string => {
  const ret = unified()
    .use(parse)
    .use(addFilenameToProperties)
    .use(highlight)
    .use(headingLevelDown)
    .use(remark2rehype)
    .use(rehypeStringify)
    .use(appendCodeFilename)
    .processSync(text);
  return String(ret);
};