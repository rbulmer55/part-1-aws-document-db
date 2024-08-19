require('dotenv').config();
// eslint-disable-next-line n/no-unpublished-require
const { pathsToModuleNameMapper } = require('ts-jest');
const { compilerOptions } = require('./.ts-path-config.json');

const testRootPattern =
	process.env.NODE_ENV === 'integration' ? 'integration' : 'src|infra';

module.exports = {
	preset: 'ts-jest',
	resetMocks: true,
	collectCoverage: false,
	collectCoverageFrom: [
		`(${testRootPattern})/**/*`,
		'!**/(__mocks__|schemas|.serverless|.webpack|.build)/**/*.[jt]s?(x)',
		'!**/(test-utils|config).ts',
	],
	testRegex: `(${testRootPattern})\/.*\.(spec|test)\.[jt]s?$`,
	moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {
		prefix: '<rootDir>/',
	}),
};
