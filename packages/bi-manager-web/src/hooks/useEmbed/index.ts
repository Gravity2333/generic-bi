import { useMemo } from 'react';
import { useLocation } from 'umi';

export default function useEmbed() {
  const location = useLocation();
  const embed = useMemo(() => {
    return location?.pathname?.includes('/embed/');
  }, [location]);
  return [embed, location] as [boolean, any];
}
