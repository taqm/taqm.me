import { Meta, Story } from '@storybook/react';
import dayjs from 'dayjs';
import * as React from 'react';

import IndexPageTemplate from './IndexPageTemplate';

type ArgType = React.ComponentProps<typeof IndexPageTemplate>;
const meta: Meta<ArgType> = {
  title: 'templates/IndexPageTemplate',
  component: IndexPageTemplate,
  argTypes: {
    posts: { control: { disable: true, type: 'array' } },
    itemNum: { control: { type: 'number' } },
  },
};
export default meta;

const Template: Story<ArgType> = (props) => <IndexPageTemplate {...props} />;
export const Main = Template.bind({});
Main.args = {
  posts: [
    {
      title: 'テスト記事1',
      slug: 'test1',
      description: '概要1',
      publishedAt: dayjs(),
      tags: ['test'],
    },
    {
      title: 'テスト記事2',
      slug: 'test2',
      description: '概要2',
      publishedAt: dayjs(),
      tags: ['test'],
    },
    {
      title: 'テスト記事3',
      slug: 'test3',
      description: '概要3',
      publishedAt: dayjs(),
      tags: ['test'],
    },
    {
      title: 'テスト記事4',
      slug: 'test4',
      description: '概要4',
      publishedAt: dayjs(),
      tags: ['test'],
    },
    {
      title: 'テスト記事5',
      slug: 'test5',
      description: '概要5',
      publishedAt: dayjs(),
      tags: ['test'],
    },
  ],
};
