const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const passportJWT = require('passport-jwt')
const JWTStrategy = passportJWT.Strategy
const ExtractJWT = passportJWT.ExtractJwt
const bcrypt = require('bcryptjs')
const { User, Like, Followship } = require('../models')

passport.use(new LocalStrategy(
  {
    usernameField: 'account',
    passwordField: 'password',
    passReqToCallback: true
  },
  async (req, account, password, done) => {
    try {
      const { role } = req.params
      const user = (role && role === 'admin')
        ? await User.findOne({ where: { account, role: 'admin' } })
        : (role && role === 'user')
            ? await User.findOne({ where: { account, role: 'user' } })
            : 'error'
      if (user === 'error') throw new Error('路由錯誤')
      if (!user) throw new Error('帳號不存在！')
      const isMatch = bcrypt.compareSync(password, user.password)
      if (!isMatch) throw new Error('輸入的帳號或密碼錯誤')

      const [followings, followers] = await Promise.all([
        Followship.findAll({ where: { followerId: user.id }, raw: true }),
        Followship.findAll({ where: { followingId: user.id }, raw: true })
      ])
      const userData = user.toJSON()
      delete userData.password
      return done(null, {
        ...userData,
        followingsId: followings.map(f => f.followingId),
        followersId: followers.map(f => f.followerId)
      })
    } catch (err) {
      return done(err, null)
    }
  }
))

const jwtOptions = {
  jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET
}

passport.use(new JWTStrategy(
  jwtOptions,
  async (jwtPayload, done) => {
    try {
      const user = await User.findByPk(jwtPayload.id, {
        attributes: { exclude: ['password'] },
        include: [
          { model: Like, attributes: ['id', 'TweetId'] },
          { model: User, as: 'Followers', attributes: ['id'] },
          { model: User, as: 'Followings', attributes: ['id'] }
        ]
      })
      return done(null, user.toJSON())
    } catch (err) {
      return done(err, null)
    }
  }
))

module.exports = passport
