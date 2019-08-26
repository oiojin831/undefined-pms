import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { DateTime } from "luxon";

const getDaysArray = (start: Date, end: Date) => {
  const arr: Array<Date> = [];
  const dt: Date = start;
  for (dt; dt <= end; dt.setDate(dt.getDate() + 1)) {
    arr.push(new Date(dt));
  }
  return arr.map(v => v.toISOString().slice(0, 10));
};

const agodaHotelType = (hotelId: number) => {
  switch (hotelId) {
    case 6887228:
      return "dmyk";
    case 399390:
      return "jhonor";
    default:
      return "N/A";
  }
};

const airbnbRoom = (roomTypeId: number) => {
  switch (roomTypeId) {
    case 10558259:
      return "sinsaB01";
    case 24011532:
      return "sinsaB02";
    case 19261376:
      return "sinsaB03";
    case 21234689:
      return "sinsa101";
    case 32770351:
      return "dmyk101";
    case 32483826:
      return "dmyk102";
    case 32483531:
      return "dmyk103";
    case 32484422:
      return "dmyk104";
    case 32233685:
      return "dmyk201";
    case 31938474:
      return "dmyk202";
    case 32429018:
      return "dmyk203";
    case 31605255:
      return "dmyk204";
    case 31096349:
      return "dmyk300";
    case 38083180:
      return "jhonor201B";
    case 38090176:
      return "jhonor201C";
    case 37973180:
      return "jhonor201D";
    case 38083688:
      return "jhonor301B";
    case 38090627:
      return "jhonor301C";
    case 38081524:
      return "jhonor301D";
    case 37885485:
      return "jhonor202A";
    case 37783241:
      return "jhonor202B";
    case 37886568:
      return "jhonor202C";
    case 37886567:
      return "jhonor202D";
    case 37902101:
      return "jhonor302X";
    default:
      return "airbnb not secified";
  }
};

const expediaRoom = (roomTypeId: string) => {
  switch (roomTypeId) {
    case "215732153":
      return "dmyk101";
    case "215735078":
      return "dmyk102";
    case "215735061":
      return "dmyk103";
    case "215735617":
      return "dmyk104";
    case "215735618":
      return "dmyk201";
    case "215735619":
      return "dmyk202";
    case "215735621":
      return "dmyk203";
    case "215735623":
      return "dmyk204";
    case "215735080":
      return "dmyk300";
    default:
      return "expedia not specified";
  }
};

const agodaRoom = (roomTypeCode: string) => {
  switch (roomTypeCode) {
    case "Business Double":
      return "dmyk101";
    case "Deluxe Double":
      return "dmyk102";
    case "City Loft Room":
      return "dmyk103";
    case "Double Room":
      return "dmyk104";
    case "Basic Double":
      return "dmyk201";
    case "Classic Double":
      return "dmyk202";
    case "Comfort Double":
      return "dmyk203";
    case "Elite Double":
      return "dmyk204";
    case "Double shared bathroom":
      return "jhonor202A";
    case "Room with Bunk Bed and Shared Bathroom":
      return "jhonor202B";
    case "Triple Room with Shared Bathroom":
      return "jhonor202C";
    case "Budget Quadruple Room with Shared Bathroom":
      return "jhonor202D";
    default:
      return "agoda room name error";
  }
};

admin.initializeApp();

const firebaseDb = admin.firestore();

export const newAirbnb = functions.https.onRequest(
  async (request, response) => {
    const data = request.body;
    const re = new RegExp("dmyk");
    const reSinsa = new RegExp("sinsa");
    //const reJhonor = new RegExp("jhonor");
    console.log(`Airbnb listing id: ${data.listing.id}`);
    const isDmyk = re.test(airbnbRoom(data.listing.id));
    const isSinsa = reSinsa.test(airbnbRoom(data.listing.id));
    //const isJhonor = reJhonor.test(airbnbRoom(data.listing.id));

    const stayingDates = getDaysArray(
      new Date(data.start_date),
      new Date(data.end_date)
    );
    const uniqueId = "airbnb" + "-" + data.code;
    console.log("airbnb status", data.status);
    //pending just quit the function
    // how to terminate ??

    if (data.status === "cancelled") {
      try {
        await firebaseDb
          .collection("reservations")
          .doc(uniqueId)
          .delete();

        return response.status(200).send("delete ok");
      } catch (error) {
        console.log("error", error);
        return response.status(500).send(error);
      }
    }

    if (data.status === "accepted") {
      try {
        await firebaseDb
          .collection("reservations")
          .doc(uniqueId)
          .set({
            platform: "airbnb",
            reservationCode: data.code,
            checkInDate: data.start_date,
            checkOutDate: data.end_date,
            checkInTime: isSinsa ? 16 : 15,
            checkOutTime: isSinsa ? 10 : 11,
            nights: data.nights,
            guests: data.guests,
            roomNumber: airbnbRoom(data.listing.id),
            guestHouseName: isDmyk ? "dmyk" : isSinsa ? "sinsa" : "jhonor",
            price: data.total_price_formatted,
            payoutPrice: data.payout_price,
            phoneNumber: data.guest.phone,
            guestName: data.guest.first_name + " " + data.guest.last_name,
            stayingDates: stayingDates
          });
        console.log(
          `new accepted reservation ${data.start_date} with ${airbnbRoom(
            data.listing.id
          )}`
        );
        return response.status(200).send("ok");
      } catch (error) {
        console.log("error", error);
        return response.status(500).send(error);
      }
    }
    console.log("not added to db");
    console.log("reservationCode", data.code);
    console.log(
      "guestName",
      data.guest.first_name + " " + data.guest.last_name
    );
    return response.status(200).send("ok");
  }
);

