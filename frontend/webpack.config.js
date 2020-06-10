const HtmlWebpackPlugin = require("html-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const { EnvironmentPlugin } = require("webpack");
const { join, resolve } = require("path");

const isProduction = process.env.NODE_ENV === "production";

module.exports = {
  entry: "./src/index.tsx",

  output: {
    filename: isProduction ? "[name].[contenthash].js" : "[name].[hash].js",
    chunkFilename: isProduction
      ? "[name].[contenthash].js"
      : "[name].[hash].js",
    path: __dirname + "/dist",
  },

  resolve: {
    extensions: [".ts", ".tsx", ".js", ".json"],
  },

  optimization: isProduction
    ? {
        minimizer: [
          new TerserPlugin({
            terserOptions: {
              output: {
                comments: false,
              },
            },
          }),
        ],
        runtimeChunk: "single",
        splitChunks: {
          chunks: "all",
          maxInitialRequests: Infinity,
          minSize: 0,
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: (module) => {
                const packageName = module.context.match(
                  /[\\/]node_modules[\\/](.*?)([\\/]|$)/,
                )[1];

                return `vendor.${packageName.replace("@", "")}`;
              },
            },
          },
        },
      }
    : undefined,

  module: {
    rules: [
      {
        test: /src\/.+\.tsx?$/,
        loader: "awesome-typescript-loader",
        options: isProduction
          ? undefined
          : {
              getCustomTransformers: join(
                __dirname,
                "webpack.styled-components.js",
              ),
            },
      },
      {
        test: /\.(png|jpg|svg)$/,
        loader: "file-loader",
        options: {
          outputPath: "assets/",
        },
      },
    ],
  },

  plugins: [
    new EnvironmentPlugin({
      API_BASE_URL: "/api",
      NODE_ENV: "development",
    }),
    new HtmlWebpackPlugin({
      template: "./src/index.html",
    }),
  ],

  devServer: {
    historyApiFallback: true,
  },
};
