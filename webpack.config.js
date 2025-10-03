const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function (env, argv) {
	const config = await createExpoWebpackConfigAsync(env, argv);

	// Ensure devtool does not use any eval-based variant to satisfy strict CSP
	// e.g., avoid: eval, eval-source-map, cheap-module-eval-source-map, etc.
	if (typeof config.devtool === 'string' && /eval/.test(config.devtool)) {
		config.devtool = 'source-map';
	}
	// If not defined, set a safe default in development as well
	if (!config.devtool && env && env.mode === 'development') {
		config.devtool = 'source-map';
	}

	return config;
};


