/* eslint-disable no-param-reassign */

import * as querystring from 'querystring';

import unified from 'unified';
import visit, { Visitor } from 'unist-util-visit';

export const addFilenameToProperties: unified.Plugin = () => {
  const visitor: Visitor<MDastCodeNode> = (node) => {
    const [lang, filename] = node.lang?.split(':') ?? [];
    if (!filename) return;
    if (!node.data) {
      node.data = {};
    }
    node.lang = `${lang ?? 'text'}[data-filename=${filename}]`;
  };
  return (node) => visit(node, 'code', visitor);
};

/**
 * #の場合にh1になってしまいSEO的にまずいのでレベルを下げる
 */
export const headingLevelDown: unified.Plugin = () => {
  const visitor: Visitor<MDastHeadingNode> = (node) => {
    node.depth += 1;
  };

  return (node) => {
    visit(node, 'heading', visitor);
  };
};

export const setImageWidth: unified.Plugin = () => {
  const visitor: Visitor<MDastImageNode> = (node) => {
    const { url } = node;
    const [base, qs] = url.split('?');
    if (!qs) {
      return;
    }
    const query = querystring.parse(qs);
    if (!query.w) {
      return;
    }

    node.data = {
      hProperties: {
        width: `${query.w}px`,
      },
    };

    delete query.w;
    if (Object.keys(query).length > 0) {
      node.url = `${base}?${querystring.stringify(query)}`;
    } else {
      node.url = base;
    }
  };

  return (node) => {
    visit(node, 'image', visitor);
  };
};
