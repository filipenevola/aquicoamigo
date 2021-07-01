import {Meteor} from 'meteor/meteor';
import {UsersCollection} from "../collections/UsersCollections";

Meteor.methods({
  addPlayerId({playerId}) {
    this.unblock();
    if (Meteor.isClient || !this.userId || !playerId) return null;
    console.log(`playerId`, playerId);

    UsersCollection.addPlayerId({playerId})
  },
});
