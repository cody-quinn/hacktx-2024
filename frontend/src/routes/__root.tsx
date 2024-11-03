import * as React from "react";
import {
  Link,
  Outlet,
  createRootRouteWithContext,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { RouterContext } from "../main";
import { ClassNames, css } from "@emotion/react";

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
});

function RootComponent() {
  return (
    <>
      <div
        css={{
          display: "flex",
          gap: 8,
          "& a": {
            color: "black",
          },
        }}
      >
        <ClassNames>
          {({ css }) => (
            <>
              <Link
                to="/"
                activeProps={{
                  className: css({ fontWeight: "bold " }),
                }}
                activeOptions={{ exact: true }}
              >
                Home
              </Link>{" "}
              <Link
                to="/rooms"
                activeProps={{
                  className: css({ fontWeight: "bold " }),
                }}
              >
                Rooms
              </Link>
            </>
          )}
        </ClassNames>
      </div>
      <hr />
      <Outlet />
      <TanStackRouterDevtools position="bottom-right" />
    </>
  );
}
