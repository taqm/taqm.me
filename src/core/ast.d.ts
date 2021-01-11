type MdastData<T> = {
  data?: {
    hProperties?: T;
    hChildren?: lowlight.HastNode[];
  };
};

type MDastHeadingNode = {
  type: 'heading';
  depth: number;
};

type MDastCodeNode = {
  type: 'code';
  lang: string | null;
  value: string;
} & MdastData<{
  className?: string[];
  filename?: string;
}>;

type MDastImageNode = {
  type: 'image';
  title: string;
  url: string;
  width?: string;
  alt: string;
} & MdastData<{ width?: string }>;

type MDastNode = MDastCodeNode | MDastHeadingNode | MDastImageNode;

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
