const getResult = require('../utils').getResult
module.exports = async ctx => {
  const baseUrl = ctx.request.query.site
  ctx.state.data = getResult(baseUrl)
}
