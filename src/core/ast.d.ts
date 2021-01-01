type MdastData = {
  data?: {
    hProperties?: {
      className?: string[];
      filename?: string;
    };
    hChildren?: lowlight.HastNode[];
  };
};

type MDastHeadingNode = {
  type: 'heading';
  depth: number;
} & MdastData;

type MDastCodeNode = {
  type: 'code';
  lang: string | null;
  value: string;
} & MdastData;

type MDastNode = MDastCodeNode | MDastHeadingNode;

type HastRootNode = {
  type: 'root';
  children: HastNode[];
};

type HastElementNode = {
  type: 'element';
  tagName: string;
  properties: Record<string, any>; // eslint-disable-line
  children?: HastNode[];
};

type HastTextNode = {
  type: 'text';
  value: string;
};

type HastNode = HastRootNode | HastElementNode | HastTextNode;
