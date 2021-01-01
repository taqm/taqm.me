import Link from 'next/link';
import * as React from 'react';

type Props = {
  isTopPage?: boolean;
};

const MyHeader: React.VFC<Props> = ({ isTopPage }) => {
  const Inner = isTopPage ? 'h1' : 'div';
  return (
    <header className="border-b border-gray-200 bg-white">
      <Inner className="flex items-center justify-center h-16 text-2xl">
        <Link href="/">
          <a className="text-3xl">taqm&apos;blog</a>
        </Link>
      </Inner>
    </header>
  );
};

MyHeader.displayName = 'components/MyHeader';

export default MyHeader;
