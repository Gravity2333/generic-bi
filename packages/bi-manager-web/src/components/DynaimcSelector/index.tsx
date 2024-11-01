import { DeleteOutlined, PlusSquareOutlined } from '@ant-design/icons';
import { Button, Modal } from 'antd';
import { useState } from 'react';
import styles from './index.less';

enum EModalState {
  'EDIT' = 'edit',
  'CREATE' = 'create',
  'NONE' = 'none',
}

interface ItemProps {
  /** id */
  id: string;
  /** 图标 */
  icon?: React.ReactNode;
  /** 是否可删除item */
  closable?: boolean;
  /** 是否可点击 */
  clickable?: boolean;
  /** 删除回调 */
  onDelete?: (id: string) => void;
  /** 点击回调 */
  onClick?: (id: string) => void;
  children?: React.ReactNode;
}

export function DynamicSelectorItem({
  children,
  icon,
  id,
  onDelete,
  closable = true,
  onClick,
  clickable,
}: ItemProps) {
  return (
    <>
      <div
        className={styles['selector-container__item']}
        style={{
          cursor: clickable ? 'pointer' : 'default',
          color: clickable ? '' : 'rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
        }}
        key={id}
        onClick={(e) => {
          e.stopPropagation();
          if (onClick && clickable) {
            onClick(id);
          }
        }}
      >
        <div className={styles['selector-container__item__icon']}>{icon}</div>
        {children}
        <div className={styles['selector-container__item__del']}>
          {onDelete ? (
            <Button
              type="link"
              size="small"
              disabled={!closable}
              icon={<DeleteOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                if (onDelete) {
                  onDelete(id);
                }
              }}
            />
          ) : null}
        </div>
      </div>
    </>
  );
}

interface Props {
  /** 渲染弹出框内容 */
  renderModalContent: (closeModal: () => void, openModal: (edit?: boolean) => void) => any;
  /** 弹出框宽度 */
  modalWidth?: number;
  /** 新增按钮标题/弹出框标题 */
  title?: string;
  /** 不可用 */
  disabled?: boolean;
  /** children */
  children?: React.ReactNode[];
  /** beforeCreate */
  beforeCreate?: () => void;
  /** 单一模式 */
  single?: boolean;
}

/** 动态选择器 */
export default function DynamicSelector({
  renderModalContent,
  title = '',
  modalWidth = 530,
  children = [],
  disabled = false,
  beforeCreate,
  single,
}: Props) {
  const [modalState, setModalState] = useState<EModalState>(EModalState.NONE);
  /** 关闭modal */
  const closeModal = () => {
    setModalState(EModalState.NONE);
  };
  /** 打开modal */
  const openModel = (edit = false) => {
    setModalState(edit ? EModalState.EDIT : EModalState.CREATE);
  };
  return (
    <>
      <div
        className={styles['selector-container']}
        style={{
          backgroundColor: disabled ? 'rgba(0, 0, 0, 0.05)' : '   ',
        }}
      >
        {children}
        {(() => {
          if (single && children?.length > 0) {
            return;
          }
          if (!disabled) {
            return (
              <div
                className={styles['selector-container__adder']}
                onClick={(e) => {
                  e.stopPropagation();
                  if (disabled) {
                    return;
                  }
                  if (beforeCreate) {
                    beforeCreate();
                  }
                  setModalState(EModalState.CREATE);
                }}
              >
                <PlusSquareOutlined style={{ marginRight: '2px' }} />
                {`新增${title}`}
              </div>
            );
          } else {
            return (
              <div className={styles['selector-container__adder-disabled']}>
                <PlusSquareOutlined style={{ marginRight: '2px' }} />
                {`新增${title}`}
              </div>
            );
          }
        })()}
      </div>
      <Modal
        visible={modalState !== EModalState.NONE}
        footer={null}
        destroyOnClose
        width={modalWidth}
        title={`${modalState === EModalState.CREATE ? '新增' : '编辑'}${title}`}
        onCancel={() => {
          setModalState(EModalState.NONE);
        }}
        bodyStyle={{ padding: '10px' }}
      >
        {renderModalContent(closeModal, openModel)}
      </Modal>
    </>
  );
}
