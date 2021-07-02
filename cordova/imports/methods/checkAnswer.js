import { Meteor } from 'meteor/meteor';
import { GamesCollection } from '../collections/GamesCollections';

Meteor.methods({
  checkAnswer({ words, gameId }) {
    this.unblock();

    return GamesCollection.checkAnswer({ words, gameId });
  },
});
