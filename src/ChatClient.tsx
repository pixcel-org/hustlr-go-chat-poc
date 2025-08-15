import { useEffect, useRef, useState } from 'react'

interface ChatClientProps {
  title: string
  username: string
  userId: string
  gradientColors: string
}

export function ChatClient({ title, username, userId, gradientColors }: ChatClientProps) {
  const [messages, setMessages] = useState<string[]>([])
  const [input, setInput] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const [roomName, setRoomName] = useState('')
  const wsRef = useRef<WebSocket | null>(null)

  const connectWebSocket = () => {
    if (!roomName.trim()) {
      console.error('Room name is required')
      return
    }

    disconnectWebSocket()

    const wsUrl = new URL(`${import.meta.env.VITE_WS_URL}${roomName.trim()}`)
    wsUrl.searchParams.set('user_id', userId)
    wsUrl.searchParams.set('username', username)

    const ws = new WebSocket(wsUrl.toString())

    ws.onopen = () => {
      console.log(`${username} connected to chat server`)
      setIsConnected(true)
    }

    ws.onclose = (event) => {
      console.log(`${username} disconnected from chat server`, event.code, event.reason)
      setIsConnected(false)
    }

    ws.onerror = (error) => {
      console.error(`WebSocket error for ${username}:`, error)
      setIsConnected(false)
    }

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (data.type === 'chat_message') {
          setMessages((prev) => [...prev, `${data.username || 'Anon'}: ${data.message}`])
        } else if (
          data.type === 'system' ||
          data.type === 'user_joined' ||
          data.type === 'user_left'
        ) {
          setMessages((prev) => [...prev, `[${data.message}]`])
        } else if (data.type === 'previous_messages') {
          setMessages((prev) => [
            ...prev,
            ...data.messages.map((m: any) => `${m.username || 'Anon'}: ${m.message}`)
          ])
        }
      } catch (err) {
        console.error('Invalid message from server:', event.data)
      }
    }

    wsRef.current = ws
  }

  const disconnectWebSocket = () => {
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
      setIsConnected(false)
    }
    setMessages([])
  }

  const sendMessage = () => {
    if (!input.trim() || !wsRef.current) return
    const messageObj = {
      username,
      type: 'chat_message',
      message: input,
      userId
    }
    wsRef.current.send(JSON.stringify(messageObj))
    setInput('')
  }

  useEffect(() => {
    return () => {
      disconnectWebSocket()
    }
  }, [])

  return (
    <div className='bg-gray-800 rounded-lg p-5 shadow-xl h-full flex flex-col'>
      <div className='text-center mb-4'>
        <h2
          className={`text-2xl font-bold mb-2 bg-gradient-to-r ${gradientColors} bg-clip-text text-transparent`}
        >
          {title}
        </h2>
        <div className='text-sm text-gray-400'>
          User: <span className='text-blue-400 font-medium'>{username}</span> | ID:{' '}
          <span className='text-purple-400 font-medium'>{userId}</span>
        </div>
      </div>

      <div className='mb-4 space-y-3'>
        <div className='flex items-center gap-2'>
          <label className='text-gray-300 text-sm font-medium min-w-[40px]'>Room:</label>
          <input
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            placeholder='Enter room name...'
            className='flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent'
          />
        </div>

        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <span className='text-sm text-gray-300'>Status:</span>
            <span
              className={`text-sm font-medium ${isConnected ? 'text-green-400' : 'text-red-400'}`}
            >
              {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
            </span>
          </div>

          <div className='flex gap-2'>
            <button
              onClick={disconnectWebSocket}
              disabled={!isConnected}
              className='px-3 py-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded text-sm transition-colors duration-200'
            >
              Disconnect
            </button>
            <button
              onClick={connectWebSocket}
              disabled={!roomName.trim()}
              className='px-3 py-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded text-sm transition-colors duration-200'
            >
              {isConnected ? 'Reconnect' : 'Connect'}
            </button>
          </div>
        </div>
      </div>

      <div className='bg-gray-900 rounded-lg border border-gray-700 flex-1 overflow-y-auto p-4 mb-4 min-h-[300px]'>
        {messages.length === 0 ? (
          <div className='text-gray-500 text-center h-full flex items-center justify-center text-sm'>
            No messages yet. Connect to start chatting!
          </div>
        ) : (
          messages.map((msg, i) => (
            <div key={i} className='mb-2 text-gray-200 break-words text-sm'>
              {msg.startsWith('[') ? (
                <span className='text-yellow-400 italic'>{msg}</span>
              ) : (
                <span>{msg}</span>
              )}
            </div>
          ))
        )}
      </div>

      <div className='flex gap-2'>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Type as ${username}...`}
          disabled={!isConnected}
          className='flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50'
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
        />
        <button
          onClick={sendMessage}
          disabled={!isConnected || !input.trim()}
          className='px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded text-sm transition-colors duration-200'
        >
          Send
        </button>
      </div>
    </div>
  )
}
