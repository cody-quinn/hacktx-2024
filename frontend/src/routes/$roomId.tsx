import * as React from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import ReactDOM from 'react-dom/client'
import { useState } from 'react'

import gameboyImg from '../assets/gameboy.png'

export const Route = createFileRoute('/$roomId')({
  component: RoomWrapperComponent,
})

const palette = [0xffffff, 0xaaaaaa, 0x666666, 0x000000]

// Handles 160x144 4 color
function expandData(compacted: Uint8Array): Uint8Array {
  const buffer = new Uint8Array(160 * 144)
  for (let i = 0; i < 160 * 144; i += 4) {
    const byte = compacted[i / 4]
    buffer[i] = (byte & 0b11000000) >> 6
    buffer[i + 1] = (byte & 0b00110000) >> 4
    buffer[i + 2] = (byte & 0b00001100) >> 2
    buffer[i + 3] = byte & 0b00000011
  }

  return buffer
}

function GameButton({
  socket,
  message,
  className,
  children = undefined,
}: {
  socket: React.RefObject<WebSocket | null>
  message: string
  className?: string
  children: React.ReactNode | undefined
}) {
  return (
    <button onClick={() => socket.current?.send(message)} className={className}>
      {children}
    </button>
  )
}

function RoomWrapperComponent() {
  const [nick, setNick] = React.useState<string | null>(null)
  const nickInputRef = React.useRef<HTMLInputElement | null>(null)

  function submitNickname() {
    const nick = nickInputRef.current?.value ?? null
    if (nick !== '') {
      setNick(nick)
    }
  }

  if (nick === null) {
    return (
      <>
        <p>Please enter a nickname:</p>
        <input type="text" defaultValue={'Player'} ref={nickInputRef} />
        <button onClick={submitNickname}>Join Room</button>
      </>
    )
  }

  return <RoomComponent nickname={nick} />
}

function RoomComponent({ nickname }: { nickname: string }) {
  let { roomId } = Route.useParams()

  const wsConnectionRef = React.useRef<WebSocket | null>(null)
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null)

  const [frame, setFrame] = React.useState<Uint8Array>(new Uint8Array(5760))

  React.useEffect(() => {
    const socket = new WebSocket(`ws://localhost:5000/api/ws/${roomId}`)

    // Connection opened
    socket.addEventListener('open', (event) => {
      socket.send(nickname)
    })

    // Listen for messages
    socket.addEventListener('message', async (event: MessageEvent<Blob>) => {
      const data = await event.data?.arrayBuffer()
      const view = new Uint8Array(data)

      if (view.at(0) === 'F'.charCodeAt(0)) {
        setFrame(expandData(view.slice(1)))
      }
    })

    wsConnectionRef.current = socket

    return () => wsConnectionRef.current?.close()
  }, [])

  React.useLayoutEffect(() => {
    const buffer = new Uint8ClampedArray(160 * 144 * 4)
    for (let i = 0; i < 160 * 144 * 4; i += 4) {
      const color = palette[frame[i / 4]]
      buffer[i] = (color >> 16) & 0xff
      buffer[i + 1] = (color >> 8) & 0xff
      buffer[i + 2] = color & 0xff
      buffer[i + 3] = 255
    }

    if (!canvasRef.current) {
      return
    }

    const context = canvasRef.current.getContext('2d')!
    const idata = context.createImageData(160, 144)
    idata.data.set(buffer)
    context.putImageData(idata, 0, 0)
  }, [frame])

  React.useLayoutEffect(() => {
    if (!canvasRef.current) {
      return
    }

    const context = canvasRef.current.getContext('2d')!
    context.fillStyle = '#33ee77'
    context.fillRect(0, 0, 160, 144)
  }, [])

  return (
    <div
      css={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        top: 0,
        left: 0,
        overflow: 'hidden',
        background: 'linear-gradient(#600060, #200020)',
      }}
    >
      <Link
        to={'/'}
        css={{
          color: 'white',
          position: 'relative',
          top: 34,
          left: 40,
        }}
      >
        Home
      </Link>

      <div
        css={{
          position: 'relative',
          imageRendering: 'pixelated',
          left: 20,
          top: 50,
        }}
      >
        <canvas
          ref={canvasRef}
          width={160}
          height={144}
          css={{
            position: 'absolute',
            width: 480,
            left: 177,
            top: 168,
          }}
        />

        <img
          src={gameboyImg}
          alt={''}
          css={{
            position: 'absolute',
            width: 840,
          }}
        />
      </div>

      <div
        css={{
          position: 'relative',
          top: 300,
          left: 860,
          padding: '0 30px',
          display: 'grid',
          gridTemplateColumns: '90px 90px 90px',
          gridAutoRows: '90px+',
          '& *': {
            width: 90,
            height: 90,
          },
        }}
      >
        <div />
        <GameButton socket={wsConnectionRef} message={'up'}>
          Up
        </GameButton>
        <div />
        <GameButton socket={wsConnectionRef} message={'left'}>
          Left
        </GameButton>
        <GameButton socket={wsConnectionRef} message={'nothing'}>
          Nothing
        </GameButton>
        <GameButton socket={wsConnectionRef} message={'right'}>
          Right
        </GameButton>
        <div />
        <GameButton socket={wsConnectionRef} message={'down'}>
          Down
        </GameButton>
        <div />
        <div />
        <div />
        <div />
        <div />
        <GameButton socket={wsConnectionRef} message={'a'}>
          A
        </GameButton>
        <GameButton socket={wsConnectionRef} message={'b'}>
          B
        </GameButton>
        <GameButton socket={wsConnectionRef} message={'select'}>
          Select
        </GameButton>
        <GameButton socket={wsConnectionRef} message={'start'}>
          Start
        </GameButton>
      </div>
    </div>
  )
}

/*
// {/*<div*/
// {/*  css={{*/}
// {/*    display: "flex",*/}
// {/*    "& button": {*/}
// {/*      width: 80,*/}
// {/*      height: 80,*/}
// {/*    },*/}
// {/*  }}*/}
// {/*>*/}
// {/*  {[*/}
// {/*    "nothing",*/}
// {/*    "left",*/}
// {/*    "right",*/}
// {/*    "up",*/}
// {/*    "down",*/}
// {/*    "a",*/}
// {/*    "b",*/}
// {/*    "start",*/}
// {/*    "select",*/}
// {/*  ].map((action) => (*/}
// {/*    <GameButton socket={wsConnectionRef} message={action}>*/}
// {/*      {action}*/}
// {/*    </GameButton>*/}
// {/*  ))}*/}
// {/*</div>*/}
//
// {/*<div*/}
// {/*  css={{*/}
// {/*    display: "flex",*/}
// {/*    "& button": {*/}
// {/*      width: 80,*/}
// {/*      height: 80,*/}
// {/*    },*/}
// {/*  }}*/}
// {/*>*/}
// {/*  {["nothing", "left", "right", "up", "down", "a", "b", "start", "select"]*/}
// {/*    .map((it) => `${it}:hold`)*/}
// {/*    .map((action) => (*/}
// {/*      <GameButton socket={wsConnectionRef} message={action}>*/}
// {/*        {action}*/}
// {/*      </GameButton>*/}
// {/*    ))}*/}
// {/*</div>*/}