export const newExpedia = functions.https.onRequest(
  async (request, response) => {
    const data = request.body;

    const reservationCode = data.reservationCode.replace(/[^0-9]/g, "");
    const uniqueId = "expedia" + "-" + reservationCode;
    console.log(uniqueId);
    console.log("status: ", data.status);

    if (data.status === "Cancellation") {
      try {
        await firebaseDb
          .collection("reservations")
          .doc(uniqueId)
          .delete();

        return response.status(200).send("delete ok");
      } catch (error) {
        console.log("error", error);
        return response.status(500).send(error);
      }
    }

    const re = new RegExp("dmyk");
    const isDmyk = re.test(expediaRoom(data.roomTypeCode));

    const inOut = data.checkInData.replace(/,/g, "").split(" ");
    const startDate = `${inOut[0]} ${inOut[1]} ${inOut[2]}`;
    const endDate = `${inOut[3]} ${inOut[4]} ${inOut[5]}`;
    console.log("inOut: ", inOut);

    const stayingDates = getDaysArray(new Date(startDate), new Date(endDate));

    if (data.status === "Change") {
      try {
        console.log(uniqueId, " change");
        await firebaseDb
          .collection("reservations")
          .doc(uniqueId)
          .set(
            {
              reservationCode: reservationCode,
              checkInDate: DateTime.fromFormat(
                startDate,
                "LLL d yyyy"
              ).toISODate(),
              checkOutDate: DateTime.fromFormat(
                endDate,
                "LLL d yyyy"
              ).toISODate(),
              nights: stayingDates.length - 1,
              guests: 2,
              checkInTime: isDmyk ? 16 : 15,
              checkOutTime: isDmyk ? 10 : 11,
              guestName: data.guestName,
              stayingDates: stayingDates,
              phoneNumber: data.phoneNumber,
              price: data.totalPrice,
              roomNumber: expediaRoom(data.roomTypeCode),
              guestHouseName: isDmyk ? "dmyk" : "sinsa"
            },
            { merge: true }
          );
        return response.status(200).send("change ok");
      } catch (error) {
        console.log("error", error);
        return response.status(500).send(error);
      }
    } else {
      try {
        console.log(uniqueId, " new");
        await firebaseDb
          .collection("reservations")
          .doc(uniqueId)
          .set({
            platform: data.platform,
            reservationCode: reservationCode,
            checkInDate: DateTime.fromFormat(
              startDate,
              "LLL d yyyy"
            ).toISODate(),
            checkOutDate: DateTime.fromFormat(
              endDate,
              "LLL d yyyy"
            ).toISODate(),
            checkInTime: isDmyk ? 16 : 15,
            checkOutTime: isDmyk ? 10 : 11,
            nights: stayingDates.length - 1,
            guests: 2,
            guestName: data.guestName,
            stayingDates: stayingDates,
            roomNumber: expediaRoom(data.roomTypeCode),
            phoneNumber: data.phoneNumber,
            price: data.totalPrice,
            guestHouseName: isDmyk ? "dmyk" : "sinsa"
          });
        return response.status(200).send("new ok");
      } catch (error) {
        console.log("error", error);
        return response.status(500).send(error);
      }
    }
  }
);

