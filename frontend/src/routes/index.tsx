import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: HomeComponent,
});

function HomeComponent() {
  const connection = React.useRef<WebSocket | null>(null);
  const [compressed, setCompressed] = React.useState<Uint8Array>(new Uint8Array(5760));

  React.useEffect(() => {
    const socket = new WebSocket("ws://localhost:8000/api/ws/1");

    // Connection opened
    socket.addEventListener("open", (event) => {
      socket.send("Hi");
    });

    // Listen for messages
    socket.addEventListener("message", async (event: MessageEvent<Blob>) => {
      const data = await event.data?.arrayBuffer();
      const view = new Uint8Array(data);
      if (view.at(0) !== 70) {
        setCompressed(view);
      }
    });

    connection.current = socket;

    return () => connection.current?.close();
  }, []);

  const text = React.useMemo(() => {
    let bytes = new Array(5760 * 4);
    for (let i = 0; i < 5760 * 4; i += 4) {
      const byte = compressed[i / 4];
      bytes[i]     = (byte & 0b11000000) >> 6;
      bytes[i + 1] = (byte & 0b00110000) >> 4;
      bytes[i + 2] = (byte & 0b00001100) >> 2;
      bytes[i + 3] = (byte & 0b00000011);
    }

    bytes = bytes.map((v, i) => i % 160 === 0 ? 4 : v);

    return bytes.map((byte) => {
      switch (byte) {
        case 0:
        case 1:
          return "⬜"
        case 2:
        case 3:
          return "◼️"
        case 4:
          return "\n"
      }
    }).join("");
  }, [compressed]);

  // let x = Array.from({ length: 144 }, () => "⬛").join("");
  // let y = Array.from({ length: 160 }, () => x).join("\n");

  return (
    <div
      css={{
        display: "flex",
        flexWrap: "wrap",
        fontSize: 5,
      }}
    >
      <pre
        dangerouslySetInnerHTML={{
          __html: text,
        }}
      ></pre>
    </div>
  );
}
