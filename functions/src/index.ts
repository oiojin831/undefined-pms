import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
import {DateTime} from 'luxon'

const getDaysArray = (start: Date, end: Date) => {
  const arr: Array<Date> = []
  const dt: Date = start
  for (dt; dt <= end; dt.setDate(dt.getDate() + 1)) {
    arr.push(new Date(dt))
  }
  return arr.map(v => v.toISOString().slice(0, 10))
}

admin.initializeApp()

const firebaseDb = admin.firestore()

export const addReservations = functions.https.onRequest(
  async (request, response) => {
    const data = request.body

    const stayingDates = getDaysArray(
      new Date(data.start_date),
      new Date(data.end_date),
    )

    try {
      const uniqueId = 'airbnb' + '-' + data.code
      await firebaseDb
        .collection('reservations')
        .doc(uniqueId)
        .set({
          platform: data.platform || 'airbnb',
          reservationCode: data.code,
          checkInDate: data.start_date,
          checkOutDate: data.end_date,
          nights: data.nights,
          guests: data.guests,
          status: data.status,
          listing: data.listing,
          stayingDates: stayingDates,
          bill: {
            currency: data.currency,
            securityPrice: data.security_price,
            securityPriceFormatted: data.security_price_formatted,
            basePrice: data.base_price,
            basePriceFormatted: data.base_price_formatted,
            guestFee: data.guest_fee,
            guestFeeFormatted: data.guest_fee_formatted,
            taxAmount: data.tax_amount,
            taxAmountFormatted: data.tax_amount_formatted,
            extrasPrice: data.extras_price,
            extrasPriceFormatted: data.extras_price_formatted,
            subtotal: data.subtotal,
            subtotalFormatted: data.subtotal_formatted,
            totalPrice: data.total_price,
            totalPiceFormatted: data.total_price_formatted,
            perNightPrice: data.per_night_price,
            perNightPriceFormatted: data.per_night_price_formatted,
            payoutPrice: data.payout_price,
          },
        })
      const snap = await firebaseDb
        .collection('reservations')
        .where('reservationCode', '==', data.code)
        .get()
      snap.forEach(doc => console.log('doc1', doc.data()))
      response.status(200).send('ok')
    } catch (error) {
      console.log('error', error)
      response.status(500).send(error)
    }
  },
)

export const todayReservations = functions.https.onRequest(
  (request, response) => {
    const resRef = firebaseDb.collection('reservations')
    const now = DateTime.local().setZone('Asia/Seoul')
    console.log('now', now.toISODate())
    const today = resRef.where('checkIn', '==', now.toISODate())
    today
      .get()
      .then(snapshot => {
        let result = ''
        snapshot.forEach(doc => {
          const data = doc.data()
          result =
            result +
            '\n' +
            data.listingName +
            ': ' +
            Math.round(data.nights * 1.5 * data.guests)
        })
        response.send({
          response_type: 'in_channel',
          text: result,
        })
      })
      .catch(error => {
        console.log(error)
        response.send(error)
      })
  },
)
