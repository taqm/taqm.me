import { Meta, Story } from '@storybook/react';
import * as React from 'react';

import MyHeader from './MyHeader';

type ArgType = React.ComponentProps<typeof MyHeader>;
const meta: Meta<ArgType> = {
  title: 'components/MyHeader',
  component: MyHeader,
  argTypes: {
    isTopPage: { control: { type: 'boolean' } },
  },
};
export default meta;

const Template: Story<ArgType> = (props) => <MyHeader {...props} />;
export const Main = Template.bind({});
