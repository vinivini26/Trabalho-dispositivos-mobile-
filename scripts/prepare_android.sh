#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
command -v flutter >/dev/null
if [ ! -d android ]; then
  scratch_dir=$(mktemp -d)
  trap 'rm -rf "$scratch_dir"' EXIT
  flutter create --platforms=android --org br.com.fintrack --project-name fintrack --no-pub "$scratch_dir/fintrack"
  cp -R "$scratch_dir/fintrack/android" ./android
fi
flutter pub get
flutter analyze
flutter test
flutter build apk --debug