export const newAgoda = functions.https.onRequest(async (request, response) => {
  const data = request.body;

  const reservationCode = data.reservationCode.replace(/[^0-9]/g, "");
  const uniqueId = "agoda" + "-" + reservationCode;
  console.log(uniqueId);
  console.log("status: ", data.status);

  if (data.status === "Cancellation") {
    try {
      await firebaseDb
        .collection("reservations")
        .doc(uniqueId)
        .delete();

      return response.status(200).send("agoda delete ok");
    } catch (error) {
      console.log("error", error);
      return response.status(500).send(error);
    }
  }

  const checkInDate = DateTime.fromFormat(
    data.checkIn,
    "d-MM-yyyy"
  ).toISODate();
  const checkOutDate = DateTime.fromFormat(
    data.checkOut,
    "d-MM-yyyy"
  ).toISODate();
  const stayingDates = getDaysArray(
    new Date(checkInDate),
    new Date(checkOutDate)
  );

  console.log("checkindate", checkInDate);
  console.log("checkoutdate", checkOutDate);

  const guests = data.guests.replace(/[^0-9]/g, ""); // extract number
  const roomTypeCode = data.roomTypeCode.replace(/[0-9]/g, "").trim(); // extract number
  const phoneNumber = data.phoneNumber ? data.phoneNumber : "n/a";

  try {
    if (data.status === "Booking confirmation") {
      await firebaseDb
        .collection("reservations")
        .doc(uniqueId)
        .set({
          platform: "agoda",
          reservationCode: reservationCode,
          checkInDate: checkInDate,
          checkOutDate: checkOutDate,
          checkInTime: 16,
          checkOutTime: 10,
          nights: stayingDates.length - 1,
          guests: parseInt(guests),
          guestName: data.guestName,
          stayingDates: stayingDates,
          roomNumber: agodaRoom(roomTypeCode),
          phoneNumber: phoneNumber,
          price: data.totalPrice,
          payoutPrice: data.payoutPrice,
          guestHouseName: agodaHotelType(data.hotel)
        });
      return response.status(200).send("new agoda ok");
    }
  } catch (error) {
    console.log("error", error);
    return response.status(500).send(error);
  }

  console.log("no action agoda");
  return response.status(200).send("ok");
});

export const addAdminRole = functions.https.onCall(async (data, context) => {
  // get the user add custom claim - admin, cleaner
  try {
    const user = await admin.auth().getUserByEmail(data.email);
    await admin.auth().setCustomUserClaims(user.uid, { admin: true });
    return { message: `Success! ${data.email} has been made an admin` };
  } catch (error) {
    console.log("error", error);
    return { message: "error" };
  }
});

export const newBooking = functions.https.onRequest(
  async (request, response) => {
    const data = request.body;

    const uniqueId = "agoda" + "-" + data.reservationCode;
    console.log(uniqueId);
    // TODO status 바꾸기
    // TODO reservationCode 바꾸기
    const stayingDates = getDaysArray(
      new Date(data.checkInDate),
      new Date(data.checkOutDate)
    );

    try {
      await firebaseDb
        .collection("reservations")
        .doc(uniqueId)
        .set({
          platform: "agoda",
          reservationCode: data.reservationCode,
          checkInDate: data.checkInDate,
          checkOutDate: data.checkOutDate,
          checkInTime: 16,
          checkOutTime: 10,
          nights: stayingDates.length - 1,
          guests: parseInt(data.guests),
          guestName: data.guestName,
          stayingDates: stayingDates,
          roomNumber: data.roomTypeCode,
          phoneNumber: data.phoneNumber,
          price: data.totalPrice,
          payoutPrice: (data.totalPrice * 0.75).toString(),
          guestHouseName: "jhonor"
        });
      return response.status(200).send("new booking ok");
    } catch (error) {
      console.log("error", error);
      return response.status(500).send(error);
    }
  }
);

export const calculateEmpty = functions.https.onRequest(
  async (request, response) => {
    try {
      const querySnapshot = await firebaseDb
        .collection("reservations")
        .where("guestHouseName", "==", "jhonor")
        .get();
      let num = 0;
      querySnapshot.forEach(function(doc) {
        if (
          doc.data().checkInData < "2019-09-01" &&
          doc.data().checkInData > "2019-10-01"
        ) {
          console.log(doc.id, " => ", doc.data().nights);
          num = num + parseInt(doc.data().nights);
        }
      });
      return response.status(200).send(`${num}`);

      // firebaseDb
      //   .collection("reservations")
      //   .where("guestHouseName", "==", "jhonor")
      //   //        .where("checkInDate", ">=", "2019-09-01")
      //   //       .where("checkInDate", "<", "2019-10-01")
      //   .get()
      //   .then(function(snap) {
      //     console.log("snap", snap);
      //     snap.forEach(element => {
      //       console.log(element.data().nights);
      //     });
      //   });
    } catch (error) {
      console.log("error", error);
      return response.status(500).send(error);
    }
  }
);
