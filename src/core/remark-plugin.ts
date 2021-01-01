/* eslint-disable no-param-reassign */

import unified from 'unified';
import visit, { Visitor } from 'unist-util-visit';

export const addFilenameToProperties: unified.Plugin = () => {
  const visitor: Visitor<MDastCodeNode> = (node) => {
    const [lang, filename] = node.lang?.split(':') ?? [];
    if (!node.data) {
      node.data = {};
    }
    node.data.hProperties = { filename };
    node.lang = lang ?? 'text';
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
