const helper = require('../_helpers')
const { valueTrim } = require('../helpers/obj-helpers')
const { User, Tweet, Reply } = require('../models')

const replyController = {
  postReply: async (req, res, next) => {
    try {
      const TweetId = req.params.tweet_id
      const UserId = helper.getUser(req).id
      const { comment } = valueTrim(req.body)
      if (!comment) throw new Error('回覆不可空白')
      if (comment.length > 140) throw new Error('字數限制 140 字')

      const [user, tweet] = await Promise.all([
        User.findByPk(UserId, { raw: true }),
        Tweet.findByPk(TweetId, { raw: true })
      ])
      if (!user) throw new Error('使用者不存在')
      if (!tweet) throw new Error('推文不存在')
      
      await Reply.create({ TweetId, UserId, comment })
      res.status(200).end()
    } catch (err) {
      next(err)
    }
  },
  getReplies: async (req, res, next) => {
    try {
      const TweetId = req.params.tweet_id
      const tweet = await Tweet.findByPk(TweetId, { raw: true })
      if (!tweet) throw new Error('推文不存在')
      const accountReplied = await User.findByPk(tweet.UserId, {
        attributes: ['account'],
        raw: true
      })
      const data = await Reply.findAll({
        include: [
          { model: User, attributes: ['id', 'name', 'account', 'avatar'] }
        ],
        where: { TweetId },
        order: [['updatedAt', 'DESC']]
      })
      const replies = data?.map(d => ({
        ...d.toJSON(),
        accountReplied: accountReplied?.account
      }))
      res.status(200).json(replies)
    } catch (err) {
      next(err)
    }
  }
}

module.exports = replyController
