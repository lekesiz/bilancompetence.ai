/// <reference types="react" />
/// <reference types="react-dom" />
/// <reference types="next" />

// Global type definitions for components directory
declare module 'react' {
  export = React;
  export as namespace React;
}

declare module 'react-dom' {
  export = ReactDOM;
  export as namespace ReactDOM;
}

// JSX IntrinsicElements
declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}
