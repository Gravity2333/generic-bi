import proxy from './config/proxy';
import routes from './config/routes';
import { defineConfig } from 'umi';
import moment from 'moment';
import buildConfig from './config/build.config';

export const isDev = process.env.NODE_ENV === 'development';
const { BundleAnalyzerPlugin } = require('umi-webpack-bundle-analyzer');

export default defineConfig({
  nodeModulesTransform: {
    type: 'none',
  },
  ...(() => {
    /** TEST模式下，修改publicPath 和 base */
    if (process.env.TEST === '1') {
      return {
        base: '/',
        publicPath: '/',
      };
    }
    return {
      base: '/bi/',
      publicPath: '/bi/web-static/',
    };
  })(),
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
  chunks: (() => {
    const _chunks = ['react','default','umi'];
    // if (process.env.NODE_ENV === 'production') {
    //   /** 根据分包自动设置_chunks */
    //   const cacheGroups = buildConfig?.optimization?.splitChunks?.cacheGroups || {};
    //   _chunks.push(
    //     ...Object.keys(cacheGroups).filter(chunk => chunk!=='src').map((chunk) => {
    //       return (cacheGroups as any)[chunk].name;
    //     }),
    //   );
    // }
    return _chunks;
  })(),
  chainWebpack: (config) => {
    config.module
      .rule('mjs-rule')
      .test(/\.m?js$/)
      .resolve.set('fullySpecified', false);

    // 分析模式下打开分析插件
    if (process.env.ANALYZE === '1') {
      config.plugin('umi-webpack-bundle-analyzer').use(
        new BundleAnalyzerPlugin({
          analyzerMode: 'server', // 启用分析模式
          analyzerPort: 9765, // 设置端口号为 9765,
          openAnalyzer: true, // 自动打开分析页面
        }),
      );
    }

    // 合并生产环境优化
    if (process.env.NODE_ENV === 'production') {
      config.merge(buildConfig);
    }
  },
});
