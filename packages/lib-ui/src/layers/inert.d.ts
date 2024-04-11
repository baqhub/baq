//
// React fix.
// TODO: Remove when inert is supported in React.
//
export declare global {
  namespace JSX {
    interface IntrinsicAttributes {
      inert?: "";
    }
  }
}
