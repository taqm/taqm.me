declare module 'remark-prism' {
  export default any;
}

declare module 'remark-inline-links' {
  export default any;
}

interface Window {
  // pageviewのため
  gtag(type: 'config', googleAnalyticsId: string, { page_path: string });
  // eventのため
  gtag(
    type: 'event',
    eventAction: string,
    fieldObject: {
      event_label: string;
      event_category: string;
      value?: string;
    },
  );
}
