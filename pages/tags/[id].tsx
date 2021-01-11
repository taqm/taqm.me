import { GetStaticPaths, GetStaticProps, NextPage } from 'next';
import * as React from 'react';

import MainLayout from '../../src/components/MainLayout';
import { getAllPosts } from '../../src/core/markdown';

type Props = {
  id: string;
};

type PathParams = {
  id: string;
};

const TagsPage: NextPage<Props> = ({ id }) => (
  <MainLayout>
    <h1>tag = {id}</h1>
    <div>準備中です</div>
  </MainLayout>
);

TagsPage.displayName = 'pages/tags/[slug]';

export const getStaticProps: GetStaticProps<Props, PathParams> = async ({
  params,
}) => {
  if (!params?.id) {
    return {
      notFound: true,
    };
  }
  return {
    props: {
      id: params.id,
    },
  };
};

export const getStaticPaths: GetStaticPaths<PathParams> = async () => {
  const posts = await getAllPosts();
  const tags = posts.reduce<string[]>(
    (acc, cur) => (cur.tags ? [...acc, ...cur.tags] : acc),
    [],
  );
  return {
    paths: tags.map((tag) => ({ params: { id: tag } })),
    fallback: false,
  };
};

export default TagsPage;
