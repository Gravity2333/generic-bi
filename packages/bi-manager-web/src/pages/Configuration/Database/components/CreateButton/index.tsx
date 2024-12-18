import { queryDatabaseById } from '@/services/database';
import { PlusOutlined } from '@ant-design/icons';
import { Button, Modal, Skeleton } from 'antd';
import { forwardRef, useImperativeHandle, useState } from 'react';
import DatabaseConfigForm from '../Form';

export default forwardRef(function CreateButton(
  {
    updater,
  }: {
    updater?: any;
  },
  ref,
) {
  const [visiable, setVisiable] = useState<boolean>(false);
  const [mode, setMode] = useState<'create' | 'update'>('create');
  const [loading, setLoading] = useState<boolean>(false);
  const [initialValues, setInitialValues] = useState<Record<string, any>>({});

  const handleClose = () => {
    setInitialValues({});
    setMode('create');
    setVisiable(false);
  };

  const handleSuccess = () => {
    handleClose();
    if (updater) {
      updater();
    }
  };

  useImperativeHandle(
    ref,
    () => {
      const fetchDatabaseById = async (id: string) => {
        setLoading(true);
        const { success, data } = await queryDatabaseById(id);
        if (success) {
          setInitialValues({
            ...data,
            option: JSON.parse(data.option || '{}'),
          });
        }
        setLoading(false);
      };

      const copyDatabaseById = async (id: string) => {
        setLoading(true);
        const { success, data } = await queryDatabaseById(id);
        if (success) {
          const newVal = {
            ...data,
            option: JSON.parse(data.option || '{}'),
            readonly: '0',
          };

          delete newVal.id;
          setInitialValues(newVal);
        }
        setLoading(false);
      };

      return {
        update: async (id: string) => {
          await fetchDatabaseById(id);
          setMode('update');
          setVisiable(true);
        },
        copy: async (id: string) => {
          await copyDatabaseById(id);
          setMode('create');
          setVisiable(true);
        },
      };
    },
    [],
  );

  return (
    <>
      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={() => {
          setMode('create');
          setVisiable(true);
        }}
      >
        创建
      </Button>
      <Modal
        visible={visiable}
        footer={null}
        destroyOnClose
        width={800}
        title={`${mode === 'create' ? '新增' : '编辑'}数据库配置`}
        onCancel={handleClose}
        bodyStyle={{ padding: '10px' }}
      >
        <Skeleton loading={loading}>
          <DatabaseConfigForm onFinish={handleSuccess} initialValues={initialValues} />
        </Skeleton>
      </Modal>
    </>
  );
});
