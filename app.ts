import router from './routes'
import * as Koa from 'koa'
const bodyparser = require('koa-bodyparser')
const response = require('./response')
const duration = require('./duration')
const schedule = require('./shedule')
const app:Koa = new Koa()
// 使用响应处理中间件
app.use(response)
app.use(duration)

// 解析请求体
app.use(bodyparser())

app.use(router.routes())

// 启动程序，监听端口
app.listen(8888, () => {
  console.log('Server running on http://localhost:8888')
})
