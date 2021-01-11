/* eslint-disable no-param-reassign */

import unified from 'unified';
import visit, { Visitor } from 'unist-util-visit';

export const styling: unified.Plugin = () => {
  const visitor: Visitor<HastElementNode> = (node) => {
    const classes: Record<string, string> = {
      h2: 'heading lv-2',
      h3: 'heading lv-3',
      h4: 'heading lv-4',
      h5: 'heading lv-5',
      p: 'paragraph',
      pre: 'pre',
      code: 'code',
      a: 'anchor',
      ul: 'list unordered',
      ol: 'list ordered',
      table: 'table',
      thead: 'thead',
      tbody: 'tbody',
      tr: 'tr',
      td: 'td',
      th: 'th',
      img: 'img',
    };

    const className = classes[node.tagName];
    if (!className) return;

    if (!node.properties.className) {
      node.properties.className = className;
      return;
    }

    if (Array.isArray(node.properties.className)) {
      node.properties.className.push(className);
      return;
    }

    node.properties.className = [node.properties.className, className];
  };

  return (node) => {
    visit(node, 'element', visitor);
  };
};

export const externalLink: unified.Plugin = () => {
  const reg = /^https?/;
  const visitor: Visitor<HastElementNode> = (node) => {
    if (node.tagName !== 'a') return;

    const { href }: { href?: string } = node.properties;
    if (href && reg.test(href)) {
      node.properties.rel = 'noopener noreferrer';
      node.properties.target = '_blank';
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

    (parent as HastElementNode).properties = {
      className: 'has-filename',
    };

    parent.children = [
      {
        type: 'element',
        tagName: 'div',
        properties: {
          className: 'filename',
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
