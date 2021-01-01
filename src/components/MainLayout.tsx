import * as React from 'react';

import MyHeader from './MyHeader';

type Props = {
  headerProps?: React.ComponentProps<typeof MyHeader>;
};

const MainLayout: React.FC<Props> = ({ headerProps, children }) => (
  <>
    <MyHeader {...headerProps} />
    <main className="max-w-screen-md mx-auto py-4">{children}</main>
  </>
);

export default MainLayout;
