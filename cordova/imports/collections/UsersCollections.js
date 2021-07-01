import { createCollection } from 'meteor/quave:collections';

export const UsersCollection = createCollection({
  instance: Meteor.users,
  collection: {
    addPlayerId({ playerId }) {
      this.update(this.userId, { $addToSet: { playersIds: playerId } });
    },
  },
});
