import { Descriptions, Tooltip } from 'antd';
import type { TooltipPlacement } from 'antd/lib/tooltip';
import type { CSSProperties, ReactNode } from 'react';
import { useMemo } from 'react';

interface Props {
  children?: ReactNode;
  style?: CSSProperties;
  placement?: TooltipPlacement;
  noTip?: boolean;
  contentRender?: (text: any) => any;
  tooltipStyle?: any;
  autoHeight?: boolean;
  autoWidth?: boolean;
}

interface EllipDescProps extends Omit<Props, 'autoHeight' | 'autoWidth' | 'contentRender'> {
  infos: Record<string, any>;
}

interface EllipsisTool {
  Description: (props: EllipDescProps) => JSX.Element;
}

interface EllipsisType extends EllipsisTool {
  (props: Props): JSX.Element;
}

const EllipsisDiv: EllipsisType = (props: Props) => {
  const {
    children,
    style = {},
    placement,
    noTip = false,
    autoHeight = false,
    autoWidth = false,
    contentRender,
    tooltipStyle = {},
  } = props;

  const tooltipProps = useMemo(() => {
    const res: any = {};
    if (placement) {
      res.placement = placement;
    }
    return res;
  }, [placement]);

  return (
    <Tooltip
      {...tooltipProps}
      mouseEnterDelay={noTip ? 99999 : 0}
      overlayInnerStyle={{
        ...(() => {
          if (!autoHeight) {
            return { maxHeight: 300 };
          }
          return {};
        })(),
        overflow: 'auto',
        ...tooltipStyle,
      }}
      overlayStyle={{
        ...(() => {
          if (autoWidth) {
            return {
              maxWidth: 9999,
            };
          }
          return {};
        })(),
      }}
      title={contentRender ? contentRender(children) : children}
    >
      <div
        style={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: 'block',
          whiteSpace: 'nowrap',
          width: '100%',
          ...style,
        }}
      >
        {children}
      </div>
    </Tooltip>
  );
};

function EllipsisDescription(EllipsisCpn: (props: Props) => JSX.Element) {
  return function WrapperComponent(props: EllipDescProps) {
    const { infos = {} } = props;
    return (
      <EllipsisCpn
        {...props}
        autoWidth
        autoHeight
        contentRender={() => {
          return (
            <Descriptions size="small" bordered>
              {Object.entries(infos)
                .filter(([, value]) => value !== undefined || value !== null)
                .map(([key, value]) => {
                  return (
                    <Descriptions.Item
                      labelStyle={{ backgroundColor: 'rgba(0,0,0,.01)' }}
                      style={{ fontSize: '14px', color: 'white' }}
                      key={key}
                      span={2}
                      label={key}
                    >
                      {value}
                    </Descriptions.Item>
                  );
                })}
            </Descriptions>
          );
        }}
      >
        {Object.entries(infos)
          .filter(([, value]) => value !== undefined || value !== null)
          .map(([key, value]) => {
            return `[${key}]: ${value}`;
          })
          .join(';')}
      </EllipsisCpn>
    );
  };
}

EllipsisDiv.Description = EllipsisDescription(EllipsisDiv);

export default EllipsisDiv;
