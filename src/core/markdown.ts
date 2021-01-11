import * as fs from 'fs';

import dayjs from 'dayjs';
import { read as matter } from 'gray-matter';
import rehypeStringify from 'rehype-stringify';
import gfm from 'remark-gfm';
import links from 'remark-inline-links';
import parse from 'remark-parse';
import remarkPrism from 'remark-prism';
import remark2rehype from 'remark-rehype';
import unified from 'unified';

import { Meta, Post } from '../Post';
import { appendCodeFilename, externalLink, styling } from './rehype-plugin';
import {
  addFilenameToProperties,
  headingLevelDown,
  setImageWidth,
} from './remark-plugin';

type RawMeta = {
  title: string;
  publishedAt: string;
  description: string;
  tags: string[];
};

export type PostWithContent = Post & {
  content: string;
};

const pickMeta = (data: RawMeta): Meta => ({
  title: data.title,
  publishedAt: dayjs(data.publishedAt),
  description: data.description,
  tags: data.tags,
});

export const getAllPosts = async (): Promise<Post[]> => {
  const files = await fs.promises.readdir('./posts');
  const posts = files.map<Post>((filename) => {
    const { data } = matter(`./posts/${filename}`);
    return {
      slug: filename.replace(/.md/, ''),
      ...pickMeta(data as RawMeta),
    };
  });
  posts.sort((lhs, rhs) =>
    lhs.publishedAt.isBefore(rhs.publishedAt) ? 1 : -1,
  );
  return posts;
};

export const getPostWithContentBySlug = (slug: string): PostWithContent => {
  const fp = `./posts/${slug}.md`;
  const { data, content } = matter(fp);
  return {
    slug,
    ...pickMeta(data as RawMeta),
    content,
  };
};

export const markdownToHtml = (text: string): string => {
  const ret = unified()
    .use(parse)
    .use(links)
    .use(addFilenameToProperties)
    .use(setImageWidth)
    .use(gfm)
    .use(remarkPrism)
    .use(headingLevelDown)
    .use(remark2rehype)
    .use(appendCodeFilename)
    .use(styling)
    .use(externalLink)
    .use(rehypeStringify)
    .processSync(text);
  return String(ret);
};
