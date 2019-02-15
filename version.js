const {gitDescribeSync} = require('git-describe');
// const {version} = require('package.json');
const {resolve, relative} = require('path');
const {writeFileSync, readFileSync} = require('fs-extra');

const package = readFileSync(resolve(__dirname, 'package.json'), 'utf8');

const gitInfo = gitDescribeSync({
  longSemver: true,
  tags: true
});

gitInfo.version = JSON.parse(package).version;

const file = resolve(__dirname, 'src', 'environments', 'version.ts');
writeFileSync(file,
  `// IMPORTANT: THIS FILE IS AUTO GENERATED! DO NOT MANUALLY EDIT OR CHECKIN!
/* tslint:disable */
export const VERSION = ${JSON.stringify(gitInfo, null, 4)};
/* tslint:enable */
`, {encoding: 'utf-8'});

console.log(`Wrote version info ${gitInfo.version} to ${relative(resolve(__dirname, '..'), file)}`);
