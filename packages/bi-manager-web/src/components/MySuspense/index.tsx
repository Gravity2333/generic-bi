import React from 'react';

/** 利用代数效应，自己实现一个Suspense */

interface MySuspenseProps {
  fallback: JSX.Element | string;
}

interface MySuspenseStates {
  /** 组件是否加载 */
  loading: boolean;
}

export function myLazy(fetchFunc: () => Promise<any>) {
  let loadedComponent: any = null;
  return () => {
    if (!loadedComponent) {
      throw {
        promise: fetchFunc().then((value) => {
          loadedComponent = value?.default;
        }),
      };
    }
 
    return <>{loadedComponent()}</>;
  };
}

export default class MySuspense extends React.PureComponent<MySuspenseProps, MySuspenseStates> {
  constructor(props: MySuspenseProps) {
    super(props);

    this.state = {
      loading: false,
    };
  }

  componentDidCatch(error: any): void {
    if (error?.promise instanceof Promise) {
      this.setState({
        loading: true,
      });
      error?.promise.then(() => {
        this.setState({
          loading: false,
        });
      });
    }
  }

  render() {
    const { fallback, children } = this.props;
    return <>{this.state.loading ? fallback : children}</>;
  }
}
