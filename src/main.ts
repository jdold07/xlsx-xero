import { TokenSet, XeroClient } from "xero-node"
import { refreshTokenSet, sendInvOrCRToXero, setActiveTenant } from "./apiFunctions"
import { createXeroDataObject } from "./createXeroDataObject"
import { getLogPath, getTenantIndex, writeResponseLog } from "./helpers"
import storedToken from "./lib/tokenSet.json"

main(process.argv[2])

async function main(entity: string) {
  try {
    const logPath = getLogPath(entity)
    const tenantIndex = getTenantIndex(entity)

    let xero = new XeroClient()
    const tokenSet: TokenSet = new TokenSet(storedToken)

    xero = await refreshTokenSet(tokenSet)
    const activeTenantId = await setActiveTenant(tenantIndex, xero)

    const { invoices, credits } = await createXeroDataObject(logPath)
    console.log("Xero Invoice Objects created")

    const { invRes, crRes } = await sendInvOrCRToXero(invoices, credits, xero, activeTenantId)
    console.log("Xero Invoice Objects sent to Xero API")

    //TODO - add error checking & logging on Xero response

    writeResponseLog(invRes, crRes, logPath)
    console.log("Invoices have been sent to Xero.")
    process.exitCode = 0
    return
  } catch (err) {
    console.log(err)
    process.exitCode = 1
  }
}
