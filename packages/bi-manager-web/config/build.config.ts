
const buildConifg = {

  /** 分包 */
  optimization: {
    splitChunks: {
      chunks: 'async',
      cacheGroups: {
        // vendors: {
        //   name: 'vendors', // 分组名称
        //   test: /[\\/]node_modules[\\/]/, // 匹配工具库
        //   chunks: 'all',
        //   priority: 10,
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
          reuseExistingChunk: true,
        },
        cronsture: {
          name: 'cronsture', // 分组名称
          test: /[\\/]node_modules[\\/](cronsture)/, // cronsture
          chunks: 'all',
          priority: 20,
          reuseExistingChunk: true,
        },
        wangEditor: {
          name: 'wangEditor', // 分组名称
          test: /[\\/]node_modules[\\/]wangeditor/, // 匹配工具库
          chunks: 'all',
          priority: 20,
          reuseExistingChunk: true,
        },
        umi: {
          name: 'umi',
          chunks: 'all',
          priority: -20,
          reuseExistingChunk: true,
        },
      },
    },
  },
};

export default buildConifg;
