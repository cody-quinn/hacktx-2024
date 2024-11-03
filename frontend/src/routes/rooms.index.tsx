import { createFileRoute, Link } from '@tanstack/react-router'
import { getRoomsRoomsGetOptions } from '../client/@tanstack/react-query.gen'
import { useQuery } from '@tanstack/react-query'

export const Route = createFileRoute('/rooms/')({
  component: RoomComponent,
  loader: ({ context: { queryClient } }) => {
    queryClient.ensureQueryData(getRoomsRoomsGetOptions())
  },
})

function RoomComponent() {
  const query = useQuery(getRoomsRoomsGetOptions())
  const values = query.data
  return (
    <div>
      {values?.map((roomId) => (
        <div key={roomId}>
          <h2>
            <Link to={'/rooms/$roomId'} params={{ roomId: '' + roomId }}>
              Room {roomId}
            </Link>
          </h2>
        </div>
      ))}
    </div>
  )
}
