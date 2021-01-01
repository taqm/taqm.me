import unified from 'unified';
import visit, { Visitor } from 'unist-util-visit';

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
