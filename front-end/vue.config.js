const webpack = require('webpack')
	
module.exports = {
  publicPath: './',
  configureWebpack: {
    plugins: [
      new webpack.DefinePlugin({
        'process.env': {
          'WEB_ORIGIN': JSON.stringify( process.env.WEB_ORIGIN )
        }
      })
    ]
  },
  pluginOptions: {
    s3Deploy: {
      awsProfile: 'default',
      region: 'us-east-1',
      bucket: 'lambda-layers-database-front-end',
      pwa: true,
      pwaFiles: 'index.html,service-worker.js,manifest.json',
      uploadConcurrency: 5,
      registry: undefined,
      createBucket: false,
      staticHosting: true,
      staticIndexPage: 'index.html',
      staticErrorPage: 'error.html',
      assetPath: 'dist',
      assetMatch: ['**', '!**/*.map'],
      deployPath: '/',
      acl: 'public-read',
      enableCloudfront: false,
      pluginVersion: '3.0.0'
    }
  }
}
