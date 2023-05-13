import type { IncomingMessage } from "http"
import { Account, AccountType, Accounts, TokenSet, XeroClient } from "xero-node"
import { refreshTokenSet, setActiveTenant } from "./apiFunctions"
import { getTenantIndex } from "./helpers"
import data from "./lib/coaData.json"
import storedToken from "./lib/tokenSet.json"

interface XeroResponse {
  response: IncomingMessage
  body: Accounts
}

UpdateCOA(process.argv[2])

async function UpdateCOA(entity: string) {
  try {
    const tenantIndex = getTenantIndex(entity)

    let xero = new XeroClient()
    const tokenSet: TokenSet = new TokenSet(storedToken)

    xero = await refreshTokenSet(tokenSet)
    const activeTenantId = await setActiveTenant(tenantIndex, xero)

    const finished = await processJSONData(activeTenantId, xero)
    if (!finished) {
      console.error(
        "There was an error writing Xero Chart of Accounts Account Objects to the api",
        "\n",
        "Check the error logs and try again",
        "\n",
        "Exiting..."
      )
      process.exitCode = 1
      return
    }
    console.log("Chart of Account has been updated via Xero api.")
    process.exitCode = 0
    return
  } catch (err: any) {
    console.error(
      `Status Code: ${err.response?.statusCode} => ${JSON.stringify(err?.response?.body, null, 2)}`
    )
    process.exitCode = 1
  }
}

async function processJSONData(activeTenantId: string, xero: XeroClient) {
  try {
    for (const account of data.Accounts) {
      const accountObj: Account = {
        code: account.Code,
        name: account.Name,
        type: account.Type as unknown as AccountType,
        description: account.Description ?? "",
        taxType: account.TaxType,
        reportingCode: account.ReportingCode,
      }
      if (account.SystemAccount) {
        Object.assign(accountObj, { ...accountObj, systemAccount: account.SystemAccount })
      }
      let response = {} as XeroResponse

      if (!account.AccountID) {
        response = await xero.accountingApi.createAccount(activeTenantId, accountObj)
      }
      if (account.AccountID) {
        response = await xero.accountingApi.updateAccount(activeTenantId, account.AccountID, {
          accounts: [accountObj],
        })
      }

      if (!response.response?.statusCode || response.response?.statusCode > 299) {
        console.error(
          `Status Code: ${response.response?.statusCode ?? "Ooops!"} => ${
            JSON.stringify(response?.body, null, 2) ?? "It's empty you numpty!"
          }`
        )
        process.exitCode = 1
        return false
      }

      console.log(
        response.response?.statusCode,
        response.response?.statusMessage,
        "\n",
        response?.body
      )
    }
    return true
  } catch (err: any) {
    console.error(
      `Status Code: ${err.response?.statusCode} => ${JSON.stringify(err?.response?.body, null, 2)}`
    )
    process.exitCode = 1
    return false
  }
}
