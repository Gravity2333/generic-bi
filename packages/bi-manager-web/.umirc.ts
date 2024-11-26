import proxy from './config/proxy';
import routes from './config/routes';
import { defineConfig } from 'umi';
import moment from 'moment';
import buildConfig from './config/build.config';

export const isDev = process.env.NODE_ENV === 'development';
const MomentLocatesWebpackPlugin = require('moment-locales-webpack-plugin');
// const CompressionWebpackPlugin = require('compression-webpack-plugin');
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
    const _chunks = ['umi'];
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

    // 合并生产环境优化
    if (process.env.NODE_ENV === 'production') {
      config.merge(buildConfig);
    }
    /** 减少momentjs体积 去除没必要的locate */
    config.plugin('moment-locates').use(new MomentLocatesWebpackPlugin({
      localesToKeep: ['es-us'],
    }),)

    // /** 开启gzip压缩 */
    // config.plugin('compress').use( 
    //   new CompressionWebpackPlugin({
    //     test: /\.(js|css)$/,
    //     algorithm: 'gzip', //压缩算法
    //     minRatio: 0.7, // 压缩倍率
    //   }))
  },
});
