import useVariable, { UseVariableParams } from '@/hooks/useVariable';
import { createDictMapping, updateDictMapping } from '@/services/dicts';
import { BookOutlined } from '@ant-design/icons';
import { INpmdDict } from '@bi/common';
import { Button, Drawer, message, Popover, Space, Table, Tag } from 'antd';
import { forwardRef, useImperativeHandle } from 'react';

export const dictMapColumns = [
  {
    title: 'ID',
    dataIndex: 'key',
    key: 'key',
  },
  {
    title: '显示名称',
    dataIndex: 'value',
    key: 'key',
  },
];

export type TagEditDrawerRef = {
  update(_selectedTable: string, _table_field: string, _dict_field: string, _dictId: string): void;
  create(_selectedTable: string, _table_field: string): void;
};

const TagEditDrawerVariables: UseVariableParams = {
  variables: {
    selectedTable: '',
    tagMode: 'create',
    drawTitle: '添加字典',
    visiable: false,
    selectedDictId: '',
    updateTagId: '',
  },
  reducers: {
    changeCreateMode(store, { payload: { _selectedTable, _table_field } }) {
      store.tagMode = 'create';
      store.drawTitle = '添加字典';
      store.selectedTable = _selectedTable;
      store.mapping = [_table_field, undefined];
      store.visiable = true;
    },
    chageUpdateMode(store, { payload: { _selectedTable, _table_field, _dict_field, _dictId } }) {
      store.tagMode = 'update';
      store.drawTitle = '编辑字典';
      store.selectedTable = _selectedTable;
      store.mapping = [_table_field, _dict_field];
      store.visiable = true;
      store.updateTagId = _dictId;
    },
    closeDrawer(store) {
      store.visiable = false;
      store.mapping = [];
      store.tagMode = 'create';
    },
  },
  effects: {
    submit({ call, setLoading, Control }, { store, dispatch }, _) {
      setLoading(true);
      const submitFunc = store.tagMode === 'create' ? createDictMapping : updateDictMapping;
      const [table_field, dict_field] = store.mapping;

      const { success } = call(submitFunc, {
        ...(() => {
          if (store.updateTagId) {
            return { id: store.updateTagId };
          }
          return {};
        })(),
        table_name: store.selectedTable,
        table_field,
        dict_field,
      });
      setLoading(false);
      if (!success) {
        message.error('保存失败!');
        Control.error('保存失败!');
      } else {
        message.success('保存成功!');
        /** 关闭drawer */
        dispatch({ type: 'closeDrawer' });
        Control.return('保存成功!');
      }
    },
  },
};

type TagEditDrawerTypes = {
  selectedTable: string;
  tagMode: 'create' | 'update';
  drawTitle: string;
  visiable: boolean;
  // table_field -> dict_field
  mapping: string[];
  updateTagId?: string;
};

function TagEditDrawer(
  {
    onSuccess,
    dicts = [],
  }: {
    onSuccess?: () => void;
    dicts: INpmdDict[];
  },
  ref: any,
) {
  const [variables, dispatch, loading] = useVariable<TagEditDrawerTypes>(TagEditDrawerVariables);

  useImperativeHandle(
    ref,
    () => {
      return {
        update(_selectedTable: string, _table_field: string, _dict_field: string, _dictId: string) {
          dispatch({
            type: 'chageUpdateMode',
            payload: { _selectedTable, _table_field, _dict_field, _dictId },
          });
        },
        create(_selectedTable: string, _table_field: string) {
          dispatch({
            type: 'changeCreateMode',
            payload: { _selectedTable, _table_field },
          });
        },
      };
    },
    [],
  );

  function handleDrawerClose() {
    dispatch({ type: 'closeDrawer' });
  }

  return (
    <Drawer
      title={variables.drawTitle}
      visible={variables.visiable}
      onClose={handleDrawerClose}
      footer={
        <Space>
          <Button key="back" onClick={handleDrawerClose}>
            返回
          </Button>
          <Button
            key="submit"
            type="primary"
            disabled={!variables.mapping?.[1]}
            loading={loading('submit')}
            onClick={() => {
              dispatch({ type: 'submit' }).then(() => {
                if (onSuccess) {
                  onSuccess();
                }
              });
            }}
          >
            保存
          </Button>
        </Space>
      }
      width={700}
    >
      {dicts.map(({ id, name, dict }) => {
        return (
          <Popover
            key={id}
            placement="left"
            content={
              <div style={{ minWidth: '400px'}}>
                <Table
                  size="small"
                  bordered
                  columns={dictMapColumns}
                  dataSource={Object.keys(dict).map((key) => {
                    return { key, value: dict[key] };
                  })}
                />
              </div>
            }
            title={`字典: ${name}`}
          >
            <Tag
              style={{ cursor: 'pointer', width: '200px', margin: '5px' }}
              color={variables?.mapping?.[1] !== id ? '' : 'blue'}
              onClick={() => {
                if (variables?.mapping?.[1] === id) {
                  variables.mapping = [variables.mapping[0], ''];
                } else {
                  variables.mapping = [variables.mapping[0], id];
                }
              }}
            >
              <BookOutlined />
              {name}
            </Tag>
          </Popover>
        );
      })}
    </Drawer>
  );
}

export default forwardRef(TagEditDrawer);
