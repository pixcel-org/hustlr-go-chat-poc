import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ChatClient } from './ChatClient.tsx'

import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <div className='min-h-screen bg-gray-900 text-white p-4'>
      <div className='max-w-7xl mx-auto space-y-4'>
        <div className='flex items-center justify-center space-x-4'>
          <img src='/logo.jpeg' className='size-20 rounded' />
          <h1 className='text-4xl font-bold text-center bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent'>
            Hustlr Go Chat
          </h1>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-200px)]'>
          <ChatClient
            title="Grandmaster's Chat"
            username='booba'
            userId='grandmaster69'
            gradientColors='from-blue-400 to-purple-500'
          />
          <ChatClient
            title="Alice's Wonderland"
            username='aliceeee'
            userId='alice_wonderland'
            gradientColors='from-pink-400 to-rose-500'
          />
        </div>
      </div>
    </div>
  </StrictMode>
)
