import {Meteor} from 'meteor/meteor';

Meteor.methods({
  addPlayerId({playerId}) {
    this.unblock();
    if (Meteor.isClient || !this.userId || !playerId) return null;
    console.log(`playerId`, playerId);

    Meteor.users.update(this.userId, {$addToSet: {playersIds: playerId}});
  },
});
