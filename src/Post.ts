import dayjs, { Dayjs } from 'dayjs';

export type Meta = {
  title: string;
  publishedAt: Dayjs;
  tags: string[];
};

export type Post = {
  slug: string;
  title: string;
  publishedAt: Dayjs;
  tags: string[];
};

export type SerializedPost = {
  __brandSerializedPost: never;
} & string;

export const serializePost = (post: Post): SerializedPost =>
  JSON.stringify({
    ...post,
    publishedAt: post.publishedAt.toISOString(),
  }) as SerializedPost;

export const deserializePost = (post: SerializedPost): Post => {
  const data = JSON.parse(post);
  return {
    ...data,
    publishedAt: dayjs(data.publishedAt),
  };
};
