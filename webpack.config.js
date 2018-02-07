const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const merge = require("webpack-merge");
const CleanWebpackPlugin = require("clean-webpack-plugin");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const webpack = require("webpack");
const OptimizeCssAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const StyleLintPlugin = require("stylelint-webpack-plugin");
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
const ScriptExtHtmlWebpackPlugin = require("script-ext-html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackPugPlugin = require("html-webpack-pug-plugin");

const PATHS = {
  source: path.join(__dirname, "source"),
  dist: path.join(__dirname, "dist")
};

module.exports = {
  entry: {
    index: "./app/pages/index/index.js"
  },
  output: {
    path: PATHS.dist,
    filename: "./js/[name].bundle.js"
  },
  module: {
    rules: [
      {
        test: /\.pug$/,
        loader: "pug-loader",
        options: {
          pretty: true
        }
      },

      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,

        loader: "babel-loader"
      },
      {
        test: /\.scss$/,
        use: ExtractTextPlugin.extract({
          publicPath: "../",
          use: [
            {
              loader: "css-loader",
              options: {
                sourceMap: true
              }
            },
            {
              loader: "postcss-loader",
              options: {
                sourceMap: true
              }
            },
            {
              loader: "sass-loader",
              options: {
                sourceMap: true
              }
            }
          ]
        })
      },
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          publicPath: "../",
          use: [
            "css-loader",
            {
              loader: "postcss-loader",
              options: {
                sourceMap: true
              }
            }
          ]
        })
      },
      {
        test: /\.vue$/,
        loader: "vue-loader",
        options: {
          loaders: {
            // Since sass-loader (weirdly) has SCSS as its default parse mode, we map
            // the "scss" and "sass" values for the lang attribute to the right configs here.
            // other preprocessors should work out of the box, no loader config like this necessary.
            scss: [
              "vue-style-loader",
              "css-loader",
              "sass-loader",
              {
                loader: "sass-resources-loader",
                options: {
                  // Or array of paths
                  resources: [
                    "./app/sass/_variables.scss",
                    "./app/sass/_mixin.scss"
                  ]
                }
              }
            ],
            sass: [
              "vue-style-loader",
              "css-loader",
              "sass-loader?indentedSyntax",
              "sass-resources-loader",
              {
                loader: "sass-resources-loader",
                options: {
                  // Or array of paths
                  resources: [
                    "./app/sass/_variables.scss",
                    "./app/sass/_mixin.scss"
                  ]
                }
              }
            ]
          }
          // other vue-loader options go here
        }
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        use: [
          {
            loader: "file-loader",
            options: {
              name: "images/[name].[ext]"
            }
          }
        ]
      },
      {
        test: /\.(woff|woff2)$/,
        use: [
          {
            loader: "file-loader",
            options: {
              name: "fonts/[name].[ext]"
            }
          }
        ]
      },
      {
        enforce: "pre",
        test: /\.js$/,
        exclude: /node_modules/,
        loader: "eslint-loader",
        options: {
          fix: true
        }
      }
    ]
  },
  resolve: {
    alias: {
      styles: path.resolve(__dirname, "./app/vue/styles/"),
      handlebars: "handlebars/dist/handlebars.min.js"
    }
  },
  plugins: [
    new ExtractTextPlugin("./css/[name].css"),
    new HtmlWebpackPlugin({
      filename: "index.html",
      // указываем подключаемый budle
      chunks: ["index"],
      inject: "head",
      template: "./app/pug/pages/index.pug"
    })
  ]
};

console.log(process.env.NODE_ENV);

// продакшн (компилировать все pug файлы в html не надо. а надо сдеать pug файлы со скриптами уже подключенными)
// не pug loader чтобы не компилировались файлы pug
if (process.env.NODE_ENV === "production") {
  console.log("production mode");
  // module.exports.devtool = "#source-map";

  module.exports.plugins = (module.exports.plugins || []).concat([
    new CleanWebpackPlugin("dist"),
    new OptimizeCssAssetsPlugin({
      cssProcessorOptions: { discardComments: { removeAll: true } }
    })
  ]);
}

// для разработки
if (process.env.NODE_ENV === "development") {
  console.log("development mode");
  //функция которая возвращает следить или нет в зависимости от глобальной переменной NODE_ENV, которая устанавливается в scripts npm
  module.exports.watch = (function() {
    return process.env.NODE_ENV === "development";
  })();
  module.exports.devtool = "inline-source-map"; // any "source-map"-like devtool is possible
}
