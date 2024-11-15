import Icon, {
  GithubOutlined,
  InfoCircleOutlined,
  LikeOutlined,
  UserOutlined,
} from '@ant-design/icons';
import styles from './index.less';
import { useState } from 'react';
import LOGO from '@/assets/icons/logo.png';
import { Modal } from 'antd';

export default function ProjectInfo() {
  const [visiable, setVisiable] = useState<boolean>(false);
  return (
    <>
      <InfoCircleOutlined
        className={styles['info_btn']}
        onClick={() => {
          setVisiable(true);
        }}
      />
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

        <header className={styles['project-info-card__title']}>感谢使用Generic-BI</header>
        <div className={styles['project-info-card__subTitle']}>你的版本: 展示版</div>
        <footer className={styles['project-info-card__footer']}>
          <div>
            <div>此版本为展示版</div>
            <div>请下载源码编译打包，或使用release的docker镜像</div>
            <div
              style={{ marginTop: '10px' }}
              onClick={() => {
                window.open('https://github.com/Gravity2333/generic-bi');
              }}
              className={styles['project-info-card__footer__depend']}
            >
              <GithubOutlined style={{ cursor: 'pointer' }} />
              <span> 项目源码</span>
            </div>
            <div
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
