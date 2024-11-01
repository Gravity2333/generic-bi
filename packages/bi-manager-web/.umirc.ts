import proxy from './config/proxy';
import routes from './config/routes';
import { defineConfig } from 'umi';
import moment from 'moment';

export const isDev = process.env.NODE_ENV === 'development';

export default defineConfig({
  nodeModulesTransform: {
    type: 'none',
  },
  base: '/bi/',
  publicPath: '/bi/web-static/',
  antd: {},
  layout: {},
  hash: true,
  webpack5: {},
  // mfsu: {},
  dynamicImport: {
    loading: '@ant-design/pro-layout/es/PageLoading',
  },
  proxy: proxy.dev,
  metas: [{ name: 'build-time', content: moment().format() }],
  routes,
  fastRefresh: {},
  dva: {
    immer: true,
  },
  theme: {
    'root-entry-name': 'variable',
  },
  mountElementId: 'bi-web-root',
  chainWebpack: (config) => {
    config.module
      .rule('mjs-rule')
      .test(/\.m?js$/)
      .resolve.set('fullySpecified', false);
  },
});
