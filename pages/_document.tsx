import Document, { Head, Html, Main, NextScript } from 'next/document';
import * as React from 'react';

export default class extends Document {
  render() {
    return (
      <Html lang="ja">
        <Head />
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
