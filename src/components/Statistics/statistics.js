/* global PRODUCTION, DEV_SERVER */

import React, { useContext, useEffect, useState } from 'react'
import { WebSocketContext } from '../WebSocket/websocket.js'
import './statistics.scss'
import { Navbar } from '../Navbar/navbar.js'
import { Loader } from '../Loader/loader.js'
import { Background } from '../Background/background.js'

const clientDataMapObject = {
  '1031853575732740217': {
    'guilds': ['610498937874546699'],
    'users': 14,
    'readyTimestamp': 1712918626950,
    'ping': 138,
    'displayAvatarURL': 'https://cdn.discordapp.com/avatars/1031853575732740217/5b2bcb5c07565482233ca94d177f9906.webp',
    'displayName': 'Kalliope Dev',
    'version': '2.0.0'
  }
}

export function Statistics() {
  document.title = 'Kalliope | Statistics'

  const webSocket = useContext(WebSocketContext).webSocket
  const [clientDataMap, setClientDataMap] = useState(DEV_SERVER ? clientDataMapObject : null)
  const [playerList, setPlayerList] = useState(new Set())

  useEffect(() => {
    if (!webSocket) { return }

    function onMessage(message) {
      const data = JSON.parse(message?.data)
      if (!PRODUCTION) {
        console.log('client received:', data)
      }
      if (data.type === 'clientDataMap') {
        setClientDataMap(data.map)
      } else if (data.type === 'playerList') {
        setPlayerList(new Set(data.list))
      }
    }

    webSocket.addEventListener('open', () => {
      webSocket.sendData('requestClientDataMap' )
      webSocket.sendData('requestPlayerList')
    }, { once: true })

    webSocket.addEventListener('message', onMessage)

    return () => {
      webSocket.removeEventListener('message', onMessage)
    }
  }, [webSocket])

  const clientData = Object.values(clientDataMap ?? {})

  return (
    <div>
      <Navbar hideOnMobile={false} />
      <div className={'stats-background-container'}>
        <Background/>
      </div>
      <div className={'stats-container flex-container column'}>
        <h1>Statistics</h1>
        <div className={'stats-card'}>
          {clientData.length === 0 ? <div className={'flex-container column'} style={{ height: '100%' }}><Loader/></div> :
            <div>
              Total guilds: {clientData.reduce((acc, cur) => cur.guilds.length + acc, 0)}<br/>
              Total users: {clientData.reduce((acc, cur) => cur.users + acc, 0)}<br/>
              Average latency: {clientData.reduce((acc, cur) => (cur.ping === -1 ? 0 : cur.ping) + acc, 0) / (clientData.filter((data) => data.ping !== -1).length || 1)}ms<br/>
              Currently playing in {playerList?.size ?? 0} guilds.<br/>
              <br/>
              <div className={'stats-node-grid'}>
                {/* eslint-disable-next-line no-extra-parens */}
                {Object.entries(clientDataMap).map(([clientId, data], index) => (
                  <div className={'stats-node-container'} key={index}>
                    <div className={`stats-node ${data.guilds.filter((guildId) => playerList?.has(guildId)).length > 0 ? 'playing' : ''}`} style={{ backgroundImage: `url(${data.displayAvatarURL})` }}/>
                    <div className={'stats-node-tooltip'}>
                      <p>
                        {data.displayName}<br/>
                        {data.version ? 'v' + data.version : 'Unknown version'}
                      </p>
                      <p>
                        Guilds: {data.guilds.length}<br/>
                        Users: {data.users}<br/>
                        Latency: {data.ping}ms<br/>
                      </p>
                      <p className={'small-text'}>
                        Ready since:<br/>
                        {new Date(data.readyTimestamp).toLocaleString()}
                      </p>
                      <button onClick={(event) => {
                        webSocket.sendData('requestClientData', null, { clientId: clientId })
                        event.currentTarget.animate([{ rotate: '0deg' }, { rotate: '360deg' }], { duration: 500, easing: 'ease-in-out' })
                      }}>
                        <i className="fas fa-redo"></i>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  )
}