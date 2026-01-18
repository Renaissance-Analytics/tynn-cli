\
#!/usr/bin/env bash
# Shared helpers for wish-cli scripts
set -o errexit -o nounset -o pipefail

log() { printf "%s\n" "$*"; }
warn() { printf "⚠️  %s\n" "$*" >&2; }
die() { printf "❌ %s\n" "$*" >&2; exit 1; }

need_cmd() { command -v "$1" >/dev/null 2>&1 || die "Missing required command: $1"; }
need_file() { [[ -f "$1" ]] || die "Missing required file: $1"; }

# Resolve this repo root from a script located in bin/
repo_root() {
  local src="${BASH_SOURCE[0]}"
  local bin_dir
  bin_dir="$(cd "$(dirname "$src")" && pwd)"
  (cd "$bin_dir/.." && pwd)
}
