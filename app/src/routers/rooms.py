import asyncio
import datetime

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from pydantic import BaseModel
from src.emulator import Emulator

router = APIRouter()

valid_inputs = [
  "nothing",
  "left",
  "right",
  "up",
  "down",
  "a",
  "b",
  "start",
  "select",
]

class Rom(BaseModel):
  id: str
  art: str
  title: str
  author: str
  link: str

class RomPrivate(Rom):
  filename: str

roms = {
  "mud": RomPrivate(
    id="mud",
    art="/assets/mud.png",
    title="Mud Warrior",
    filename="./app/games/mud.gb",
    author="Ryan's Veeder",
    link="https://polyducks.itch.io/mud-warriors-gameboy",
  ),
  "muffinalpaca": RomPrivate(
    id="muffinalpaca",
    art="/assets/muffinalpaca.png",
    title="Muffin the Alpaca",
    filename="./app/games/muffinalpaca.gb",
    author="Fronze",
    link="https://fronze.itch.io/muffin-the-alpaca"
  ),
  "espeto": RomPrivate(
    id="espeto",
    art="/assets/espeto.png",
    title="Espeto Blast!",
    filename="./app/games/espeto.gb",
    author="sergeeo",
    link="https://sergeeo.itch.io/espeto-blast"
  ),
  "hungrymonster": RomPrivate(
    id="hungrymonster",
    art="/assets/hungrymonster.png",
    title="Hungry Monster",
    filename="./app/games/hungrymonster.gb",
    author="rVaquero",
    link="https://rvaquero.itch.io/hungry-monster"
  ),
  "doom": RomPrivate(
    id="doom",
    art="/assets/doom.png",
    title="DOOM for GB",
    filename="./app/games/doom.gb",
    author="Villagerjj",
    link="https://villagerjj.itch.io/doomgb"
  ),
  "sovietsnake": RomPrivate(
    id="sovietsnake",
    art="/assets/sovietsnake.png",
    title="Soviet Snake",
    filename="./app/games/sovietsnake.gb",
    author="danim",
    link="https://danim.itch.io/sovie-snake-html-5"
  ),
}

@router.get("/roms", response_model=list[Rom])
def get_roms() -> list[RomPrivate]:
  return list(roms.values())

def id_generator():
  next_id = 0
  while True:
    next_id += 1
    yield next_id

room_id = id_generator()
player_id = id_generator()

class Player:
  sock: WebSocket

  id: int
  nick: str
  fresh: bool

  def __init__(self, sock: WebSocket, nick: str | None = None):
    if nick is None:
      nick = "Player"

    self.id = next(player_id)
    self.nick = nick
    self.fresh = True
    self.sock = sock

  async def send(self, message: bytes):
    if self.sock is not None:
      await self.sock.send_bytes(message)

class Room:
  # thread: threading.Thread
  task2: asyncio.Task | None
  task: asyncio.Task | None
  emulator: Emulator
  purgable: bool
  id: int
  players: list[Player]
  rom: RomPrivate
  inputs: dict[int,str]
  started_at: datetime.datetime

  def __init__(self, rom: RomPrivate):
    self.rom = rom
    self.purgable = False
    self.task = None
    self.task2 = None
    self.emulator = Emulator(rom.filename)

    self.id = next(room_id)
    self.players = []
    self.inputs = {}

    self.started_at = datetime.datetime.now(datetime.UTC)

  def player_join(self, player: Player):
    if player in self.players:
      return
    self.players.append(player)
    self.purgable = True

  def player_leave(self, player: Player):
    self.players.remove(player)

  # def run(self):
  #   self.thread = threading.Thread(target = asyncio.run, args = (self.run_internal(), ))
  #   self.thread.start()

  # async def run_internal(self):
  #   while self.running:
  #     await self.tick()

  async def helper(self, lock: asyncio.Lock, data: dict[int, str]):
    counts: dict[str, int] = {}
    async with lock:
      for input in data.values():
        if input not in counts.keys():
          counts[input] = 0
        counts[input] += 1
      self.reset_input()

    value = max(counts, key=lambda x: counts[x])
    return value


  async def send_command(self):
    # value, count = Counter(self.inputs.values()).most_common(1)[0]
    if len(self.inputs) == 0:
      return
    lock = asyncio.Lock()
    value: str = await self.helper(lock, self.inputs)

    hold = False
    splitted = value.split(":")
    if len(splitted) > 1:
      hold = splitted[1] == "hold"

    self.emulator.send_button(
      splitted[0],
      hold,
    )
    print(f"players said {value}", flush=True)

  async def broadcast(self, message):
    for player in self.players:
      await player.send(message)

  def reset_input(self):
    self.inputs = {}

  def start(self):
    if self.task is not None and self.task2 is not None:
      return

    self.emulator.start()
    self.task2 = asyncio.create_task(self._readinput())
    self.task = asyncio.create_task(self._loop())


  def stop(self):
    if self.task is not None and self.task2 is not None:
      self.task.cancel()
      self.task2.cancel()
    self.emulator.stop()
    del rooms[self.id]

  async def _loop(self):
    try:
      while True:
        self.emulator.tick()
        self.emulator.update_framebuffer()

        if len(self.players) == 0 and self.purgable:
          self.stop()

        for player in self.players:
          if player.fresh or (self.emulator.prev != self.emulator.curr):
            player.fresh = False
            await player.send(b'F' + self.emulator.framebuffer)

        await asyncio.sleep(1/60)
    finally:
      pass

  async def _readinput(self):
    try:
      while True:
        await self.send_command()
        await asyncio.sleep(1)
    except Exception as e:
      print(e)
    finally:
      pass

rooms: dict[int, Room] = {}

class PlayerPublic(BaseModel):
  id: int = next(player_id)
  nick: str

  @staticmethod
  def create(player: Player):
    return PlayerPublic(
      id = player.id,
      nick = player.nick,
    )

class RoomPublic(BaseModel):
  id: int
  players: list[PlayerPublic]
  rom: Rom
  started_at: datetime.datetime

  @staticmethod
  def create(room: Room):
    return RoomPublic(
      id = room.id,
      players = [PlayerPublic.create(player) for player in room.players],
      rom = room.rom,
      started_at = room.started_at,
    )

class RoomCreate(BaseModel):
  rom_id: str

@router.get("/rooms", response_model=list[RoomPublic])
async def get_rooms() -> list[RoomPublic]:
  return [RoomPublic.create(room) for room in rooms.values()]

@router.post("/rooms")
async def create_room(body: RoomCreate) -> int:
  room = Room(roms[body.rom_id])
  rooms[room.id] = room
  room.start()
  return room.id

@router.websocket("/ws/{room_id}")
async def websocket(sock: WebSocket, room_id: int):
  global rooms
  room = rooms[room_id]
  if room is None:
    await sock.close()
    return

  await sock.accept()
  player = Player(sock)
  player.nick = await sock.receive_text()

  room.player_join(player)

  print(f"Player named {player.nick} joined room {room_id}.")
  await room.broadcast(str.encode(f"Player named {player.nick} joined room {room_id}."))

  try:
    while True:
      input: str = await sock.receive_text()
      input = input.rstrip("\n")
      print(input.split(":"), flush=True)
      # await room.broadcast(str.encode(f"{player.nick} said {str(input.split(":"))}"))
      if input.split(":")[0] in valid_inputs:
        print(input.split(":")[0], flush=True)
        room.inputs[player.id] = input
  except WebSocketDisconnect:
    room.player_leave(player)
