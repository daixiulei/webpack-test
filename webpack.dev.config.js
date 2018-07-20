var webpack=require("webpack");
var path=require("path");
var fs=require("fs");
var HtmlWebpackPlugin=require("html-webpack-plugin");
var MiniCssExtractPlugin=require("mini-css-extract-plugin");

//获取template的列表，动态配置htmlWebpackPlugin
const templatePath = "./src/template";

const templateList = fs.readdirSync(path.resolve(__dirname, templatePath)).map((item, index) => {
    var name = item.split(".");
    name.splice(-1);
    return name.join(".");
})
const Entries = {}
const htmlPlugins = templateList.map((item, index) => {
    Entries[item] = path.resolve(__dirname, `./src/entry/${item}.js`)
    return new HtmlWebpackPlugin({
        filename: path.resolve(__dirname, `./dev/${item}.html`),
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


module.exports={
    entry:Entries,
    output: {
        filename: "dev/js/[name].bundle.js",
        path: path.resolve(__dirname, "dev"),
    },
    devtool:"source-map",
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
    devServer:{
        port:8888,
        contentBase:path.resolve(__dirname,"/"),
        compress:true,//gzip压缩
        inline:true,//默认构建信息添加到控制台
        hot:true,
    },
    plugins:[
        new webpack.HotModuleReplacementPlugin(),
        ...htmlPlugins,
        //提取css
        // new ExtractTextWebpackPlugin("./dist/main.css")
        new MiniCssExtractPlugin({
            filename:"dev/css/[name].css",//相对于output里的path的路径，不会重新计算路径
            chunkFilename:"[id].css",
        }),
    ]
}