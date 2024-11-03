import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: HomeComponent,
});

function HomeComponent() {
  return (
    <div>
      <h1>Homepage</h1>
      <h3>
        <Link to={"/createroom"}>Create room</Link>
      </h3>
    </div>
  );
}
