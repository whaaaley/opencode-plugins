#!/usr/bin/env bash
# Shared library functions for tmux workspace management

# Detect project/workspace name
detect_workspace_name() {
  # Try git root first
  if git rev-parse --show-toplevel &>/dev/null; then
    basename "$(git rev-parse --show-toplevel)"
  else
    # Fall back to current directory name
    basename "$PWD"
  fi
}

# Check if a tmux session exists
session_exists() {
  local session_name="$1"
  tmux has-session -t "$session_name" 2>/dev/null
}

# Create a new tmux window
create_window() {
  local session_name="$1"
  local window_index="$2"
  local window_name="$3"
  local working_dir="$4"
  
  tmux new-window -t "$session_name:$window_index" -n "$window_name" -c "$working_dir"
}

# Rename a window
rename_window() {
  local session_name="$1"
  local window_index="$2"
  local window_name="$3"
  
  tmux rename-window -t "$session_name:$window_index" "$window_name"
}

# Select a window
select_window() {
  local session_name="$1"
  local window_index="$2"
  
  tmux select-window -t "$session_name:$window_index"
}

# Load project-specific workspace config
load_project_config() {
  local workspace_root="$1"
  local config_file="$workspace_root/.workspace.sh"
  
  if [ -f "$config_file" ]; then
    echo "Loading project config: .workspace.sh"
    source "$config_file"
    return 0
  fi
  return 1
}
