import proxy from './config/proxy';
import routes from './config/routes';
import { defineConfig } from 'umi';
import moment from 'moment';

export const isDev = process.env.NODE_ENV === 'development';
const { BundleAnalyzerPlugin } = require('umi-webpack-bundle-analyzer');

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

    if (process.env.ANALYZE === '1') {
      config.plugin('umi-webpack-bundle-analyzer').use(
        new BundleAnalyzerPlugin({
          analyzerMode: 'server', // 启用分析模式
          analyzerPort: 9765, // 设置端口号为 9765,
          openAnalyzer: true, // 自动打开分析页面
        }),
      );
    }

    config.optimization.splitChunks({
      chunks: 'all',
      cacheGroups: {
        vendor: {
          name: 'vendor',
          test: /[\\/]node_modules[\\/]/,
          chunks: 'all',
          priority: 10,
          reuseExistingChunk: true,
          enforce: true,
        },
        react: {
          name: 'react',
          test: /[\\/]node_modules[\\/](react|react-dom|react-router-dom|react-redux|redux)[\\/]/,
          chunks: 'all',
          // 要比node_modules高一点
          priority: 20,
          reuseExistingChunk: true,
          enforce: true,
        },
        ecahrts: {
          name: 'ecahrts',
          test: /[\\/]node_modules[\\/]echarts/,
          chunks: 'all',
          // 要比node_modules高一点
          priority: 20,
          reuseExistingChunk: true,
          enforce: true,
        },
        'ag-grid': {
          name: 'ag-grid', // 分组名称
          test: /[\\/]node_modules[\\/]ag-grid-community/, // 匹配工具库
          chunks: 'all',
          priority: 20,
          maxSize: 1024*1024,
          enforce: true,
        },
        'wangEditor': {
          name: 'wangEditor', // 分组名称
          test: /[\\/]node_modules[\\/]wangeditor/, // 匹配工具库
          chunks: 'all',
          priority: 20,
          enforce: true,
        },
        utils: {
          name: 'utils', // 分组名称
          test: /[\\/]node_modules[\\/](lodash|moment|dayjs)/, // 匹配工具库
          chunks: 'all',
          priority: 10,
          enforce: true,
        },
      },
    });
    config.optimization.set('emitOnErrors', false); // 替代 noEmitOnErrors
  },
});
