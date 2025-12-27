#!/usr/bin/env bash
# Module for detecting and handling existing tmux sessions

# Check if we're currently inside a tmux session
in_tmux() {
  [ -n "$TMUX" ]
}

# Add workspace windows to current tmux session
add_workspace_windows() {
  local workspace_root="$1"
  local workspace_name=$(detect_workspace_name)

  echo "Already in tmux. Adding workspace window..."

  # Add workspace window with detected name and switch to it
  tmux new-window -n "$workspace_name" -c "$workspace_root"
  tmux select-window -t "$workspace_name"
}
