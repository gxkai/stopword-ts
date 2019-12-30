const schedule = require('node-schedule')
const rule = new schedule.RecurrenceRule()
rule.second = [0, 10, 20, 30, 40, 50]
const getResult = require('./utils').getResult
const arr = ['www.hnqgc.com', 'www.tmcsy.com', 'www.baipohun.com']
schedule.scheduleJob(rule, async () => {
  const site = arr.shift()
  const result = await getResult(site)
})
export default schedule
