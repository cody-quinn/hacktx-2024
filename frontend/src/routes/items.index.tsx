import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/items/")({
  component: () => <div>Click on an item in the list to view details!</div>,
});
