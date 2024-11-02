import { createFileRoute } from "@tanstack/react-router";
import { getOneItemsItemIdGet } from "../client";
import { getOneItemsItemIdGetOptions } from "../client/@tanstack/react-query.gen";
import { useQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/items/$itemId")({
  component: ItemComponent,
  loader: ({ context: { queryClient }, params }) => {
    queryClient.ensureQueryData(
      getOneItemsItemIdGetOptions({
        path: {
          item_id: parseInt(params.itemId),
        },
      }),
    );
  },
});

function ItemComponent() {
  let { itemId } = Route.useParams();

  let query = useQuery(
    getOneItemsItemIdGetOptions({ path: { item_id: parseInt(itemId) } }),
  );

  return (
    <div
      css={{
        display: "grid",
        gridTemplateColumns: "80px auto",
      }}
    >
      <span>Id: </span>
      <span>{query.data?.id}</span>
      <span>Name: </span>
      <span>{query.data?.name}</span>
      <span>Price: </span>
      <span>${query.data?.price.toFixed(2)}</span>
    </div>
  );
}
