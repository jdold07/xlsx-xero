import { CreditNotes, Invoices, TokenSet, XeroClient } from "xero-node"
import { writeTokenSetJson } from "./helpers"
import { SendToXeroResponse } from "./types"

const client_id = process.env.XERO_CLIENT_ID ?? ""
const client_secret = process.env.XERO_CLIENT_SECRET ?? ""

/**
 * *Refresh the Xero TokenSet*
 * - Initialises new XeroClient.
 * - Requests tokenSet refresh from Xero.
 * @param {string} userId
 * @returns {Promise<void>} tokenSet
 */
export async function refreshTokenSet(tokenSet: TokenSet) {
  const xero = new XeroClient()
  tokenSet = await xero.refreshWithRefreshToken(client_id, client_secret, tokenSet.refresh_token)
  xero.setTokenSet(tokenSet)

  if (!(await writeTokenSetJson(tokenSet))) {
    console.error("Failed to save the Xero tokenSet to the database")
    throw new Error("Failed to save the Xero tokenSet to the database")
  }

  console.log("Xero tokenSet has been refreshed")
  return xero
}

/**
 * *Set the active tenant*
 * - Sets the active tenant for the XeroClient.
 * - Returns the tenantId.
 * @param {number} index (default: 0)
 * @returns {Promise<string>} tenantId
 */
export async function setActiveTenant(index: number, xero: XeroClient): Promise<string> {
  try {
    const tenants = await xero.updateTenants()
    if (!tenants.length) {
      console.error("Tenant array received from Xero API is empty")
      throw new Error("Tenant array received from Xero API is empty")
    }
    return tenants[index].tenantId
  } catch (error: any) {
    console.error(error?.message ?? JSON.stringify(error))
    throw new Error(error?.message ?? JSON.stringify(error))
  }
}

/**
 * *Send invoices to Xero API*
 * - Sends invoices request to the Xero API.
 * - Returns the response.
 * @param {CreditNotes?} creditData optional
 * @param {Invoices?} invData optional
 * @returns {SendToXeroResponse} { invRes, crRes }
 */
export async function sendInvOrCRToXero(
  invData: Invoices = { invoices: [] },
  creditData: CreditNotes = { creditNotes: [] },
  xero: XeroClient,
  activeTenantId: string
) {
  try {
    let invRes = {} as SendToXeroResponse
    let crRes = {} as SendToXeroResponse

    if (invData.invoices?.length) {
      invRes = await xero.accountingApi.createInvoices(activeTenantId, invData, false, 2)
    }
    if (creditData.creditNotes?.length) {
      crRes = await xero.accountingApi.createCreditNotes(activeTenantId, creditData, false, 2)
    }

    return { invRes, crRes }
  } catch (error: any) {
    console.error(error?.message ?? JSON.stringify(error))
    throw new Error(error?.message ?? JSON.stringify(error))
  }
}
