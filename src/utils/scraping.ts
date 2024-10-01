import { Page } from 'puppeteer'

export const clickAndWait = async (page: Page, selector: string): Promise<void> => {
  await page.waitForSelector(selector)
  await page.click(selector)
  await page.waitForNetworkIdle()
}

export const retryOperation = async <T>(operation: () => Promise<T>, retries: number = 10, delay: number = 1000): Promise<T> => {
  try {
    return await operation()
  } catch (error) {
    if (retries > 0) {
      console.log(`Retrying operation... Attempts left: ${retries}, retrying in ${delay} ms`)

      await new Promise(resolve => setTimeout(resolve, delay))

      return retryOperation(operation, retries - 1, delay * 2)
    }

    throw error
  }
}

export const sleep = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms))
