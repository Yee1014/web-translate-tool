/**
 * autoRun
 * @author  Yee
 * @date    2022/8/24
 * @desc
 */
import { ThenableWebDriver } from 'selenium-webdriver'
const { By, Builder, until, Key } = require('selenium-webdriver')
const chrome = require('selenium-webdriver/chrome')
const execa = require('execa')

const chromeDriverPath = '/Users/zhangchaoye/drivers/chromedriver'

let driver: ThenableWebDriver

/**
 * @param {string} bin
 * @param {string[]} args
 * @param {object} opts
 */
const run = async (bin: string, args: string[], opts = {}) => {
  execa(bin, args, { ...opts })
}

const testScript = async () => {
  await driver.wait(until.elementLocated(By.className('h1')), 10000)
  // Stores the header element
  let h1 = await driver.findElement(By.className('h1'))
  // console.log('h1:', h1)
  // Executing JavaScript to capture innerText of header element
  let text = await driver.executeScript('return arguments[0].innerText', h1)
  let initialised = await driver.executeScript('return initialised')
  console.log('test executeScript:', text, initialised)
  // const actionOrigin = driver.findElement(By.className('percent'))
  const actions = driver.actions({ async: true })
  const windowRect = await driver.manage().window().getRect()
  await actions
    .move({ x: windowRect.width / 2, y: 90 })
    .contextClick()
    .keyDown(Key.ARROW_DOWN)
    .perform()
}

const openPage = async () => {
  const service = new chrome.ServiceBuilder(chromeDriverPath)
  const chromeOptions = new chrome.Options()
  driver = new Builder()
    .setChromeOptions(chromeOptions)
    .forBrowser('chrome')
    .setChromeService(service)
    .build()
  await driver.get('http://localhost:5173/')
  // await driver.manage().setTimeouts({ implicit: 10000 })
  await testScript()
}

const quit = () => {
  driver?.quit()
  console.log('退出!')
  process.exit(0)
}

const autoRun = () => {
  console.log('开启自动化...')
  run('pnpm', ['dev'])
  openPage()
}

autoRun()

export {}
