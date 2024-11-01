import { DeleteOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import styles from './index.less';

interface IDynamicFormTagProps {
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

export default function FormListTag({
  children,
  icon,
  id,
  onDelete,
  closable = true,
  onClick,
  clickable,
}: IDynamicFormTagProps) {
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
