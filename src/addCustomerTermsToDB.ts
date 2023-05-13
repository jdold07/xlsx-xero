import { Customer, TermsType } from "@prisma/client"
import db from "./dbServer"
import data from "./lib/westbrookCustomers.json"

addCustomerTermsToDB()

export async function addCustomerTermsToDB() {
  try {
    const dbCustomers = await db.customer.findMany()
    const isSuccess = await processJSONData(dbCustomers)

    if (!isSuccess) {
      console.error("Failed to update customer terms in the database")
      process.exitCode = 1
      return
    }
    console.log("Customer terms updated for all customers in the database")
    process.exitCode = 0
    return
  } catch (err: any) {
    console.error(`Status Code: ${err?.code} => ${JSON.stringify(err?.message, null, 2)}`)
    process.exitCode = 1
  }
}

async function processJSONData(dbCustomers: Customer[]) {
  if (!dbCustomers.length) {
    console.warn("No customers found in db")
    process.exitCode = 1
    return false
  }

  try {
    let updatedCustomers: Customer[] = []
    let notUpdatedCustomers: Customer[] = []
    for (const customer of dbCustomers) {
      const xeroCustomer = data.find((cust) => cust.ContactID === customer.xeroId)

      if (!xeroCustomer) {
        notUpdatedCustomers = [...notUpdatedCustomers, customer]
        console.warn(`${customer.customerId} - ${customer.name} not found in Xero data`)
        continue
      }

      const updatedCustomer = {
        ...customer,
        name: xeroCustomer?.Name,
        termsType: xeroCustomer?.PaymentTerms?.Sales.Type
          ? (xeroCustomer?.PaymentTerms?.Sales.Type as TermsType)
          : customer.termsType,
        termsDays: xeroCustomer?.PaymentTerms?.Sales.Day
          ? xeroCustomer?.PaymentTerms?.Sales.Day
          : customer.termsDays,
      }

      updatedCustomers = [...updatedCustomers, updatedCustomer]

      await db.customer.update({
        where: { customerId: customer.customerId },
        data: updatedCustomer,
        select: null,
      })

      console.log(`${customer.customerId} - ${customer.name} updated in db`)
    }
    console.log(`${updatedCustomers.length} of ${dbCustomers.length} customers updated in db`)
    console.log("*".repeat(50), "\n")
    console.log("Customers not updated in db: \n")
    console.table(notUpdatedCustomers)
    return true
  } catch (err: any) {
    console.error(`Status Code: ${err?.code} => ${JSON.stringify(err?.message, null, 2)}`)
    process.exitCode = 1
    return false
  }
}
