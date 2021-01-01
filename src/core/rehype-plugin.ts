/* eslint-disable no-param-reassign */

import unified from 'unified';
import visit, { Visitor } from 'unist-util-visit';

export const styling: unified.Plugin = () => {
  const visitor: Visitor<HastElementNode> = (node) => {
    const classes: Record<string, string> = {
      h2: 'text-2xl mt-4 font-bold',
      h3: 'text-xl mt-2 font-bold',
      h4: 'text-xl mt-2 font-bold',
      p: 'mt-2',
    };

    const className = classes[node.tagName];
    if (className) {
      node.properties.className = className;
    }
  };
  return (node) => {
    visit(node, 'element', visitor);
  };
};

export const appendCodeFilename: unified.Plugin = () => {
  /* eslint-disable no-param-reassign */
  const visitor: Visitor<HastNode> = (node, _, parent) => {
    if (!parent) return;
    if (node.type !== 'element') return;
    const filename = node.properties['data-filename'];
    if (node.tagName !== 'pre' || !filename) {
      return;
    }

    node.properties.className = [
      node.properties.className,
      'm-0',
      'mt-2',
      'pt-8',
    ];

    const code = node?.children?.[0];
    if (code?.type === 'element') {
      code.properties.className = [code.properties.className, 'pt-6'];
    }

    (parent as HastElementNode).properties = {
      className: 'relative',
    };

    parent.children = [
      {
        type: 'element',
        tagName: 'div',
        properties: {
          className: 'absolute -left-1 -top-1 bg-gray-300 px-2',
        },
        children: [{ type: 'text', value: filename }],
      },
      ...parent.children,
    ];
    delete node.properties['data-filename'];
  };

  return (node) => {
    visit(node, 'element', visitor);
  };
};
