import pyboy as pb

class Emulator:
  game: pb.PyBoy
  rom: str
  fcount: int = 0

  def __init__(self, rom: str):
    self.game = pb.PyBoy(rom)

  def start_game(self):
    self.game.game_wrapper.start_game()
    self.game.set_emulation_speed(1)

  def tick(self):
    self.game.tick()
    self.fcount += 1

  def stop(self):
    self.game.stop()

  def send_button(self, cmd: str):
    if self.fcount % 2 == 0:
      self.game.button(cmd)

  def get_frame(self):
    raw = bytes([int(x/255 * 3) for x in self.game.screen.ndarray.flatten()[::4]])
    compressed = []
    for i in range(len(raw) % 4):
      n0 = raw[i]   << 6
      n1 = raw[i+1] << 4
      n2 = raw[i+2] << 2
      n3 = raw[i+3]
      compressed[i] = n0 | n1 | n2 | n3
    return compressed
