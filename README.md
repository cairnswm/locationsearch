LocationSearch
================

Small React + Vite component library for location searching.

Installing
----------

There are two common ways to obtain this package from GitHub:

1) Install from GitHub Packages (npm registry)

- This project is published to GitHub Packages under a scoped name (for example `@cairnswm/LocationSearch`).
- To install from GitHub Packages you must configure npm to use the GitHub Packages registry and authenticate with a token.

Example (user installing a released package):

1. Configure the registry for the scope in your project (or global):

   Create a `.npmrc` in your project with:

   //npm.pkg.github.com/:_authToken=${NPM_TOKEN}
   @cairnswm:registry=https://npm.pkg.github.com

   Then install:

   npm install @cairnswm/LocationSearch

Note: Replace `@cairnswm` with the package scope that the repository is published under.

2) Install directly from the GitHub repository

If you want to install the package directly from the repository (no publish step), you can use npm's GitHub shorthand:

   npm install github:cairnswm/locationsearch

Or a specific branch/tag:

   npm install github:cairnswm/locationsearch#main

CI / Workflow notes
-------------------

- The repository includes a GitHub Actions workflow that publishes the package to GitHub Packages. The workflow updates `package.json` scope and runs `npm publish`.
- Some native optional dependencies (like rollup's optional native binaries) can fail to install in CI. The workflow installs dependencies with optional packages disabled to avoid the failure:

   NPM_CONFIG_OPTIONAL=false npm ci --no-optional

- If you run into npm optional-dependency install issues locally or in CI, try removing `node_modules` and `package-lock.json` and reinstalling locally (`npm i`) to refresh the lockfile.

Troubleshooting
---------------

- If you see errors about missing `@rollup/rollup-*-gnu` or similar native rollup packages during `npm ci`, ensure CI is running `npm ci --no-optional` or set `NPM_CONFIG_OPTIONAL=false` in the environment.
- If publishing fails, ensure your repo has the correct `name` (scoped) and `private` field in `package.json`, or set `publishConfig.registry` as required.

License
-------

MIT
