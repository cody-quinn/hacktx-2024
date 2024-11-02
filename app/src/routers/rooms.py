import threading
from fastapi import APIRouter, WebSocket
from pydantic import BaseModel
from src.emulator import Emulator
from collections import Counter

router = APIRouter()

def get_id():
  id = 0
  def inner():
    nonlocal id
    id = id + 1
    return id
  return inner

get_room_id = get_id()
get_player_id = get_id()

class Player:
  nick: str
  id: int
  sock: WebSocket

  def __init__(self, sock: WebSocket, nick: str | None = None):
    if nick == None:
      nick = "Player"

    self.id = get_player_id()
    self.nick = nick
    self.sock = sock

  async def send(self, message):
    if self.sock != None:
      await self.sock.send_bytes(message)

class Room:
  thread: threading.Thread
  running: bool
  id: int
  emulator: Emulator
  players: list[Player]
  inputs: dict[int,str]

  def __init__(self, rom: str):
    self.id = get_room_id()
    self.emulator = Emulator(rom)
    self.players = []
    self.inputs = {}

  def player_join(self, player: Player):
    self.players.append(player)

  def player_leave(self, player: Player):
    self.players.remove(player)

  def run(self):
    self.emulator.start_game()
    self.thread = threading.Thread(target = self.run_internal)
    self.thread.start()

  async def run_internal(self):
    while self.running:
      await self.tick()

  def send_command(self):
    value, count =  Counter(self.inputs.values()).most_common(1)[0]
    if count == 0:
      return
    self.emulator.send_button(value)

  async def tick(self):
    self.emulator.tick()
    frame = self.emulator.get_frame()
    await self.broadcast([b'F'] + frame)

  async def broadcast(self, message):
    for player in self.players:
      await player.send(message)

  def reset_input(self):
    self.inputs = {}

  def stop(self):
    self.running = False
    self.thread.join()

rooms: list[Room] = []

@router.get("/rooms", response_model=list[int])
async def get_rooms() -> list[int]:
  return [room.id for room in rooms]

@router.post("/rooms/{rom}")
async def create_room(rom: str):
  room = Room(rom)
  rooms.append(room)
  room.run()
  return room.id

# TODO: not this bullshit
@router.put("/rooms/{room_id}/{player_id}/{input}")
async def send_input(room_id, player_id, input):
  room = rooms[[room.id for room in rooms].index(room_id)]
  room.inputs[player_id] = input

@router.websocket("/ws/{room_id}")
async def websocket(sock: WebSocket, room_id: int):
  if room_id not in [room.id for room in rooms]:
    await sock.close()
    return
  room = rooms[[room.id for room in rooms].index(room_id)]

  await sock.accept()
  player = Player(sock)

  data = await player.sock.receive_text()
  player.nick = data

  room.player_join(player)
