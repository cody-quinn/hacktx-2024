# HackTX 2024 Hackathon

## Team: Tsundere Simp Association
- [Nic Gaffney](https://github.com/nic-gaffney)
- [Cody Quinn](https://github.com/cody-quinn)
- [Rahul Myana](https://github.com/Ramenisneat)

## Accessing Development Environment

Requirements: Nix

If you have [direnv](https://direnv.net/) installed changing into the project directory will automatically put you into 
a development shell, otherwise run `nix develop`.

Once in this shell run the following commands

```shell
just datagen # Populates the database. Only run this once!
just dev
```

If the APIs interface is ever changed re-generate the client by using `just generate-client`.
