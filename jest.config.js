const { createDefaultPreset } = require("ts-jest");
const tsJestTransformCfg = createDefaultPreset().transform;
const SuiteCloudJestConfiguration = require("@oracle/suitecloud-unit-testing/jest-configuration/SuiteCloudJestConfiguration");
const cliConfig = require("./suitecloud.config");

const suiteCloudBaseConfiguration = SuiteCloudJestConfiguration.build({
	projectFolder: cliConfig.defaultProjectFolder,
	projectType: SuiteCloudJestConfiguration.ProjectType.ACP,
});

suiteCloudBaseConfiguration.transform = {
  ...suiteCloudBaseConfiguration.transform,
  ...tsJestTransformCfg,
};

module.exports = suiteCloudBaseConfiguration
