import useVariable, { UseVariableParams } from 'use-variable-hook';
import { checkMailvalidate } from '@/services/global';
import { Alert } from 'antd';
import { useEffect } from 'react';

const MailConfigAlertVariable: UseVariableParams = {
  variables: {
    mailValidate: {},
  },
  effects: {
    fetchMailConfig: ({ call, setLoading }, { store }) => {
      setLoading(true);
      const { success, data } = call(checkMailvalidate);
      store.mailValidate = success ? data : false;
      setLoading(false);
    },
  },
};

type MailConfigAlertVariableType = {
  mailValidate: boolean;
};

export default function MailConfigAlert() {
  const [{ mailValidate }, dispatch, loading] =
    useVariable<MailConfigAlertVariableType>(MailConfigAlertVariable);

  useEffect(() => {
    dispatch({
      type: 'fetchMailConfig',
    });
  }, []);

  return !loading('fetchMailConfig') && !mailValidate ? (
    <Alert
      type="warning"
      message="没有查询到有效的邮箱配置，可能会影响邮箱外发功能的正常使用，请先完善邮箱配置"
      style={{ margin: '10px 0' }}
    />
  ) : (
    <></>
  );
}
