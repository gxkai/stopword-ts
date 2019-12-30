import * as Router from "koa-router";
const router:Router = new Router({
    prefix: '/'
});
const controllers = require('./controllers')
router.get('/', controllers.sites)
export default router
