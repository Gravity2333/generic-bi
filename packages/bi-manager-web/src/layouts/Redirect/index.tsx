import { BI_AUTH_TOKEN_KEY } from '@/common';
import { Skeleton } from 'antd';
import { useModel } from 'umi';
import { history } from 'umi';
export default function Redirect() {
  const { initialState } = useModel('@@initialState');
  if ((initialState as any).currentUserInfo) {
    history.push('/welcome');
  } else {
    window.localStorage.removeItem(BI_AUTH_TOKEN_KEY);
    location.href = '/login';
  }
  return (
    <Skeleton active loading={true}>
      <></>
    </Skeleton>
  );
}
