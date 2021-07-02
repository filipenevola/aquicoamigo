import { createCollection } from 'meteor/quave:collections';

export const UsersCollection = createCollection({
  instance: Meteor.users,
  collection: {
    addPlayerId({ userId, playerId }) {
      this.update(userId, { $addToSet: { playersIds: playerId } });
    },
  },
});
