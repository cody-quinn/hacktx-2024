import * as React from "react";
import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { getAllItemsGetOptions } from "../client/@tanstack/react-query.gen";
import { useQuery } from "@tanstack/react-query";
import { ClassNames } from "@emotion/react";

export const Route = createFileRoute("/items")({
  component: ItemsComponent,
  loader: ({ context: { queryClient } }) => {
    queryClient.ensureQueryData(getAllItemsGetOptions());
  },
});

function ItemsComponent() {
  let query = useQuery(getAllItemsGetOptions());

  return (
    <div>
      <h3>Items</h3>
      <div
        css={{
          display: "flex",
        }}
      >
        <div
          css={{
            display: "flex",
            flexDirection: "column",
            width: 280,
          }}
        >
          <ClassNames>
            {({ css, cx }) => {
              const styles = css({
                display: "flex",
                justifyContent: "space-between",
                width: "100%",
                textDecoration: "none",
                padding: "4px 4px",
                color: "black",
                ":hover": {
                  backgroundColor: "lightgray",
                },
              });

              return query.data?.map((item) => (
                <Link
                  key={item.id}
                  css={styles}
                  activeProps={{
                    className: cx(
                      styles,
                      css({
                        backgroundColor: "gray",
                        color: "white !important",
                      }),
                    ),
                  }}
                  to={"/items/$itemId"}
                  params={{
                    itemId: `${item.id}`,
                  }}
                >
                  <span>{item.name}</span>
                  <span>${item.price.toFixed(2)}</span>
                </Link>
              ));
            }}
          </ClassNames>
        </div>
        <div
          css={{
            width: "100%",
            padding: "0 24px",
          }}
        >
          <Outlet />
        </div>
      </div>
    </div>
  );
}
