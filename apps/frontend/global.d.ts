/// <reference types="react" />
/// <reference types="react-dom" />
/// <reference types="node" />

import * as React from 'react';

// Re-export React with all its types
declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
    interface Element extends React.ReactElement<any, any> { }
    interface ElementClass extends React.Component<any> {
      render(): React.ReactNode;
    }
    interface ElementAttributesProperty { props: {}; }
    interface ElementChildrenAttribute { children: {}; }
  }
  
  const React: typeof import('react');
  
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
