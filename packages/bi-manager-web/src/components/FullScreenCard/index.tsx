import { FullscreenExitOutlined } from '@ant-design/icons';
import { useFullscreen } from 'ahooks';
import { Card, Divider, Tooltip } from 'antd';
import { ReactNode, useEffect } from 'react';
import React, { useRef } from 'react';

export const DEFAULT_HEIGHT = 920;

interface Props {
  title?: string;
  children?: ReactNode;
  extra?: ReactNode;
  fullScreen?: boolean;
  onClose?: any;
}

export const HightContext = React.createContext<any>(DEFAULT_HEIGHT);

export default function FullScreenCard(props: Props) {
  const { title, children, extra, fullScreen, onClose } = props;
  const wrapRef = useRef<HTMLDivElement>();
  const [isFullscreen, { toggleFullscreen }] = useFullscreen(wrapRef);
  const fullBoxHeight = isFullscreen ? `calc(100vh - 40px)` : 'auto';

  useEffect(() => {
    if (fullScreen === undefined) {
      return;
    }
    setTimeout(() => {
      (() => {
        toggleFullscreen();
      })();
    });
  }, [fullScreen]);

  useEffect(() => {
    const fullScreenHandler = () => {
      if (!document.fullscreenElement) {
        toggleFullscreen();
        onClose && onClose();
      }
    }
    document.addEventListener('fullscreenchange', fullScreenHandler);
    return ()=>removeEventListener('fullscreenchange',fullScreenHandler)
  }, []);

  return (
    // @ts-ignore
    <div ref={wrapRef}>
      <HightContext.Provider value={isFullscreen}>
        <Card
          size={'small'}
          title={title}
          headStyle={{ borderBottom: 'none' }}
          bodyStyle={{ height: fullBoxHeight, overflow: 'auto' }}
          extra={
            isFullscreen ? (
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'nowrap',
                  justifyContent: 'space-around',
                  alignItems: 'center',
                }}
              >
                {extra ? extra : ''}
                <Divider type="vertical" />
                <Tooltip title={'还原'}>
                  <span
                    onClick={() => {
                      toggleFullscreen();
                      onClose && onClose();
                    }}
                  >
                    <FullscreenExitOutlined />
                  </span>
                </Tooltip>
              </div>
            ) : (
              ''
            )
          }
        >
          {children as any}
        </Card>
      </HightContext.Provider>
    </div>
  );
}
