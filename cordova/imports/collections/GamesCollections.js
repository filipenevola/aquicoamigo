import { createCollection } from 'meteor/quave:collections';
import { UsersCollection } from './UsersCollections';
import { sendPush } from '../infra/sendPush';

export const GamesCollection = createCollection({
  name: 'games',
  collection: {
    addSequence({ words, friend, userId }) {
      const user = UsersCollection.findOne(userId);
      const friendUser = UsersCollection.findOne({ username: friend.email });
      const game = this.findOne({
        friendEmail: friend.email,
        userEmail: user.username,
      });
      let gameId = game?._id;
      if (!gameId) {
        gameId = this.insert({
          userId,
          sequences: [],
          friend,
          userEmail: user.username,
          friendUserId: friendUser?._id,
          friendEmail: friend.email,
        });
      }
      this.update(gameId, {
        $push: { sequences: { fromUserId: userId, words } },
      });
      if (friendUser?.playersIds?.length) {
        sendPush({
          heading: `New Sequence with ${words.length} Word${
            words.length === 1 ? '' : 's'
          }`,
          content: `From your friend ${user.profile.name}`,
          playersIds: user.playersIds,
          data: { route: `/game/${gameId}` },
        }).catch(e =>
          console.error(`Error sending push for game ${gameId}`, e)
        );
      }
    },
  },
});
