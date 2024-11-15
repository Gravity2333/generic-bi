import { GithubOutlined, InfoCircleOutlined, UserOutlined } from '@ant-design/icons';
import styles from './index.less';
import { useState } from 'react';
import LOGO from '@/assets/icons/logo.png';
import { Modal } from 'antd';

export default function ProjectInfo() {
  const [visiable, setVisiable] = useState<boolean>(false);
  return (
    <>
      {window?.productInfo?.projectInfo?.show ? (
        <InfoCircleOutlined
          className={styles['info_btn']}
          onClick={() => {
            setVisiable(true);
          }}
        />
      ) : null}
      <Modal
        destroyOnClose
        width="500px"
        centered
        visible={visiable}
        title={undefined}
        bodyStyle={{
          paddingTop: 10,
          paddingBottom: 10,
        }}
        className={styles['project-info-card']}
        onCancel={() => {
          setVisiable(false);
        }}
        footer={null}
      >
        <div className={styles['project-info-card__logo']}>
          <img src={LOGO}></img>
        </div>

        <header className={styles['project-info-card__title']}>
          {window?.productInfo?.projectInfo?.title}
        </header>
        <div className={styles['project-info-card__subTitle']}>
          {window?.productInfo?.projectInfo?.mode}
        </div>
        <footer className={styles['project-info-card__footer']}>
          <div>
            {(window?.productInfo?.projectInfo?.description || []).map((d) => {
              return <div>{d}</div>;
            })}
            <div
              style={{
                marginTop: '10px',
                visibility: window?.productInfo?.projectInfo?.showSource ? 'visible' : 'hidden',
              }}
              onClick={() => {
                window.open('https://github.com/Gravity2333/generic-bi');
              }}
              className={styles['project-info-card__footer__depend']}
            >
              <GithubOutlined style={{ cursor: 'pointer' }} />
              <span> 项目源码</span>
            </div>
            <div
              style={{
                visibility: window?.productInfo?.projectInfo?.showAuthor ? 'visible' : 'hidden',
              }}
              onClick={() => {
                window.open('https://github.com/Gravity2333');
              }}
              className={styles['project-info-card__footer__depend']}
            >
              <UserOutlined style={{ cursor: 'pointer', marginLeft: '10px' }} />
              <span> 作者: 小刘不知道叫啥 </span>
            </div>
          </div>
        </footer>
      </Modal>
    </>
  );
}
