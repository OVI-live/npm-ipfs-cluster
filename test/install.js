const fs = require('fs-extra')
const path = require('path')
const test = require('tape')
const execa = require('execa')
const cachedir = require('cachedir')

/*
  Test that correct ipfs-cluster-follow is downloaded during npm install.
*/

const expectedVersion = require('../package.json').version

async function clean () {
  await fs.remove(path.join(__dirname, 'fixtures', 'example-project', 'node_modules'))
  await fs.remove(path.join(__dirname, 'fixtures', 'example-project', 'package-lock.json'))
  await fs.remove(cachedir('ipfs-cluster-follow'))
}

test.onFinish(clean)

test('Ensure ipfs-cluster-follow defined in package.json is fetched on dependency install', async (t) => {
  await clean()

  const exampleProjectRoot = path.join(__dirname, 'fixtures', 'example-project')

  // from `example-project`, install the module
  execa.sync('npm', ['install'], {
    cwd: exampleProjectRoot
  })

  // confirm package.json is correct
  const fetchedVersion = require(path.join(exampleProjectRoot, 'node_modules', 'ipfs-cluster-follow', 'package.json')).version
  t.ok(expectedVersion === fetchedVersion, `package.json versions match '${expectedVersion}'`)

  // confirm binary is correct
  const binary = path.join(exampleProjectRoot, 'node_modules', 'ipfs-cluster-follow', 'bin', 'ipfs-cluster-follow')
  const versionRes = execa.sync(binary, ['--version'], {
    cwd: exampleProjectRoot
  })

  t.ok(versionRes.stdout === `ipfs-cluster-follow version ${expectedVersion}`, `ipfs-cluster-follow --version output match '${expectedVersion}'`)

  t.end()
})
