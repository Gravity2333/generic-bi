import { BI_AUTH_TOKEN_KEY } from '@/common';
import { useEffect } from 'react';
import { useModel } from 'umi';
export default function Redirect({children}: any) {
  const { initialState } = useModel('@@initialState');

  useEffect(() => {
    if (!(initialState as any).currentUserInfo) {
      window.localStorage.removeItem(BI_AUTH_TOKEN_KEY);
      location.href = '/login';
    } 
  }, [])

  return (
    children
  );
}
