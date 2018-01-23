import * as Koa from 'koa';
import mongoDb from '../db/mongoDb';
import redis from '../db/RedisClient';

const EXPIRE_TIME = 60 * 1000;

const addUser = async (ctx: Koa.Context) => {
  console.log('go here');
  try {
    let result = await mongoDb.insertOne('user', ctx.request['body']);
    ctx.body = result;
  } catch (error) {
    ctx.status = 500;
    ctx.body = error;
  }
}

const login = async (ctx: Koa.Context) => {
  let user = ctx.request['body'];
  try {
    let redisRes = await redis.get(user.username);
    if(redisRes) {
      let data = {
        message: 'login success',
        from: 'redis',
        data: redisRes
      }
      ctx.body = data; 
    } else if(await mongoDb.findOne('user',{username: user.username})){
      let mongoRes = await mongoDb.findOne('user',{username: user.username});
      if(mongoRes) {
        let data = {
          message: 'login success',
          from: 'mongodb',
          data: mongoRes.result
        }
        ctx.body = data; 
      }
    } else {
      let data = {
        message: 'login faild'
      };
      ctx.body = data;
    }
  } catch (error) {
    ctx.status = 500;
    ctx.body = error;
  }
}

export default {
  addUser,
  login
}