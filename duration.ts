module.exports = async (ctx, next) => {
  const stime = new Date().getTime()
  await next()
  const etime = new Date().getTime()
  ctx.state.duration = etime - stime
}
