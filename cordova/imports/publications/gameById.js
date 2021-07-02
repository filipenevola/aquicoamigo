import { GamesCollection } from '../collections/GamesCollections';

Meteor.publish('gameById', ({ gameId }) => {
  return GamesCollection.find({ _id: gameId });
});
