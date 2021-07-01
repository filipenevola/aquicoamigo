import {Meteor} from 'meteor/meteor';

Meteor.methods({
  sendSequence({words, friend}) {
    this.unblock();
    console.log(`words`, words);
    console.log(`friend`, friend);

    // Meteor.users.update(this.userId, {$addToSet: {playersIds: playerId}});
  },
});
