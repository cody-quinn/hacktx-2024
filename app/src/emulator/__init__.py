import pyboy as pb

class Emulator:
  game: pb.PyBoy
  rom: str

  framecount: int = 0
  framebuffer: bytes

  def __init__(self, rom: str):
    self.rom = rom
    self.game = pb.PyBoy(rom)

  def start(self):
    self.game.game_wrapper.start_game(timer_div=0x00)
    # self.game.set_emulation_speed(0)

  def stop(self):
    self.game.stop()

  def tick(self):
    self.game.tick()
    self.framecount += 1

  def send_button(self, cmd: str):
    if self.framecount % 2 == 0:
      self.game.button(cmd)

  def update_framebuffer(self):
    raw = self.game.screen.ndarray.flatten()
    buf = [0] * (len(raw) // 16 + 1)
    for i, j in enumerate(range(0, len(raw), 16)):
      n0 = raw[j]    // 85 << 6
      n1 = raw[j+4]  // 85 << 4
      n2 = raw[j+8]  // 85 << 2
      n3 = raw[j+12] // 85
      buf[i] = n0 | n1 | n2 | n3
    self.framebuffer = bytes(buf)
