const { resolve } = require("path");

module.exports = {
	entry: "./src/index.ts",
	mode: "production",
	devtool: "source-map",
	output: {
		path: resolve(__dirname, "dist"),
		filename: "index.js",
		libraryTarget: 'umd',
	},
	module: {
		rules: [
			{
				test: /\.ts$/,
				use: "ts-loader",
				exclude: /node_modules/,
			},
		],
	},
	resolve: {
		extensions: [".ts", ".js"],
	},
};
