from emulator import Emulator
from fastapi import WebSocket
from collections import Counter

def get_id():
  id = 0
  def inner():
    nonlocal id
    id = id + 1
    return id
  return inner

room_id = get_id()
player_id = get_id()

class Player:
  nick: str
  id: int
  sock: WebSocket
  def __init__(self, nick: str, sock: WebSocket):
    self.id = player_id()
    self.nick = nick
    self.sock = sock

  async def send(self, message):
    await self.sock.send_bytes(message)

class Room:
  room_id: int
  emulator: Emulator
  players: list[Player]
  inputs: dict[int,str]

  def __init__(self, rom: str):
    self.room_id = room_id()
    self.emulator = Emulator(rom)
    self.players = []
    self.inputs = {}

  def player_join(self, player: Player):
    self.players.append(player)

  def player_leave(self, player: Player):
    self.players.remove(player)

  def run(self):
    self.emulator.start_game()

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
    self.emulator.stop()
