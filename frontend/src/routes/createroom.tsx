import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  getRomsRomsGetOptions,
  createRoomRoomsPostMutation,
} from "../client/@tanstack/react-query.gen";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";

export const Route = createFileRoute("/createroom")({
  component: CreateRoomForm,
  loader: ({ context: { queryClient } }) => {
    queryClient.ensureQueryData(getRomsRomsGetOptions());
  },
});

function CreateRoomForm() {
  const navigate = useNavigate();

  const query = useQuery(getRomsRomsGetOptions());
  const mutation = useMutation({
    ...createRoomRoomsPostMutation(),
    onSuccess: async (data) => {
      await navigate({
        to: "/$roomId",
        params: {
          roomId: `${data}`,
        },
      });
    },
  });

  const roms = query.data;

  const [selectedRom, setSelectedRom] = useState<string>("");
  const [gameSpeed, setGameSpeed] = useState(1.0);

  function createRoom() {
    if (selectedRom !== "") {
      mutation.mutate({
        body: {
          rom_id: selectedRom!,
          game_speed: gameSpeed,
        },
      });
    }
  }

  return (
    <>
      <p>Gamespeed: {gameSpeed}</p>
      <input
        type="range"
        value={gameSpeed}
        min={0}
        max={2.0}
        step={0.1}
        onChange={(e) => setGameSpeed(e.target.valueAsNumber)}
      />
      <br />
      <select
        onChange={(e) => setSelectedRom(e.target.value)}
        value={selectedRom}
      >
        <option value="" disabled={true}>
          -- SELECT --
        </option>
        {roms?.map((rom) => (
          <option key={rom.id} value={rom.id}>
            {rom.title}
          </option>
        ))}
      </select>
      <button onClick={createRoom}>Create room</button>
    </>
  );
}
