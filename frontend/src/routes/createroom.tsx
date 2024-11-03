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
        to: "/rooms/$roomId",
        params: {
          roomId: `${data}`,
        },
      });
    },
  });

  const roms = query.data;

  const [selectedRom, setSelectedRom] = useState<string>("");

  function createRoom() {
    if (selectedRom !== "") {
      mutation.mutate({
        body: {
          rom_id: selectedRom!,
        },
      });
    }
  }

  return (
    <>
      <span>{selectedRom}</span>
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
