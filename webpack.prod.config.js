const webpack = require("webpack");
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const fs = require("fs")
const CleanWebpackPlugin = require("clean-webpack-plugin");
//extract-text-webpack-plugin暂时不支持
// const ExtractTextWebpackPlugin = require("extract-text-webpack-plugin");
//webpack4.0采用mini-css-extract-plugin打包压缩css
const MiniCssExtractPlugin=require("mini-css-extract-plugin");

//压缩js和css
const UglifyJsPlugin=require("uglifyjs-webpack-plugin");
const OptimizeCssAssetsPlugin=require("optimize-css-assets-webpack-plugin");

//获取template的列表，动态配置htmlWebpackPlugin
const templatePath = "./src/template";

const templateList = fs.readdirSync(path.resolve(__dirname, templatePath)).map((item, index) => {
    var name = item.split(".");
    name.splice(-1);
    return name.join(".");
})
console.log(templateList)

const Entries = {}
const htmlPlugins = templateList.map((item, index) => {
    Entries[item] = path.resolve(__dirname, `./src/entry/${item}.js`)
    return new HtmlWebpackPlugin({
        filename: path.resolve(__dirname, `./dist/${item}.html`),
        template: path.resolve(__dirname, `./src/template/${item}.html`),
        chunks: [item, "vendor"],
        inject: 'body',//指定js插入的位置，默认body，head插入head内，true插入body下面，false则不插入
        minify: {
            caseSensitive: true,//开启大小写敏感
            removeAttributeQuotes: false,//去除html属性的引号
            removeEmptyAttributes: true,//去除空属性
            removeEmptyElements: false,//去除空元素
            // collapseWhitespace:true,//去除空格
        }
    })
})


module.exports = {
    entry: Entries,
    output: {
        filename: "js/[name]-[hash:5].bundle.js",
        path: path.resolve(__dirname, "./dist/static/"),
        chunkFilename:"js/[name].bundle.js"
    },
    module: {
        rules: [{
            test: /\.css$/,
            use:[
                MiniCssExtractPlugin.loader,
                "css-loader",
            ]
            //extract-text-webpack-plugin暂时还不支持webpack4.0
            // use: ExtractTextWebpackPlugin.extract([
            //     "style-loader",
            //     "css-loader",
            // ])
        }, {
            test: /\.less$/,
            use: [
                MiniCssExtractPlugin.loader,
                "css-loader",
                "less-loader"
            ]
        },{
            test:/\.js$/,
            use:["babel-loader"],
            exclude:/node_modules/,
            include:path.resolve(__dirname,"./src"),
        }, {
            test:/\.(png|jpg|jpeg|gif|svg)$/,
            use:"url-loader?limit=8192&name=images/[name].[hash].[ext]"
            // use:[{
            //     loader:["url-loader"],
            //     options:{
            //         limit:8192,
            //         // output:"images",
            //         name:"images/[name].[hash].[ext]"
            //     }
            // }]
        },{
            test:/\.html$/,
            use:"html-withimg-loader?limit=8192&name=mages/[name].[hash].[ext]"
        },{
            test:/\.(woff|eot|ttf)$/,
            use:"file-loader?limit=8192&name=font/[name].[hash].[ext]"
            // use:[{
            //     loader:["url-loader"],
            //     options:{
            //         limit:8192,
            //         name:"font/[name].[hash].[ext]"
            //     }
            // }]
        }]
    },
    plugins: [
        new CleanWebpackPlugin(['./dist']),//打包时清空文件夹
        // new HtmlWebpackPlugin(),//htmlWebpackPlugin简单替换html文件
        ...htmlPlugins,
        //提取css
        // new ExtractTextWebpackPlugin("./dist/main.css")
        new MiniCssExtractPlugin({
            filename:"css/[name]-[hash:5].css",//相对于output里的path的路径，不会重新计算路径
            chunkFilename:"[id].css",
        }),
        //提取公共模块   4.0已移除
        // new webpack.optimize.CommonsChunkPlugin({
        //     name:"common"
        // })
        //
    ],
    optimization:{
        // runtimeChunk:{
        //     name:"manifest"
        // },
        //压缩js和css
        minimizer:[
            new UglifyJsPlugin({
                cache:true,
                parallel:true,
                sourceMap:true,
                // beautify:false,//格式化代码
            }),
            new OptimizeCssAssetsPlugin({})
        ],
        splitChunks:{
            cacheGroups:{
                vendor:{
                    name:"vendor",
                    chunks:"initial",
                    // filename:"js/[name].js",
                    test:/[\\/]node_modules[\\/](.*)\.js$/,//只打包node_modules下的模块
                },
                //合并css，暂时不合并
                // styles:{
                //     name:"styles",
                //     chunks:"initial",
                //     test:/[\\/]node_modules[\\/](.*)\.css$/
                // }
                // styles: {
                //     name: 'styles',
                //     filename:"[name]-[hash:5].css",
                //     test: /\.css$/,
                //     chunks: 'all',
                //     // minChunks: 2,
                //     // enforce: true
                //   }
            }
        }
    },
    performance:{
        hints:"warning",//打包出来的文件超出250kb会报出警告，默认warning，设为false将忽略警告，设为error将中断程序
        maxEntrypointSize:500000,//入口文件体积上限，默认250000
        maxAssetSize:500000,//打包出来的文件体积上限，默认250000
        assetFilter:function(assetFilename){//控制报警文件的格式
            return assetFilename.endsWith(".css")
        }
    }
}