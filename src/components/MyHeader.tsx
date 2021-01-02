/* eslint-disable jsx-a11y/anchor-is-valid */

import Link from 'next/link';
import * as React from 'react';

type Props = {
  isTopPage?: boolean;
};

const MyHeader: React.VFC<Props> = ({ isTopPage }) => {
  const Inner = isTopPage ? 'h1' : 'div';
  return (
    <>
      <style jsx>{`
        .inner {
          @apply flex h-10 items-center justify-center;
        }

        @screen sm {
          .inner {
            @apply h-16 px-6 justify-start;
          }
        }
      `}</style>
      <header className="border-b border-gray-200 bg-white">
        <Inner className="inner max-w-screen-lg mx-auto">
          <Link href="/">
            <a className="text-xl sm:text-2xl">taqm&apos;blog</a>
          </Link>
        </Inner>
      </header>
    </>
  );
};

MyHeader.displayName = 'components/MyHeader';

export default MyHeader;
