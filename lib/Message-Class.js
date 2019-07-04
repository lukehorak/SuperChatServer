const uuid = require('uuid/v4');

class Message {
  constructor(type, ownerID, content, user){
    this.ownerID = ownerID,
    this.username = user,
    this.content = content,
    this.id = uuid(),
    this.type = type,
    this.timestamp = Date.now()
  }
  get string () {
    return JSON.stringify(this);
  }
}

class Notification extends Message {
  constructor(ownerID, content, user){
    super("system-notification", ownerID, content, user)
  }
}

class SystemMessage extends Message {
  constructor(content, user){
    super("system", content, user)
  }
}

const messageFactory = (type, ownerID, content, user) => {
  switch(type){
    case'setID':
      return new Message('set-id', ownerID, "", user);
    case 'system':
      return new SystemMessage(ownerID, content, user);
    case 'system-notification':
      return new Notification(ownerID, content, user);
    default:
      return new Message(type, ownerID, content, user);
  }
}

module.exports = messageFactory;