import { SHARE_PAGE_PREFIX } from '@bi/common';
import { IRouteProps } from '@umijs/types';

const isDev = process.env.NODE_ENV === 'development';

const routes: IRouteProps[] = [
  { path: '/',    hideInMenu: true, component: './Welcome', },
  {
    path: SHARE_PAGE_PREFIX,
    hideInMenu: true,
    layout: false,
    routes: [
      {
        path: `${SHARE_PAGE_PREFIX}/dashboard`,
        name: '预览 Dashboard',
        component: '../layouts/DashboardLayout',
        routes: [
          {
            path: `${SHARE_PAGE_PREFIX}/dashboard/:id/preview`,
            component: './Dashboard/Embed',
          },
        ],
      },
      {
        path: `${SHARE_PAGE_PREFIX}/widget`,
        name: '预览 Widget',
        component: '../layouts/WidgetLayout',
        routes: [
          {
            path: `${SHARE_PAGE_PREFIX}/widget/:id/preview`,
            component: './Widget/Share',
          },
        ],
      },
      {
        component: './404',
      },
    ],
  },
  /** 内嵌页面 */
  {
    path: '/embed/:id/dashboard',
    name: '仪表板',
    hideInMenu: true,
    layout: false,
    component: '../layouts/DashboardLayout',
    routes: [
      {
        path: '/embed/:id/dashboard',
        component: './Dashboard/Embed',
      },
    ],
  },
  {
    path: '/embed/default-dashboard',
    name: '默认仪表板',
    hideInMenu: true,
    layout: false,
    component: '../layouts/DashboardLayout',
    routes: [
      {
        path: '/embed/default-dashboard',
        component: './Dashboard/Default',
      },
    ],
  },
  {
    path: '/embed/dashboard',
    name: '仪表盘',
    icon: 'dashboard',
    hideInMenu: true,
    component: '../layouts/DashboardLayout',
    routes: [
      {
        path: '/embed/dashboard',
        hideInMenu: true,
        layout: false,
        component: './Dashboard/List',
      },
      {
        path: '/embed/dashboard/create',
        name: '创建仪表板',
        hideInMenu: true,
        layout: false,
        component: './Dashboard/Editor',
      },
      {
        path: '/embed/dashboard/:dashboardId/preview',
        name: '预览仪表板',
        hideInMenu: true,
        layout: false,
        component: './Dashboard/Preview',
      },
      {
        path: '/embed/dashboard/:dashboardId/update',
        name: '修改仪表板',
        hideInMenu: true,
        layout: false,
        component: './Dashboard/Update',
      },
      {
        path: '/embed/dashboard/tab',
        name: '仪表板',
        component: './Dashboard/Tab',
        hideInMenu: true,
        layout: false,
      },
      {
        component: './404',
      },
    ],
  },
  {
    path: '/embed/report',
    name: '自定义报表',
    hideInMenu: true,
    component: '../layouts/GlobalLayout',
    routes: [
      {
        path: '/embed/report',
        component: './Report/List',
        hideInMenu: true,
        layout: false,
      },
      {
        path: '/embed/report/create',
        name: '创建报表',
        hideInMenu: true,
        layout: false,
        component: './Report/Create',
      },
      {
        path: '/embed/report/:id/update',
        name: '编辑报表',
        hideInMenu: true,
        layout: false,
        component: './Report/Update',
      },
      {
        component: './404',
      },
    ],
  },
  {
    path: '/embed/widget',
    name: '图表',
    icon: 'bar-chart',
    hideInMenu: true,
    component: '../layouts/GlobalLayout',
    routes: [
      {
        path: '/embed/widget',
        component: './Widget/List',
        hideInMenu: true,
        layout: false,
      },
      {
        path: '/embed/widget/create',
        name: '创建图表',
        hideInMenu: true,
        layout: false,
        component: './Widget/Editor',
      },
      {
        path: '/embed/widget/:widgetId/update',
        name: '修改图表',
        hideInMenu: true,
        layout: false,
        component: './Widget/Update',
      },
      {
        path: '/embed/widget/:widgetId/copy',
        name: '复制图表',
        hideInMenu: true,
        layout: false,
        component: './Widget/Copy',
      },
      {
        component: './404',
      },
    ],
  },
  // {
  //   path: '/embed/sql-lab',
  //   name: 'SQL Lab',
  //   icon: 'ConsoleSqlOutlined',
  //   hideInMenu: true,
  //   layout: false,
  //   component: '../layouts/GlobalLayout',
  //   routes: [
  //     {
  //       path: '/embed/sql-lab',
  //       layout: false,
  //       component: './SqlLab',
  //     },
  //   ],
  // },
  {
    path: '/embed/datasource',
    name: '数据源',
    icon: 'database',
    hideInMenu: true,
    layout: false,
    component: '../layouts/GlobalLayout',
    routes: [
      {
        path: '/embed/datasource',
        component: './Datasource',
        hideInMenu: true,
        layout: false,
      },
    ],
  },
  /** 展示页面 */
  {
    path: '/dashboard',
    name: '仪表盘',
    icon: 'dashboard',
    component: '../layouts/DashboardLayout',
    routes: [
      {
        path: '/dashboard',
        component: './Dashboard/List',
      },
      {
        path: '/dashboard/create',
        name: '创建仪表板',
        hideInMenu: true,
        component: './Dashboard/Editor',
      },
      {
        path: '/dashboard/:dashboardId/preview',
        name: '预览仪表板',
        hideInMenu: true,
        component: './Dashboard/Preview',
      },
      {
        path: '/dashboard/:dashboardId/update',
        name: '修改仪表板',
        hideInMenu: true,
        component: './Dashboard/Update',
      },
      {
        component: './404',
      },
    ],
  },
  {
    path: '/report',
    name: '报表',
    icon: 'FieldTimeOutlined',
    component: '../layouts/GlobalLayout',
    routes: [
      {
        path: '/report',
        component: './Report/List',
      },
      {
        path: '/report/create',
        name: '创建报表',
        hideInMenu: true,
        component: './Report/Create',
      },
      {
        path: '/report/:id/update',
        name: '编辑报表',
        hideInMenu: true,
        component: './Report/Update',
      },
      {
        component: './404',
      },
    ],
  },
  {
    path: '/widget',
    name: '图表',
    icon: 'bar-chart',
    component: '../layouts/GlobalLayout',
    routes: [
      {
        path: '/widget',
        component: './Widget/List',
      },
      {
        path: '/widget/create',
        name: '创建图表',
        hideInMenu: true,
        component: './Widget/Editor',
      },
      {
        path: '/widget/:widgetId/update',
        name: '修改图表',
        hideInMenu: true,
        component: './Widget/Update',
      },
      {
        path: '/widget/:widgetId/copy',
        name: '复制图表',
        hideInMenu: true,
        component: './Widget/Copy',
      },
      {
        component: './404',
      },
    ],
  },
  {
    path: '/datasource',
    name: '数据源',
    icon: 'database',
    component: '../layouts/GlobalLayout',
    routes: [
      {
        path: '/datasource',
        component: './Datasource',
      },
    ],
  },
  // {
  //   path: '/sql-lab',
  //   name: 'SQL Lab',
  //   icon: 'ConsoleSqlOutlined',
  //   component: '../layouts/GlobalLayout',
  //   routes: [
  //     {
  //       path: '/sql-lab',
  //       component: './SqlLab',
  //     },
  //   ],
  // },
  {
    path: '/configuration',
    name: '配置',
    icon: 'setting',
    routes: [
      {
        path: '/configuration',
        redirect: '/configuration/dashboard',
      },
      {
        path: '/configuration/dashboard',
        name: '仪表盘',
        component: './Configuration/Dashboard',
      },
    ],
  },
  {
    component: './404',
  },
];

export default routes;
