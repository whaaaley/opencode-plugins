#!/usr/bin/env bash
# Tmux keybinding configuration

setup_keybindings() {
  local session_name="$1"
  local workspace_root="$2"
  
  # Ctrl+b t -> popup scratch pane (throwaway terminal)
  tmux bind-key -T prefix t display-popup -E -w 80% -h 80% -d "$workspace_root"
  
  # Ctrl+b T -> horizontal scratch pane that persists
  tmux bind-key -T prefix T split-window -v -c "$workspace_root"
  
  # Add more keybindings here as needed
  # Example: Ctrl+b r -> reload tmux config
  # tmux bind-key -T prefix r source-file ~/.tmux.conf
}
