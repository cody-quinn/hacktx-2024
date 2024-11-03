import { createFileRoute, Link } from "@tanstack/react-router";
import { getRoomsRoomsGetOptions } from "../client/@tanstack/react-query.gen";
import { useQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/")({
  component: RoomComponent,
  loader: ({ context: { queryClient } }) => {
    queryClient.ensureQueryData(getRoomsRoomsGetOptions());
  },
});

function RoomComponent() {
  const query = useQuery(getRoomsRoomsGetOptions());
  const values = query.data;

  return (
    <>
      <div
        css={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 24,
        }}
      >
        <h1
          css={{
            fontFamily: "monospace",
            margin: 0,
          }}
        >
          Welcome to PartyGB
        </h1>
        <Link
          to={"/createroom"}
          css={{
            fontSize: "24px",
            fontWeight: "bold",
            fontFamily: "sans-serif",
            color: "#1e1e1e",
            textDecoration: "none",
            borderRadius: "5px",
            borderColor: "#1e1e1e",
            borderWidth: "3",
            padding: "1rem",
            backgroundColor: "#eeeeee",
            borderStyle: "solid",
          }}
        >
          Create room
        </Link>
        <button onClick={() => query.refetch()}>Refresh</button>
      </div>
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
              to={"/$roomId"}
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
    </>
  );
}
