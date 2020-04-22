const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCssPlugin = require('optimize-css-assets-webpack-plugin');

const isDev = process.env.NODE_ENV === 'development';
const config = require('./public/config')[isDev ? 'dev' : 'build'];

const path = require('path')
const webpack = require('webpack')

//webpack.config.js
module.exports = {
  mode: "development",
  // 多入口
  // entry: [
  //   './src/polyfills.js',
  //   './src/index.js'
  // ],
  // 出口 默认在dist目录下生成main.js
  output: {
    path: path.resolve(__dirname, 'dist'), //必须是绝对路径
    filename: 'bundle.[hash:6].js',
    publicPath: '/' // 通常是CDN地址,最终编译出来的代码部署在 CDN 上，资源的地址为: 'https://AAA/BBB/YourProject/XXX'，那么可以将生产的 publicPath 配置为: //AAA/BBB/
  },

  // 配置 webpack 去哪些目录下寻找第三方模块
  resolve: {
    modules: ['./src/components', 'node_modules'], //从左到右依次查找
    alias: {
      'react-native': '@my/react-native-web' //这个包名是我随便写的哈
    },
    extensions: ['web.js', '.js'],  // 先找.web.js再找.js
    // enforceExtension: true, // 导入语句不能缺省文件后缀
  },

  /*
  生产环境可以使用 none 或者是 source-map，使用 source-map 最终会单独打包出一个 .map 文件，我们可以根据报错信息和此 map 文件，进行错误解析，定位到源代码。
  source-map 和 hidden-source-map 都会打包生成单独的 .map 文件，区别在于，source-map 会在打包出的js文件中增加一个引用注释，以便开发工具知道在哪里可以找到它。hidden-source-map 则不会在打包的js中增加引用注释。
  但是我们一般不会直接将 .map 文件部署到CDN，因为会直接映射到源码，更希望将.map 文件传到错误解析系统，然后根据上报的错误信息，直接解析到出错的源码位置。
  */
  devtool: 'cheap-module-eval-source-map', //开发环境下使用 source-map
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        use: ['babel-loader'],
        exclude: /node_modules/ //排除 node_modules 目录
      },
      {
        test: /\.(s[ac]|c)ss$/, // scss sass css
        // enforce: 'pre', // 修改优先级，enforce 参数，其值可以为: 1. pre 优先处理 2. normal 正常处理（默认）3. inline 其次处理 4. post 最后处理。
        /*
        * style-loader 动态创建 style 标签，将 css 插入到 head 中.
        * css-loader 负责处理 @import 等语句。
        * postcss-loader 和 autoprefixer，自动生成浏览器兼容性前缀 —— 2020了，应该没人去自己徒手去写浏览器前缀了吧
        * sass-loader 负责处理编译 .scss 文件,将其转为 css
        * */
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            // 开发环境下使用
            options: {
              hmr: isDev,
              reloadAll: true,
            }
          }, //替换之前的 style-loader
          // 'style-loader', // 开发模式下
          'css-loader', {
          loader: 'postcss-loader',
          options: {
            plugins: function () {
              return [
                require('autoprefixer')(
                  // 不写的话默认读取browserslist
                  // {
                  //   "overrideBrowserslist": [
                  //     ">0.25%",
                  //     "not dead"
                  //   ]
                  // }
                )
              ]
            }
          }
        },{
          loader: 'sass-loader',
          options: {
            // sass-loader 8.0.0 之后fibers将会自动引入
            implementation: require('sass'),
          },
        }],
        exclude: /node_modules/
      },
      {
        test: /\.(png|jpg|gif|jpeg|webp|svg|eot|ttf|woff|woff2)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 1024, // <1K转为base64 一般为10240 10k
              esModule: false, // esModule 设置为 false，否则，<img src={require('XXX.jpg')} /> 会出现 <img src=[Module Object] />
              name: '[name]_[hash:6].[ext]',
              outputPath: 'assets'
            }
          }
        ],
        exclude: /node_modules/
      },
      // {
      //   test: /.html$/,
      //   // 处理 html 中的本地图片
      //   use: 'html-withimg-loader'
      // }
    ],
  },
  plugins: [
    //数组 放着所有的webpack插件
    new HtmlWebpackPlugin({
      template: './public/index.html',
      filename: 'index.html', //打包后的文件名
      minify: {
        removeAttributeQuotes: false, //是否删除属性的双引号
        collapseWhitespace: false, //是否折叠空白
      },
      // html模板变量
      config: config.template,
      // hash: true //是否加上hash，默认是 false
    }),

    // 配置多个html文件
    // new HtmlWebpackPlugin({
    //   template: './public/login.html',
    //   filename: 'login.html', //打包后的文件名
    //   chunks: ['login']  // 只引入login.js入口引入的文件
    // }),

    //不需要传参数喔，它可以找到 outputPath
    new CleanWebpackPlugin(
      // {
      //   // 不清除文件
      //   cleanOnceBeforeBuildPatterns:['**/*', '!dll', '!dll/**']
      // }
    ),
    new CopyWebpackPlugin([
      {
        from: 'static/js/*.js',
        to: path.resolve(__dirname, 'dist', 'js'),
        flatten: true, // flatten 这个参数，设置为 true，那么它只会拷贝文件，而不会把文件夹路径都拷贝上
      },
      //还可以继续配置其它要拷贝的文件
    ],{
      ignore: ['other.js']
    }),
    // 全局变量
    new webpack.ProvidePlugin({
      React: 'react',
      Component: ['react', 'Component'],
      Vue: ['vue/dist/vue.esm.js', 'default'],
      $: 'jquery',
      _map: ['lodash', 'map']
    }),
    // 抽离出css文件
    new MiniCssExtractPlugin({
      filename: 'css/[name].[hash:6].css' //个人习惯将css文件放在单独目录下
    }),
    new OptimizeCssPlugin(), // 压缩抽离出来的css文件
    new webpack.HotModuleReplacementPlugin(), //热更新插件
    // 定义环境变量,可以在js文件中直接使用这些变量
    new webpack.DefinePlugin({
      DEV: JSON.stringify('dev'), //字符串
      FLAG: 'true' //FLAG 是个布尔类型
    })
  ],
  devServer: {
    port: '3001', //默认是8080
    // 启用 quiet 后，除了初始启动信息之外的任何内容都不会被打印到控制台。这也意味着来自 webpack 的错误或警告在控制台不可见 ———— 我是不会开启这个的，看不到错误日志，还搞个锤子
    quiet: false, //默认不启用
    inline: true, //默认开启 inline 模式，如果设置为false,开启 iframe 模式
    // stats: "errors-only" ， 终端中仅打印出 error，注意当启用了 quiet 或者是 noInfo 时，此属性不起作用。 ————— 这个属性个人觉得很有用，尤其是我们启用了 eslint 或者使用 TS进行开发的时候，太多的编译信息在终端中，会干扰到我们。
    stats: "errors-only", //终端仅打印 error
    // 启用 overlay 后，当编译出错时，会在浏览器窗口全屏输出错误，默认是关闭的。
    overlay: false, //默认不启用
    // clientLogLevel: 当使用内联模式时，在浏览器的控制台将显示消息，如：在重新加载之前，在一个错误之前，或者模块热替换启用时。如果你不喜欢看这些信息，可以将其设置为 silent (none 即将被移除)。
    clientLogLevel: "silent", //日志等级
    compress: true, //是否启用 gzip 压缩
    hot: true
  },
}
