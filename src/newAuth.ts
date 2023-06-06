import Readline from "readline/promises"
import { XeroClient } from "xero-node/dist/XeroClient"
import { writeTokenSetJson } from "./helpers"

newAuth()

/**
 * Gets a new tokenSet from Xero API and saves it to the database.
 * Required for authorises new Organisations to use the app.
 * @param {string} userId
 * @returns {Promise<void>}
 * @notes Seperate function only required initially or to authorise new Organisations.
 */
async function newAuth() {
  const client_id = process.env.XERO_CLIENT_ID ?? ""
  const client_secret = process.env.XERO_CLIENT_SECRET ?? ""
  const redirectUris = [process.env.XERO_REDIRECT_URI ?? ""]
  const scopes = (process.env.XERO_SCOPES ?? "").split(" ")

  // Initialize the XeroClient and build the consent url
  const xero = new XeroClient({
    clientId: client_id,
    clientSecret: client_secret,
    redirectUris,
    scopes,
  })
  await xero.initialize()
  const consentUrl = await xero.buildConsentUrl()
  console.log(consentUrl)

  // Open the consent url in the user's browser
  import("open").then((open) => open.default(consentUrl))

  // Create a readline interface to get the callback url from the user
  const rl = Readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  console.log(
    "\n1. Follow the steps in your browser to authorise a new Organisation.\n",
    "2. When it completes, copy the callback url from the address bar of your browser.\n",
    "3. Then return to this terminal and paste the callback url below.\n"
  )
  const url = await rl.question("What is the callback url? ")
  rl.close()

  // Get the tokenSet from Xero API using the callback url from the user input
  const tokenSet = await xero.apiCallback(url)

  // Save the new tokenSet to the database
  if (await writeTokenSetJson(tokenSet)) {
    console.log(
      "\nXero tokenSet saved to the database.\n",
      "Any newly authorised Organisations will be available in the Tenant array.\n",
      "Make sure to update switch controls and package.json scripts to run a new Tenant.\n"
    )

    process.exitCode = 0
  } else {
    console.warn(
      "\nXero tokenSet was NOT saved to the database.\n",
      "You will need to re-run the newAuth script again to save authorised Organisations to the Tenant array and database.\n"
    )
    process.exitCode = 1
  }
  return
}
