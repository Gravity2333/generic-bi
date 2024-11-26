const MomentLocatesWebpackPlugin = require('moment-locales-webpack-plugin');
const CompressionWebpackPlugin = require('compression-webpack-plugin');
const buildConifg = {
  plugins: [
    /** 减少momentjs体积 去除没必要的locate */
    new MomentLocatesWebpackPlugin({
      localesToKeep: ['es-us'],
    }),
    /** 开启gzip压缩 */
    new CompressionWebpackPlugin({
      test: /\.(js|css)$/,
      algorithm: 'gzip', //压缩算法
      minRatio: 0.7, // 压缩倍率
    }),
  ],
  /** 分包 */
  optimization: {
    splitChunks: {
      chunks: 'async',
      cacheGroups: {
        // vendors: {
        //   name: 'vendors', // 分组名称
        //   test: /[\\/]node_modules[\\/]/, // 匹配工具库
        //   chunks: 'async',
        //   priority: 10,
        //   reuseExistingChunk: true,
        // },
        // antd: {
        //   name: 'antd',
        //   test: /[\\/]node_modules[\\/](antd|@ant-design)[\\/]/,
        //   chunks: 'all',
        //   // 要比node_modules高一点
        //   priority: 20,
        //   reuseExistingChunk: true,
        // },
        // react: {
        //   name: 'react',
        //   test: /[\\/]node_modules[\\/](react|react-dom|react-router-dom|react-redux|redux)[\\/]/,
        //   chunks: 'all',
        //   // 要比node_modules高一点
        //   priority: 20,
        //   reuseExistingChunk: true,
        // },
        echarts: {
          name: 'echarts',
          test: /[\\/]node_modules[\\/]echarts/,
          chunks: 'all',
          // 要比node_modules高一点
          priority: 20,
          reuseExistingChunk: true,
        },
        agGrid: {
          name: 'agGrid', // 分组名称
          test: /[\\/]node_modules[\\/](ag-grid-community|ag-grid-react)/, // 匹配工具库
          chunks: 'all',
          priority: 20,
        },
        wangEditor: {
          name: 'wangEditor', // 分组名称
          test: /[\\/]node_modules[\\/]wangeditor/, // 匹配工具库
          chunks: 'all',
          priority: 20,
        },
        // utils: {
        //   name: 'utils', // 分组名称
        //   test: /[\\/]node_modules[\\/](lodash|moment|dayjs)/, // 匹配工具库
        //   chunks: 'all',
        //   priority: 20,
        // },
        default: {
          name: 'default',
          chunks: 'all',
          priority: -20,
        },
      },
    },
  },
};

export default buildConifg;
