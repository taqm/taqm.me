import { Meta, Story } from '@storybook/react';
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
    { title: 'テスト記事1', slug: 'test1' },
    { title: 'テスト記事2', slug: 'test2' },
    { title: 'テスト記事3', slug: 'test3' },
    { title: 'テスト記事4', slug: 'test4' },
    { title: 'テスト記事5', slug: 'test5' },
  ],
};
