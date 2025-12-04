{ pkgs ? import <nixpkgs> {} }:

let
  unstable = import (fetchTarball {
    url = "https://github.com/NixOS/nixpkgs/archive/nixos-unstable.tar.gz";
  }) {
    inherit (pkgs) system;
    config = pkgs.config;
  };
in pkgs.mkShell {
  buildInputs = with pkgs; [
    unstable.deno
  ];

  shellHook = ''
    echo "OpenCode Plugins Development Environment"
    echo "Deno version: $(deno --version | head -1)"
  '';
}
