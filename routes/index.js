const router = require('koa-router')()
const tumblr = require('../modules/tumblr.module')
const fs = require('fs')

// 首页视频列表
router.get('/list', async (ctx, next) => {
  let videos = await tumblr.getVideosList();
  await ctx.render('list', {
    title: 'Hello Tumblr',
    videos: videos
  })
})

// 获取视频页
router.get('/', async (ctx, next) => {
  await ctx.render('get', {
    title: '下载视频'
  })
})


// 下载
router.post('/doGet', async (ctx, next) => {
  try{
    const blog = ctx.request.body.blog;
    console.log(blog)
    const all = await tumblr.getBlogLikes('zbmccc.tumblr.com').then(async r => r.liked_count);// 获取共有多少条收藏
    // console.log(all)
    const limit = 50; //每次获取的数量
  
    let success = 0; //获取到多少条结果
    let content = []; //数据
    let content2 = ''; //只有视频地址的数据

    console.log('========= 开工 =========')
    for(let i = 0; i < Math.floor(all / limit); i ++){
      let options = {
        limit: limit,
        offset: i * limit
      }

      await tumblr.getBlogLikes('zbmccc.tumblr.com', options).then(async r => {
        for(let video of r.liked_posts){
          let data = {
            video: video.video_url,
            thumbnail: video.thumbnail_url
          }
          success ++;
          console.log(success)
          content.push(data);
          content2 = content2 + data.video + '\n';
        }
      })
    }

    // 存储数据到文件
    content = JSON.stringify(content);
    fs.appendFile('public/files/data.txt', content, 'utf8', (err) => { console.log('err', err) })
    fs.appendFile('public/files/videos.txt', content2, 'utf8', (err) => { console.log('err', err) })

    console.log('========= 完成 =========')
    ctx.body = {
      all: all,
      success: success
    }
  }
  catch (e){
    console.log(e)
  }
})
module.exports = router
