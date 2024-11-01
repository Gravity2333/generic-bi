import { queryPlatform } from '@/services/global';
import { useEffect, useState } from 'react';

export enum EPlatform {
  ARM = 'ARM',
  X86 = 'X86',
}

export default function usePlatform() {
  const [platfrom, setPlatform] = useState<EPlatform>(EPlatform.X86);
  
  const isArm = platfrom === EPlatform.ARM;
  useEffect(() => {
    (async () => {
      const { success, data } = await queryPlatform();
      if (success) {
        setPlatform(data);
      }
    })();
  }, []);
  return { platfrom, isArm };
}
