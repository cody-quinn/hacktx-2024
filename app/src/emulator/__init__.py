import pyboy as pb

valid_inputs = [
  "nothing"
  "left",
  "right",
  "up",
  "down",
  "a",
  "b",
  "start",
  "select",
]

class Emulator:
  game: pb.PyBoy
  rom: str
  held: str | None
  prev: int
  curr: int
  framebuffer: bytes

  def __init__(self, rom: str):
    self.held = None
    self.rom = rom
    self.game = pb.PyBoy(rom)
    self.curr = 0

  def start(self):
    self.game.game_wrapper.start_game(timer_div=0x00)
    # self.game.set_emulation_speed(0)

  def stop(self):
    self.game.stop()

  def tick(self):
    self.game.tick()
    # self.framecount += 1

  def send_button(self, cmd: str, hold=False):
    if cmd.split(":")[0] == "nothing":
      return
    if hold:
      if self.held is not None and self.held != cmd:
        self.game.button_release(self.held)
      self.game.button_press(cmd)
      self.held = cmd
      return
    if self.held is not None:
      self.game.button_release(self.held)
    self.held = None
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
    self.prev = self.curr
    self.curr = hash(self.framebuffer)
