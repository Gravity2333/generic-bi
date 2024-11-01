import useVariable from '@/hooks/useVariable';
import { UseVariableParams } from '@/hooks/useVariable/typings';
import { queryMailConfig } from '@/services/global';
import { IMailConfig } from '@bi/common';
import { Alert } from 'antd';
import { useEffect } from 'react';

const MailConfigAlertVariable: UseVariableParams = {
  variables: {
    mailConfig: {},
  },
  effects: {
    fetchMailConfig: ({ call, setLoading }, { store }) => {
      setLoading(true);
      const { success, data } = call(queryMailConfig);
      store.mailConfig = success ? data : ({} as IMailConfig);
      setLoading(false);
    },
  },
};

type MailConfigAlertVariableType = {
  mailConfig: IMailConfig;
};

export default function MailConfigAlert({
  setMailConfig,
}: {
  setMailConfig?: React.Dispatch<React.SetStateAction<IMailConfig>>;
}) {
  const [{ mailConfig }, dispatch, loading] =
    useVariable<MailConfigAlertVariableType>(MailConfigAlertVariable);

  useEffect(() => {
    dispatch({
      type: 'fetchMailConfig',
    });
  }, []);

  useEffect(() => {
    if (setMailConfig) {
      setMailConfig(mailConfig);
    }
  }, [mailConfig]);

  return !loading('fetchMailConfig') && !mailConfig?.effective ? (
    <Alert
      type="warning"
      message="没有查询到有效的邮箱配置，可能会影响邮箱外发功能的正常使用，请先完善邮箱配置"
      style={{ margin: '10px 0' }}
    />
  ) : (
    <></>
  );
}
