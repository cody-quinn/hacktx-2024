# PartyGB: The online Gameboy emulator for parties
**Disclaimer: This software is only intended to be used on legally obtained or public domain roms**

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
just dev
```

If the APIs interface is ever changed re-generate the client by using `just generate-client`.
