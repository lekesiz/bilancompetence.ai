/// <reference types="react" />
/// <reference types="react-dom" />
/// <reference types="node" />

import React from 'react';

// Re-export React with all its types
declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
    interface Element extends import('react').ReactElement<any, any> { }
    interface ElementClass extends import('react').Component<any> {
      render(): import('react').ReactNode;
    }
    interface ElementAttributesProperty { props: {}; }
    interface ElementChildrenAttribute { children: {}; }
  }

  namespace NodeJS {
    interface ProcessEnv {
      [key: string]: string | undefined;
    }

    interface Process {
      env: ProcessEnv;
    }
  }

  var process: NodeJS.Process;
}
