import type { Charge, Customer } from "@prisma/client"
import type { IncomingMessage } from "http"
import type { CreditNote, CreditNotes, Invoice, Invoices, TokenSet, XeroClient } from "xero-node"

/** Charges & Payments Data Object contains all Charges & Payments data for a single day */
export type ChargesAndPaymentsObj = {
  date: Date
  amount: number
  customerId: string | null
  seqNo: string
  notes: string
}

/** Object of ChargesAndPaymentsObj Array Objects */
export type ChargesAndPaymentsObjArrOBJ = {
  accountSales: ChargesAndPaymentsObj[]
  accountCR: ChargesAndPaymentsObj[]
  totalDebtors: number
  isBalanced: boolean
  accountPayments?: ChargesAndPaymentsObj[]
}

/** Object of Charge including Customer from Prisma */
export type ChargeWithCustomer = Partial<Charge> & { customer: Pick<Customer, "xeroId"> }

/** Transaction Type for node-xero API */
export type InvoiceType<T> = T extends CreditNote ? CreditNote : Invoice

/** sendToXero Invoices and/or CreditNotes Promise array functions Type */
export type SendToXero =
  | typeof XeroClient.prototype.accountingApi.createInvoices
  | typeof XeroClient.prototype.accountingApi.createCreditNotes

/** sendToXero Invoices and/or CreditNotes Promise array return Type */
export type SendToXeroResponse = {
  response: Partial<IncomingMessage>
  body: Invoices | CreditNotes
}

/** Parsed xlsx data object */
export type ParsedXlsxData = {
  accountSales: ChargesAndPaymentsObj[]
  accountCR: ChargesAndPaymentsObj[]
  totalDebtors: number
  isBalanced: boolean
}

/** Xero tokenSet as returned from  database Store */
export type ValidTokenSet = Omit<TokenSet, keyof "expired" & keyof "claims">

/** Declaration of Xero storedTokenSet JSON module for saving current tokenSet data*/
declare module "resources/xeroTokenSet.json" {
  const tokenSet: ValidTokenSet
  export default tokenSet
}
