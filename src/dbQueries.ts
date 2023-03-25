import { TokenSet } from "xero-node"
import db from "./dbServer"
import { ChargesAndPaymentsObj, ChargeWithCustomer, ValidTokenSet } from "./types"

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

export async function fetchTokenSetFromDB(userId: string | undefined) {
  const tokenSet = await db.xeroTokenStore.findUnique({
    where: {
      userId: userId,
    },
    select: {
      id_token: true,
      access_token: true,
      refresh_token: true,
      expires_in: true,
      expires_at: true,
      token_type: true,
      scope: true,
    },
  })
  if (!tokenSet) {
    console.error("No token set found in DB")
    throw new Error("No token set found in DB")
  }

  const validTokenSet: ValidTokenSet = Object.fromEntries(
    Object.entries(tokenSet).filter((k, v) => v !== null)
  )

  if (!validTokenSet) {
    console.error("Xero tokenSet retrieved from db is empty!")
    throw new Error("Xero tokenSet retrieved from db is empty!")
  }
  console.log("A valid Xero tokenSet was retrieved from the database")
  return validTokenSet
}

/**
 * *Store the tokenSet in the database*
 * Write the tokenSet to the database
 * @param {string} userId
 * @param {TokenSet} tokenSet
 * @returns {Promise<boolean>} true on success | throws error on failure
 */
export async function saveTokenSetInDb(
  userId: string | undefined,
  tokenSet: TokenSet
): Promise<boolean> {
  try {
    if (
      !tokenSet ||
      !tokenSet.id_token ||
      !tokenSet.access_token ||
      !tokenSet.expires_in ||
      !tokenSet.refresh_token ||
      !tokenSet.scope ||
      !userId
    ) {
      console.error("TokenSet is missing required fields")
      throw new Error("TokenSet is missing required fields")
    }
    await db.xeroTokenStore.upsert({
      where: { userId },
      update: {
        id_token: tokenSet.id_token,
        access_token: tokenSet.access_token,
        expires_in: tokenSet.expires_in,
        expires_at: tokenSet.expires_at ?? Date.now() + tokenSet.expires_in * 1000,
        refresh_token: tokenSet.refresh_token,
        token_type: tokenSet.token_type,
        scope: tokenSet.scope,
      },
      create: {
        userId,
        id_token: tokenSet.id_token,
        access_token: tokenSet.access_token,
        expires_in: tokenSet.expires_in,
        expires_at: tokenSet.expires_at ?? Date.now() + tokenSet.expires_in * 1000,
        refresh_token: tokenSet.refresh_token,
        token_type: tokenSet.token_type,
        scope: tokenSet.scope,
      },
    })
    return true
  } catch (error: any) {
    console.error(error?.message ?? JSON.stringify(error))
    await db.$disconnect()
    throw new Error(error?.message ?? JSON.stringify(error))
  }
}
