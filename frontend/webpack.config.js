const ReactRefreshPlugin = require("@pmmmwh/react-refresh-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const { EnvironmentPlugin } = require("webpack");
const { join, resolve } = require("path");
const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");

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
        },
      }
    : undefined,

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [
          !isProduction && {
            loader: "babel-loader",
            options: {
              plugins: ["react-refresh/babel"],
            },
          },
          {
            loader: "ts-loader",
            options: {
              // we use tsc to check for errors instead
              transpileOnly: true,
            },
          },
        ].filter(Boolean),
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
    !isProduction && new ReactRefreshPlugin(),
    new EnvironmentPlugin({
      API_BASE_URL: "/api",
      NODE_ENV: "development",
    }),
    new HtmlWebpackPlugin({
      template: "./src/index.html",
    }),
    new BundleAnalyzerPlugin({
      analyzerMode: "static",
      openAnalyzer: false,
      reportFilename: "../bundle/report.html",
    }),
  ].filter(Boolean),

  devServer: {
    historyApiFallback: true,
  },
};
