const FastScanner = require('fastscan')
const _ = require('lodash')
const superagent = require('superagent')
const cheerio = require('cheerio')
const sleep = require('sleep')
const fs = require('fs')
// 失败重试次数
const NUM_RETRIES = 3
const redisClient = require('./redis').client
const logger = require('./logger').logger
async function getSites (tempArr:Array<string>, site:string, resultArr:Array<object>):Promise<Array<string>> {
  let links:Array<string> = []
  let i
  for (i = 0; i < NUM_RETRIES; i++) {
    sleep.sleep(60 * i)
    logger.info(`等待${i}分钟`)
    logger.info(`第${i + 1}次尝试解析${site}`)
    try {
      const sres = await superagent.get(encodeURI(site))
      if (!sres || !sres.text) {
        logger.error(`${site}非网页无法解析`)
        break
      }
      const html = sres.text
      // 获取违禁词
      const words = getWords()
      const scanner = new FastScanner(words)
      const hits = scanner.hits(html)
      if (!_.isEmpty(hits)) {
        resultArr.push({ site, hits })
      }
      const $ = cheerio.load(html)
      $('a').each((index, element) => {
        const $element = $(element)
        links.push($element.attr('href'))
      })
      links = _.uniq(links.filter(el => el && el.includes(tempArr[0]) && !tempArr.includes(el)))
      logger.info(`${site}解析完毕`)
      break
    } catch (e) {
      if (i === NUM_RETRIES - 1) {
        logger.info(`${site}解析失败`)
        resultArr.push({ site, error: e.status })
      }
      links = []
    }
  }
  return links
}

/**
 * 获取违禁词
 */
function getWords () {
  let words: Array<String> = []
  let str:string = fs.readFileSync('./words.test')
  words = str.toString().split('\n')
  words = words.filter(word => {
    return word.length > 0
  })
  return words
}

/**
 *
 * @param tempArr //已遍历数组
 * @param iterArr //即将遍历数组
 * @param resultArr //结果数组
 * @returns {Promise<void>}
 */
async function iterator (baseUrl:string, tempArr:Array<string>, iterArr:Array<string>, resultArr:Array<object> ) {
  for (let i = 0; i < iterArr.length; i++) {
    const arr:Array<string> = await getSites(tempArr,iterArr[i], resultArr)
    tempArr = tempArr.concat(arr)
    await redisClient.setAsync(baseUrl, JSON.stringify({
      tempArr, arr, resultArr
    }))
    await iterator(baseUrl, tempArr, arr, resultArr)
  }
}

export async function getResult (baseUrl:string) {
  logger.info(`开始解析${baseUrl}`)
  let arr:Array<string> = [baseUrl]
  let tempArr:Array<string> = [baseUrl]
  let resultArr:Array<object> = []
  const result:string = await redisClient.getAsync(baseUrl)
  if (result) {
    const { arr: _arr, resultArr: _resultArr, tempArr: _tempArr }:{arr:Array<string>, resultArr:Array<object>, tempArr:Array<string>} = JSON.parse(result)
    arr = _arr
    resultArr = _resultArr
    tempArr = _tempArr
  }
  await iterator(baseUrl, tempArr, arr, resultArr )
  await redisClient.del(baseUrl)
  logger.info(`${baseUrl}解析结果：${JSON.stringify(resultArr)}`)
  return resultArr
}
