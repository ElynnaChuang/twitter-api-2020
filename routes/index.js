const express = require('express')
const router = express.Router()
const { authenticated, authenticatedAdmin } = require('../middleware/auth')
const { uploadMultiple } = require('../middleware/multer')
const { errorHandler } = require('../middleware/error-handler')
const adminController = require('../controllers/admin-controller')
const userController = require('../controllers/user-controller')
const tweetController = require('../controllers/tweet-controller')
const replyController = require('../controllers/reply-controller')
const followshipController = require('../controllers/followship-controller')

router.get('/admin/users', authenticated, authenticatedAdmin, adminController.getUsers)
router.delete('/admin/tweets/:id', authenticated, authenticatedAdmin, adminController.removeTweet)

router.get('/followers', authenticated, userController.getFollowersRank)
router.get('/users/:id/followings', authenticated, userController.getUserFollowings)
router.get('/users/:id/followers', authenticated, userController.getUserFollowers)
router.get('/users/:id/likes', authenticated, userController.getUserLikes)
router.get('/users/:id/replied_tweets', authenticated, userController.getUserReplies)
router.get('/users/:id/tweets', authenticated, userController.getUserTweets)
router.put('/users/:id/account', authenticated, userController.editUserAccount)
router.put('/users/:id', authenticated, uploadMultiple, userController.editUserProfile)
router.get('/users/:id', authenticated, userController.getUser)

router.post('/users', userController.signup)
router.post('/:role/signin', userController.signin)

router.post('/followships', authenticated, followshipController.addFollowships)
router.delete('/followships/:followingId', authenticated, followshipController.removeFollowships)

router.get('/tweets/:tweet_id/replies', authenticated, replyController.getReplies)
router.post('/tweets/:tweet_id/replies', authenticated, replyController.postReply)

router.post('/tweets/:id/like', authenticated, tweetController.addTweetLike)
router.post('/tweets/:id/unlike', authenticated, tweetController.removeTweetLike)
router.get('/tweets/:tweet_id', authenticated, tweetController.getTweet)
router.get('/tweets', authenticated, tweetController.getTweets)
router.post('/tweets', authenticated, tweetController.postTweet)

router.use('/', errorHandler) // 錯誤處理
module.exports = router
