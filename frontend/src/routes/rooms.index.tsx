import { createFileRoute, Link } from "@tanstack/react-router";
import { getRoomsRoomsGetOptions } from "../client/@tanstack/react-query.gen";
import { useQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/rooms/")({
  component: RoomComponent,
  loader: ({ context: { queryClient } }) => {
    queryClient.ensureQueryData(getRoomsRoomsGetOptions());
  },
});

function RoomComponent() {
  const query = useQuery(getRoomsRoomsGetOptions());
  const values = query.data;

  return (
    <div
      css={{
        display: "flex",
        flexWrap: "wrap",
        gap: 48,
      }}
    >
      {values
        ?.sort((a, b) => b.players.length - a.players.length)
        .map((room) => (
          <Link
            key={room.id}
            to={"/rooms/$roomId"}
            params={{ roomId: room.id.toString() }}
            css={{
              textDecoration: "none",
            }}
          >
            <div
              css={{
                display: "flex",
                flexDirection: "column",
              }}
            >
              <span css={{ fontSize: 24 }}>{room.rom.title}</span>
              <span css={{ fontSize: 16 }}>Room #{room.id}</span>
              <span css={{ fontSize: 16 }}>
                {room.players.length.toString()} Players
              </span>
            </div>
          </Link>
        ))}
    </div>
  );
}
