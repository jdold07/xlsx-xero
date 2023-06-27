import { TokenSet, XeroClient } from "xero-node"
import { refreshTokenSet, sendFileAttachmentsToXero, sendInvOrCRToXero, setActiveTenant } from "./apiFunctions"
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

    const { invoices, credits, fileAttachments } = await createXeroDataObject(logPath)
    console.log("Xero Invoice Objects created")

    const { invRes, crRes } = await sendInvOrCRToXero(invoices, credits, xero, activeTenantId)
    console.log("Xero Invoice Objects sent to Xero API")

    //TODO - add error checking & logging on Xero response

    await writeResponseLog(invRes, crRes, logPath)
    console.log("Invoices have been sent to Xero.")

    await sendFileAttachmentsToXero(fileAttachments, xero, activeTenantId, logPath)
    console.log("DD File attachments have been uploaded and attached to DD invoices")

    process.exitCode = 0
    return
  } catch (err) {
    console.error(err, null, 2)
    process.exitCode = 1
  }
}
