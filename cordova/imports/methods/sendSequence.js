import { Meteor } from 'meteor/meteor';
import { GamesCollection } from '../collections/GamesCollections';

Meteor.methods({
  sendSequence({ words, friend }) {
    this.unblock();
    if (!this.userId) {
      throw new Meteor.Error(
        'You need to be authenticated to send a sequence.'
      );
    }

    if (!friend || !friend.email) {
      throw new Meteor.Error(`We need your friend email.`);
    }

    GamesCollection.addSequence({ words, friend, userId: this.userId });
  },
});
