#!/usr/bin/env bash
# Shared helper functions and variables for opencode-plugins scripts

# Directory paths
get_repo_root() {
  local script_dir="$1"
  echo "$(cd "$script_dir/.." && pwd)"
}

get_features_dir() {
  local repo_root="$1"
  echo "$repo_root/features"
}

get_global_plugin_dir() {
  echo "$HOME/.config/opencode/plugin"
}

get_global_tool_dir() {
  echo "$HOME/.config/opencode/tool"
}

# Plugin operations
list_plugins() {
  local features_dir="$1"
  # Look for plugin.ts or plugin.js in feature subdirectories
  for feature_dir in "$features_dir"/*/; do
    if [ -d "$feature_dir" ]; then
      if [ -f "$feature_dir/plugin.js" ]; then
        echo "$feature_dir/plugin.js"
      elif [ -f "$feature_dir/plugin.ts" ]; then
        echo "$feature_dir/plugin.ts"
      fi
    fi
  done
}

list_tools() {
  local features_dir="$1"
  # Look for tool.ts or tool.js in feature subdirectories
  for feature_dir in "$features_dir"/*/; do
    if [ -d "$feature_dir" ]; then
      if [ -f "$feature_dir/tool.js" ]; then
        echo "$feature_dir/tool.js"
      elif [ -f "$feature_dir/tool.ts" ]; then
        echo "$feature_dir/tool.ts"
      fi
    fi
  done
}

get_feature_name() {
  local feature_path="$1"
  # Get parent directory name + filename
  # e.g., features/whitespace-trimmer/plugin.js -> whitespace-trimmer.js
  local feature_dir=$(basename "$(dirname "$feature_path")")
  local ext="${feature_path##*.}"
  echo "$feature_dir.$ext"
}
