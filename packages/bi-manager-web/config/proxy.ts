export default {
  dev: {
    '/api': {
      target: 'http://10.0.0.147:41130',
      // target: 'http://10.0.0.9:7001',
      changeOrigin: true,
      pathRewrite: { '^/api': '' },
    }
  },
};
