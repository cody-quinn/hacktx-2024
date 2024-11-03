import asyncio
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from numpy import empty
from pydantic import BaseModel
from src.emulator import Emulator
from collections import Counter

router = APIRouter()

valid_inputs = [
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

class RomPrivate(Rom):
  filename: str

roms = {
  "tetris": RomPrivate(
    id="tetris",
    art="/assets/tetris.png",
    title="Tetris(R)",
    filename="./app/games/tetris.gb",
  ),
  "dino": RomPrivate(
    id="dino",
    art="/assets/dino.png",
    title="Dino Game",
    filename="./app/games/dino.gb"
  )
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

  def __init__(self, sock: WebSocket, nick: str | None = None):
    if nick is None:
      nick = "Player"

    self.id = next(player_id)
    self.nick = nick
    self.sock = sock

  async def send(self, message: bytes):
    if self.sock is not None:
      await self.sock.send_bytes(message)

class Room:
  # thread: threading.Thread
  task2: asyncio.Task | None
  task: asyncio.Task | None
  emulator: Emulator

  id: int
  players: list[Player]
  inputs: dict[int,str]

  def __init__(self, rom: RomPrivate):
    self.task = None
    self.task2 = None
    self.emulator = Emulator(rom.filename)

    self.id = next(room_id)
    self.players = []
    self.inputs = {}

  def player_join(self, player: Player):
    if player in self.players:
      return
    self.players.append(player)

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


    self.emulator.send_button(value)
    print(f"players said {value}", flush=True)

  async def broadcast(self, message):
    for player in self.players:
      await player.send(message)

  def reset_input(self):
    self.inputs = {}

  def start(self):
    if self.task is not None and self.task2 is not None:
      return

    loop = asyncio.get_event_loop()

    self.emulator.start()
    self.task2 = loop.create_task(self._readinput())
    self.task = loop.create_task(self._loop())


  def stop(self):
    if self.task is not None and self.task2 is not None:
      self.task.cancel()
      self.task2.cancel()
    self.emulator.stop()

  async def _loop(self):
    try:
      while True:
        self.emulator.tick()
        self.emulator.update_framebuffer()

        for player in self.players:
          await player.send(b'F' + self.emulator.framebuffer)

        await asyncio.sleep(1/10)
    finally:
      pass

  async def _readinput(self):
    try:
      while True:
        for player in self.players:
          await player.send(b"Recieved input")
        await self.send_command()
        await asyncio.sleep(1)
    except Exception as e:
      print(e)
    finally:
      pass

rooms: dict[int, Room] = {}

class RoomCreate(BaseModel):
  rom_id: str

@router.get("/rooms", response_model=list[int])
async def get_rooms() -> list[int]:
  return [room.id for room in rooms.values()]

@router.post("/rooms")
async def create_room(body: RoomCreate):
  room = Room(roms[body.rom_id])
  rooms[room.id] = room
  room.start()
  return room.id

@router.websocket("/ws/{room_id}")
async def websocket(sock: WebSocket, room_id: int):
  room = rooms[room_id]
  if room is None:
    await sock.close()
    return

  await sock.accept()
  player = Player(sock)
  player.nick = await sock.receive_text()

  room.player_join(player)

  print(f"Player named {player.nick} joined room {room_id}.")
  await player.send(str.encode(f"Player named {player.nick} joined room {room_id}."))

  try:
    while True:
      input: str = await sock.receive_text()
      input = input.rstrip("\n")
      await sock.send_text(f"Data recieved: {input}")
      if input in valid_inputs:
        room.inputs[player.id] = input
  except WebSocketDisconnect:
    room.player_leave(player)
