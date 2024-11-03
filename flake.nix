{
  inputs.nixpkgs.url = "github:NixOS/nixpkgs/master";
  inputs.pre-commit-hooks.url = "github:cachix/git-hooks.nix";

  outputs =
    { self, nixpkgs, ... }@inputs:
    let
      system = "x86_64-linux";
      pkgs = import nixpkgs { system = system; };
    in
    {
      formatter.${system} = nixpkgs.legacyPackages.x86_64-linux.nixfmt-rfc-style;
      checks.${system}.pre-commit-check = inputs.pre-commit-hooks.lib.${system}.run {
        src = ./.;
        hooks = {
          nixfmt-rfc-style.enable = true;
          prettier = {
            enable = true;
            entry = "prettier '**/*.{js,jsx,ts,tsx}' '!**/*.gen.*' --check";
            pass_filenames = false;
          };
          typescript = {
            enable = true;
            entry = "pnpm -C frontend run typecheck";
            pass_filenames = false;
          };
          pyright = {
            enable = true;
            entry = "pyright -p app";
            pass_filenames = false;
          };
        };
      };
      devShells.${system}.default = pkgs.mkShell {
        inherit (self.checks.${system}.pre-commit-check) shellHook;

        packages =
          with pkgs;
          [
            just
            concurrently
            nodejs_22
            pnpm
            python312
            pyright
            uv
            typescript
            libz
          ]
          ++ self.checks.${system}.pre-commit-check.enabledPackages;

        LD_LIBRARY_PATH = pkgs.lib.makeLibraryPath (
          with pkgs;
          [
            stdenv.cc.cc.lib
            libz
          ]
        );
      };
    };
}
