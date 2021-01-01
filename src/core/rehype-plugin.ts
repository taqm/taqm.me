import unified from 'unified';
import visit, { Visitor } from 'unist-util-visit';

export const appendCodeFilename: unified.Plugin = () => {
  /* eslint-disable no-param-reassign */
  const visitor: Visitor<HastNode> = (node) => {
    if (node.type !== 'element') {
      return;
    }

    if (node.tagName !== 'pre') {
      return;
    }

    const code = node?.children?.[0];
    if (!code) return;
    if (code.type !== 'element' || code.tagName !== 'code') return;
    if (!code.properties.filename) return;

    if (!code.properties.className) {
      code.properties.className = [];
    }
    code.properties.className.push = ['pt-6'];

    const tmp = { ...node };
    const newNode: HastNode = {
      type: 'element',
      tagName: 'div',
      properties: {
        className: 'relative py-1',
      },
      children: [
        {
          type: 'element',
          tagName: 'div',
          properties: {
            className: 'absolute -left-1 top-0 bg-gray-300 px-2',
          },
          children: [{ type: 'text', value: code.properties.filename }],
        },
        tmp,
      ],
    };
    Object.assign(node, newNode);
    delete code.properties.filename;
  };

  return (node) => {
    visit(node, 'element', visitor);
  };
};
