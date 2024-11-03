import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import ReactDOM from "react-dom/client";

export const Route = createFileRoute("/rooms/$roomId")({
  component: RoomComponent,
});

const palette = [0xffffff, 0xaaaaaa, 0x666666, 0x000000];

// Handles 160x144 4 color
function expandData(compacted: Uint8Array): Uint8Array {
  const buffer = new Uint8Array(160 * 144);
  for (let i = 0; i < 160 * 144; i += 4) {
    const byte = compacted[i / 4];
    buffer[i] = (byte & 0b11000000) >> 6;
    buffer[i + 1] = (byte & 0b00110000) >> 4;
    buffer[i + 2] = (byte & 0b00001100) >> 2;
    buffer[i + 3] = byte & 0b00000011;
  }

  return buffer;
}

function GameButton({
  socket,
  message,
  children,
}: {
  socket: React.RefObject<WebSocket | null>;
  message: string;
  children: React.ReactNode;
}) {
  return (
    <button onClick={() => socket.current?.send(message)}>{children}</button>
  );
}

function RoomComponent() {
  let { roomId } = Route.useParams();

  const wsConnectionRef = React.useRef<WebSocket | null>(null);
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);

  const [frame, setFrame] = React.useState<Uint8Array>(new Uint8Array(5760));

  React.useEffect(() => {
    const socket = new WebSocket(`ws://localhost:5000/api/ws/${roomId}`);

    // Connection opened
    socket.addEventListener("open", (event) => {
      socket.send("Hi");
    });

    // Listen for messages
    socket.addEventListener("message", async (event: MessageEvent<Blob>) => {
      const data = await event.data?.arrayBuffer();
      const view = new Uint8Array(data);

      if (view.at(0) === "F".charCodeAt(0)) {
        setFrame(expandData(view.slice(1)));
      }
    });

    wsConnectionRef.current = socket;

    return () => wsConnectionRef.current?.close();
  }, []);

  React.useLayoutEffect(() => {
    const buffer = new Uint8ClampedArray(160 * 144 * 4);
    for (let i = 0; i < 160 * 144 * 4; i += 4) {
      const color = palette[frame[i / 4]];
      buffer[i] = (color >> 16) & 0xff;
      buffer[i + 1] = (color >> 8) & 0xff;
      buffer[i + 2] = color & 0xff;
      buffer[i + 3] = 255;
    }

    if (!canvasRef.current) {
      return;
    }

    const context = canvasRef.current.getContext("2d")!;
    const idata = context.createImageData(160, 144);
    idata.data.set(buffer);
    context.putImageData(idata, 0, 0);
  }, [frame]);

  return (
    <div
      css={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: 32,
      }}
    >
      <canvas
        ref={canvasRef}
        width={160}
        height={144}
        css={{
          width: 640,
          imageRendering: "pixelated",
        }}
      />

      <div css={{
        display: "flex",
        "& button": {
          width: 80,
          height: 80,
        }
      }}>
        {[
          "nothing",
          "left",
          "right",
          "up",
          "down",
          "a",
          "b",
          "start",
          "select",
        ].map((action) => (
          <GameButton socket={wsConnectionRef} message={action}>
            {action}
          </GameButton>
        ))}
      </div>
    </div>
  );
}
