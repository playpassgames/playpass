#!/bin/sh -e

sdk_dir="$PWD"
project_dir=`mktemp -d -u`
tarball=`npm pack`

node "$sdk_dir/dist/cjs/cli/index.js" create "$project_dir" --local --template https://github.com/playpassgames/playpass-game-template
cd "$project_dir"

# Install our development version of Playpass
npm install "$sdk_dir/$tarball"

npx playpass help
npm run build

# TODO(2022-06-05): Deploy projects in CLI smoke test
# npx playpass deploy
