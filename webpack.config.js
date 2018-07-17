const webpack = require("webpack");
const path=require("path");
const HtmlWebpackPlugin=require("html-webpack-plugin");
const fs=require("fs")
const CleanWebpackPlugin=require("clean-webpack-plugin");

//获取template的列表，动态配置htmlWebpackPlugin
const templatePath="./src/template";

const templateList=fs.readdirSync(path.resolve(__dirname,templatePath)).map((item,index)=>{
    var name=item.split(".");
    name.splice(-1);
    return name.join(".");
})
console.log(templateList)

const Entries={}
const htmlPlugins=templateList.map((item,index)=>{
    Entries[item]=path.resolve(__dirname,`./src/entry/${item}.js`)
    return new HtmlWebpackPlugin({
        filename:`${item}.html`,
        template:path.resolve(__dirname,`./src/template/${item}.html`),
        chunks:[item,"vendor"]
    })
})


module.exports={
    entry:Entries,
    output:{
        filename:"[name]-[hash:5].bundle.js",
        path:path.resolve(__dirname,"./dist/static/js")
    },
    module:{
        rules:[]
    },
    plugins:[
        new CleanWebpackPlugin(['./dist']),//打包时清空文件夹
        // new HtmlWebpackPlugin(),//htmlWebpackPlugin简单替换html文件
        ...htmlPlugins,
    ]
}