import { Random } from 'meteor/random';
import { createCollection } from 'meteor/quave:collections';
import { UsersCollection } from './UsersCollections';
import { sendPush } from '../infra/sendPush';
import { Word } from '../enums/Word';
export const SequenceStatus = {
  PENDING: 'PENDING',
  SUCCESS: 'SUCCESS',
  FAILURE: 'FAILURE',
};
export const GamesCollection = createCollection({
  name: 'games',
  collection: {
    addSequence({ words, friend, userId }) {
      const user = UsersCollection.findOne(userId);
      const friendUser = UsersCollection.findOne({ username: friend.email });
      const gameDb = this.findOne({
        friendEmail: friend.email,
        userEmail: user.username,
      });
      let gameId = gameDb?._id;
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
      const game = this.findOne(gameId);
      if (
        game.sequences &&
        game.sequences.find(({ status }) => status === SequenceStatus.PENDING)
      ) {
        throw new Meteor.Error(
          'It was not possible to create send this sequence',
          'This game already have a pending sequence with this friend. Please wait.'
        );
      }
      this.update(gameId, {
        $push: {
          sequences: {
            _id: Random.id(),
            fromUserId: userId,
            words,
            status: SequenceStatus.PENDING,
          },
        },
      });

      if (friendUser?.playersIds?.length) {
        sendPush({
          heading: `New Sequence with ${words.length} Word${
            words.length === 1 ? '' : 's'
          }`,
          content: `From your friend ${user.profile.name}`,
          playersIds: friendUser.playersIds,
          data: { route: `/game/${gameId}` },
        }).catch(e =>
          console.error(`Error sending push for game ${gameId}`, e)
        );
      }
    },
    checkAnswer({ gameId, words }) {
      const game = this.findOne(gameId);
      const sequence = game.sequences.find(
        ({ status }) => status === SequenceStatus.PENDING
      );
      const answerJson = JSON.stringify(
        words.map(({ value }) =>
          value === Word.AMIGO.value ? Word.AQUICO.value : Word.AMIGO.value
        )
      );
      const sequenceJson = JSON.stringify(
        sequence.words.map(({ value }) => value)
      );

      const result =
        answerJson === sequenceJson
          ? {
              title: 'It was a match!',
              message: 'Your sequence was perfect. Congratulations.',
              success: true,
            }
          : {
              title: 'It was NOT a match!',
              message: 'Sorry, your sequence was incorrect.',
              success: false,
            };

      this.update(game._id, {
        $set: {
          sequences: game.sequences.map(s => {
            if (s._id === sequence._id) {
              return {
                ...s,
                status: result.success
                  ? SequenceStatus.SUCCESS
                  : SequenceStatus.FAILURE,
              };
            }
            return s;
          }),
        },
      });
      return result;
    },
  },
});
