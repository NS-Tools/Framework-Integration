const SuiteCloudJestUnitTestRunner = require('@oracle/suitecloud-unit-testing/services/SuiteCloudJestUnitTestRunner');

module.exports = {
	defaultProjectFolder: 'dist',
	commands: {
		"project:deploy": {
			beforeExecuting: async args => {
				await SuiteCloudJestUnitTestRunner.run({
				    testPathIgnorePatterns: [
						"/node_modules/",
						"/Framework/",
						"/dist/"
					],
					modulePathIgnorePatterns: [
						"/node_modules/",
						"/Framework/",
						"/dist/"
					]
				});
				return args;
			},
		},
	},
};
