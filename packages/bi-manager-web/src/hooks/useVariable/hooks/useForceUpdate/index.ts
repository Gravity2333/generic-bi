import { useState } from 'react';
import { flushSync } from 'react-dom';

export default function useForceUpdate() {
  const [updateKey, setUpdateKey] = useState<number>(0);
  const update = () => {
    flushSync(() => {
      if (updateKey > 99999) {
        setUpdateKey(0);
      } else {
        setUpdateKey(prev=>prev+1);
      }
    });
  };
  return [update];
}
