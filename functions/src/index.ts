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

const airbnbRoom = (roomTypeId: number) => {
  switch (roomTypeId) {
    case 10558259:
      return 'sinsaB01'
    case 24011532:
      return 'sinsaB02'
    case 19261376:
      return 'sinsaB03'
    case 21234689:
      return 'sinsa101'
    case 32770351:
      return 'dmyk101'
    case 32483826:
      return 'dmyk102'
    case 32483531:
      return 'dmyk103'
    case 32484422:
      return 'dmyk104'
    case 32233685:
      return 'dmyk201'
    case 31938474:
      return 'dmyk202'
    case 32429018:
      return 'dmyk203'
    case 31605255:
      return 'dmyk204'
    case 31096349:
      return 'dmyk300'
    default:
      return 'airbnb not secified'
  }
}

const expediaRoom = (roomTypeId: string) => {
  switch (roomTypeId) {
    case '215732153':
      return 'dmyk101'
    case '215735078':
      return 'dmyk102'
    case '215735061':
      return 'dmyk103'
    case '215735617':
      return 'dmyk104'
    case '215735618':
      return 'dmyk201'
    case '215735619':
      return 'dmyk202'
    case '215735621':
      return 'dmyk203'
    case '215735623':
      return 'dmyk204'
    case '215735080':
      return 'dmyk300'
    default:
      return 'expedia not specified'
  }
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
          roomNumber: airbnbRoom(data.listing.id),
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

export const newExpedia = functions.https.onRequest(
  async (request, response) => {
    const data = request.body
    const seperated = data.checkInData.replace(/,/g, '').split(' ')
    let startDate = ''
    let endDate = ''
    let guests = 0

    console.log('seperated')

    if (seperated.length !== 9) {
      console.log('seperated', seperated[2])
      const checkInYearCheckOutMonth = seperated[2]
        .split(/([0-9]+)/)
        .filter(Boolean)
      startDate =
        seperated[0] + ' ' + seperated[1] + ' ' + checkInYearCheckOutMonth[0]
      console.log('chekcinyear', checkInYearCheckOutMonth)
      console.log('year', seperated[4].substring(0, 4))
      console.log('guest', seperated[4].substring(4, 5))
      endDate =
        checkInYearCheckOutMonth[1] +
        ' ' +
        seperated[3] +
        ' ' +
        seperated[4].substring(0, 4)
      guests =
        parseInt(seperated[4].substring(4, 5)) +
        parseInt(seperated[4].substring(5, 6))
    } else {
      startDate = seperated[0] + ' ' + seperated[1] + ' ' + seperated[2]
      endDate = seperated[3] + ' ' + seperated[4] + ' ' + seperated[5]
      guests = parseInt(seperated[6] + parseInt(seperated[7]))
    }
    console.log('serpreted', seperated)

    const stayingDates = getDaysArray(new Date(startDate), new Date(endDate))
    const reservationCode = data.reservationCode.replace(/[^0-9]/g, '')
    console.log('reservagtion', reservationCode)
    const uniqueId = data.platform.toLowerCase() + '-' + reservationCode
    const nights = stayingDates.length

    if (data.status === 'Cancellation') {
      try {
        console.log(uniqueId, ' cancellation')
        await firebaseDb
          .collection('reservations')
          .doc(uniqueId)
          .delete()

        response.status(200).send('delete ok')
      } catch (error) {
        console.log('error', error)
        response.status(500).send(error)
      }
    } else if (data.status === 'Change') {
      try {
        console.log(uniqueId, ' change')
        await firebaseDb
          .collection('reservations')
          .doc(uniqueId)
          .set(
            {
              reservationCode: reservationCode,
              checkInDate: DateTime.fromFormat(
                startDate,
                'LLL d yyyy',
              ).toISODate(),
              checkOutDate: DateTime.fromFormat(
                endDate,
                'LLL d yyyy',
              ).toISODate(),
              nights: nights,
              guests: guests,
              guestName: data.guestName,
              stayingDates: stayingDates,
              phoneNumber: data.phoneNumber,
              price: data.totalPrice,
              roomNumber: expediaRoom(data.roomTypeCode),
            },
            {merge: true},
          )
        response.status(200).send('change ok')
      } catch (error) {
        console.log('error', error)
        response.status(500).send(error)
      }
    } else {
      try {
        console.log(uniqueId, ' new')
        await firebaseDb
          .collection('reservations')
          .doc(uniqueId)
          .set({
            platform: data.platform,
            reservationCode: reservationCode,
            checkInDate: DateTime.fromFormat(
              startDate,
              'LLL dd yyyy',
            ).toISODate(),
            checkOutDate: DateTime.fromFormat(
              endDate,
              'LLL dd yyyy',
            ).toISODate(),
            nights: nights,
            guests: guests,
            guestName: data.guestName,
            stayingDates: stayingDates,
            roomNumber: expediaRoom(data.roomTypeCode),
            phoneNumber: data.phoneNumber,
            price: data.totalPrice,
          })
        response.status(200).send('ok')
      } catch (error) {
        console.log('error', error)
        response.status(500).send(error)
      }
    }
  },
)
