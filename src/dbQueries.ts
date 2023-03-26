import db from "./dbServer"
import { ChargesAndPaymentsObj, ChargeWithCustomer } from "./types"

export async function fetchChargesfromDB(xlsxCharges: ChargesAndPaymentsObj[]) {
  const dbCharges = [] as ChargeWithCustomer[]
  const unverifiedCharges = [] as ChargesAndPaymentsObj[]

  if (xlsxCharges.length) {
    for (const charge of xlsxCharges) {
      if (!charge.customerId) continue
      const dbCharge = await db.charge.findFirst({
        where: {
          date: new Date(charge.date.toISOString().slice(0, 10)),
          amount: +charge.amount.toFixed(2),
          customerId: charge.customerId,
          seqNo: charge.seqNo,
        },
        select: {
          id: true,
          amount: true,
          date: true,
          customerId: true,
          customer: {
            select: {
              xeroId: true,
            },
          },
          seqNo: true,
          terminalId: true,
          tranTimeStamp: true,
        },
      })

      if (!dbCharge) {
        unverifiedCharges.push(charge)
        continue
      }
      const dbChargeWithNotes = { ...dbCharge, notes: charge.notes }
      dbCharges.push(dbChargeWithNotes)
    }
  }
  console.log("Charges for comparison fetched from DB")
  return { dbCharges, unverifiedCharges }
}

/**
 * Fetch data from database required to create the DD Xero Invoice for the specified date
 * @param {string | Date} date
 * @returns
 */
export async function fetchDDInvoiceData(date: string | Date) {
  try {
    const [gmTotals, deptSales, storeExpenses, charges] = await Promise.all([
      db.combinedImportedTillTotal.findUniqueOrThrow({
        where: {
          date: new Date(new Date(date).toISOString().slice(0, 10)),
        },
        select: {
          date: true,
          customerCount: true,
          totalSales: true,
          totalRounding: true,
          totalCash: true,
          totalCheques: true,
          totalEFTPOS: true,
          totalAccountSales: true,
          totalGst: true,
        },
      }),

      db.departmentSales.findMany({
        where: {
          date: new Date(new Date(date).toISOString().slice(0, 10)),
        },
        select: {
          deptCode: true,
          department: {
            select: {
              deptDisplayName: true,
              glCodePurchases: true,
              glCodeSales: true,
            },
          },
          sellEx: true,
        },
      }),

      db.charge.findMany({
        where: {
          AND: [
            { date: new Date(new Date(date).toISOString().slice(0, 10)) },
            { customerId: "10528" },
          ],
        },
        select: {
          amount: true,
          seqNo: true,
          terminalId: true,
          tranTimeStamp: true,
        },
      }),

      db.charge.findMany({
        where: {
          AND: [
            { date: new Date(new Date(date).toISOString().slice(0, 10)) },
            { customerId: { not: "10528" } },
          ],
        },
        select: {
          amount: true,
        },
      }),
    ])

    const storeExp = {
      totalExp: storeExpenses.reduce((a, c) => a + +c.amount, 0),
      posId: storeExpenses
        .map(
          (v) =>
            `${v.terminalId}/${v.seqNo} - ${new Date(
              (v.tranTimeStamp?.getTime() ?? 0) - 36000000 ?? Date.now()
            )?.toLocaleString("en-AU", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              hour12: false,
            })}\n`
        )
        .join(""),
    }

    const ddTitle = `DD/${gmTotals.date
      .toLocaleDateString("en-AU", { weekday: "short" })
      .toLocaleUpperCase()}/${gmTotals.customerCount}/${(
      +gmTotals.totalSales / gmTotals.customerCount
    ).toFixed(2)}`

    const totalCustCharges = charges.reduce((a, c) => a + +c.amount, 0)

    return { ...gmTotals, storeExp, deptSales, ddTitle, totalCustCharges }
  } catch (error: any) {
    console.error(error?.message ?? JSON.stringify(error))
    await db.$disconnect()
    throw new Error(error?.message ?? JSON.stringify(error))
  }
}
