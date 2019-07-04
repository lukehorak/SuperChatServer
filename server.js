const express = require('express');
const WebSocket = require('ws');
const uuid = require('uuid/v4')

const messageFactory = require('./lib/Message-Class');

// Set the port to 3001
const PORT = 3001;
const server = express()
   // Make the express server serve static assets (html, javascript, css) from the /public folder
  .use(express.static('public'))
  .listen(PORT, '0.0.0.0', 'localhost', () => console.log(`Listening on ${ PORT }`));

// Create the WebSockets server
const wsServer = new WebSocket.Server({ server });

// Define Broadcast method
wsServer.broadcast = (message) => {
  wsServer.clients.forEach( c => {
    if (c.readyState === WebSocket.OPEN){
      c.send(message)
    }
  })
}

wsServer.on('connection', (client) => {
  // Log Connection
  console.log('Client connected. Connected clients: ', wsServer.clients.size);

  client.userID = uuid();
  // Set client.userID client-side
  console.log(client.userID)
  const idMessage = messageFactory('set-id', client.userID, "ID SETTING MESSAGE")
  client.send(idMessage.string)

  // New Connection sysMessage
  const systemMessage = messageFactory('system-notification', client.userID, 'A new challenger has appeared!');
  wsServer.broadcast(systemMessage.string)
  
  // Update user count
  const initSysMessage = messageFactory('system', client.userID);
  initSysMessage.numUsers = wsServer.clients.size;
  wsServer.broadcast(initSysMessage.string)

  // On message receive
  client.on('message', (msgData) => {
    let { type, content, username } = JSON.parse(msgData)

    console.log(client.userID)
    
    let newMessage;
    // Error handling for bad message data
    try {
      newMessage = messageFactory(type, client.userID, content, username);
    }
    catch (e) {
      console.warn('Failed to create message from Message Data Sent!\n---\n', e)
    }
    // Send to all active clients
    switch(newMessage.type){
      case "chat-message":
      case "system-notification":
        wsServer.broadcast(newMessage.string);
        break;
      case "system":
        if (newMessage.content === "user-change"){
          currentUser = newMessage.username;
        }
        break;
      default:
        console.log('not sending message!')
        break;
    }
    
    
  })

  // Set up a callback for when a client closes the socket. This usually means they closed their browser.
  client.on('close', () => {
    const sysMessage = messageFactory('system', client.userID, `A user left the chat! Members in chat: ${wsServer.clients.size}`)
    sysMessage.numUsers = wsServer.clients.size;
    wsServer.broadcast(sysMessage.string)
    console.log('Client disconnected')
  });
});