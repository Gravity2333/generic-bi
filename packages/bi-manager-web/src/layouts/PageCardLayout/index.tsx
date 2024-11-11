import { Card, Menu } from 'antd';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { history } from 'umi';
import styles from './index.less';

export interface IRoute {
  exact: boolean;
  name: string;
  path: string;
  title: string;
}

export interface IFlowLayout {
  location: {
    pathname: string;
  };
  route: {
    routes: IRoute[];
  };
  match: {
    path: string;
    url: string;
  };
  children?: React.ReactNode;
}

const PageCardLayout: React.FC<IFlowLayout> = ({
  location: { pathname },
  route: { routes },
  children,
}) => {
  // 记录当前活跃的标签
  const [activeMenu, setActiveMenu] = useState<string>('');
  // 所有标签菜单
  const menus = useMemo(
    () => routes.filter((route: any) => route.redirect === undefined),
    [routes],
  );
  // 用来匹配合适的标签
  const findMatchedTag = useCallback(
    (pathName: string): any => {
      if (pathName === '') {
        return '';
      }
      const path = pathName.split('?')[0]; // 清除参数

      let result = '';
      for (let index = 0; index < menus.length; index += 1) {
        const element = menus[index];
        if (element.path === path) {
          result = element.path;
          break;
        }
      }
      if (result) {
        return result;
      }
      const pathList = pathName.split('?')[0].split('/');
      pathList.pop();
      return findMatchedTag(pathList.join('/'));
    },
    [menus],
  );
  // 页面改变回调函数
  function handlePageChange(e: any) {
    setActiveMenu(e.key);
    history.push(e.key);
  }
  // 查找标签
  useEffect(() => {
    setActiveMenu(findMatchedTag(pathname));
  }, [findMatchedTag, menus, pathname]);

  return (
    <Card title={undefined} size="small" className={styles['outer-card']} style={{ opacity: '0.9' }}>
      <>
        <Menu
          onClick={handlePageChange}
          selectedKeys={[activeMenu]}
          mode="horizontal"
          items={menus.map((menu) => ({
            label: menu.name,
            key: menu.path,
          }))}
        />
        {children}
      </>
    </Card>
  );
};

export default PageCardLayout;
