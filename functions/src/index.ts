import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { DateTime } from "luxon";
import * as req from "request";

const bookingStyleDate = (date: string) => {
  return DateTime.fromFormat(date, "ccc d MMM yyyy").toISODate();
};

const krwToString = (price: any) => {
  if (typeof price != "string") {
    return price;
  }
  return Number(price.replace(/[^0-9\.]+/g, ""));
};

const getDaysArray = (start: Date, end: Date) => {
  const arr: Array<Date> = [];
  const dt: Date = start;
  for (dt; dt <= end; dt.setDate(dt.getDate() + 1)) {
    arr.push(new Date(dt));
  }
  return arr.map(v => v.toISOString().slice(0, 10));
};

const paymentType = (payType: any) => {
  console.log("payType", payType);
  switch (payType) {
    case "사전 지불":
      return "prePaid";
    default:
      return payType;
  }
};

const agodaHotelType = (hotelId: any) => {
  console.log("hotelId", hotelId);
  switch (parseInt(hotelId)) {
    case 6887227:
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
    case 39032698:
      return "jhonor101A";
    case 39033097:
      return "jhonor101B";
    case 39033347:
      return "jhonor101C";
    case 39033981:
      return "jhonor101D";
    case 39099852:
      return "jhonor201A";
    case 38083180:
      return "jhonor201B";
    case 38090176:
      return "jhonor201C";
    case 37973180:
      return "jhonor201D";
    case 39101670:
      return "jhonor301A";
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
    case 38230566:
      return "jhonor302A";
    case 38230939:
      return "jhonor302B";
    case 38231192:
      return "jhonor302C";
    case 38231310:
      return "jhonor302D";
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
    case "2 Twin":
      return "jhonor101A";
    case "1 Double Bed 1 Single Bed Non Smoking":
      return "jhonor101B";
    case "1 Double 1 Single Beds Room":
      return "jhonor101C";
    case "1 Queen Bed":
      return "jhonor101D";
    case "Family Quad Room":
      return "jhonor201A";
    case "Twin Room (Private Bathroom)":
      return "jhonor201B";
    case "Double Room Private Bathroom":
      return "jhonor201C";
    case "Bunk Twin (Private Bathroom)":
      return "jhonor201D";
    case "Double shared bathroom":
      return "jhonor202A";
    case "Room with Bunk Bed and Shared Bathroom":
      return "jhonor202B";
    case "Budget Quadruple Room with Shared Bathroom":
      return "jhonor202C";
    case "Triple Room with Shared Bathroom":
      return "jhonor202D";
    case "Quad Room":
      return "jhonor301A";
    case "Double Or Twin Room Private Bathroom":
      return "jhonor301B";
    case "Deluxe Double Room With Private Bathroom":
      return "jhonor301C";
    case "Twin Room with Private Bathroom":
      return "jhonor301D";
    case "Standard Double Shared Bathroom":
      return "jhonor302A";
    case "Twin Room with Bunk Bed and Shared Bathroom":
      return "jhonor302B";
    case "Quadruple Room with Shared Bathroom":
      return "jhonor302C";
    case "Standard Triple Room With Shared Bathroom":
      return "jhonor302D";
    case "Family 1":
      return "jhonor302X";
    default:
      console.log("roomtypecode", roomTypeCode);
      return "agoda room name error";
  }
};
/*
const jhonorData = {
  jhonor101A: {
    beds: {
      single: 2
    },
    passcode: "5437*",
    wifi: "77777777"
  },
  jhonor101B: {
    beds: {
      single: 1,
      queen: 1
    },
    passcode: "2403*",
    wifi: "77777777"
  },
  jhonor101C: {
    beds: {
      single: 1,
      queen: 1
    },
    passcode: "3479*",
    wifi: "77777777"
  },
  jhonor101D: {
    beds: { queen: 1 },
    passcode: "9893*",
    wifi: "77777777"
  },
  jhonor201A: {
    beds: {
      single: 2,
      bunk: 1
    },
    passcode: "5216*",
    wifi: "77777777"
  },
  jhonor201B: {
    beds: {
      single: 2
    },
    passcode: "6593*",
    wifi: "77777777"
  },
  jhonor201C: {
    beds: {
      queen: 1
    },
    passcode: "1269*",
    wifi: "77777777"
  },
  jhonor201D: {
    beds: { bunk: 1 },
    passcode: "7508*",
    wifi: "77777777"
  },
  jhonor202A: {
    beds: {
      queen: 1
    },
    passcode: "2674*",
    wifi: "77777777"
  },
  jhonor202B: {
    beds: {
      bunk: 2
    },
    passcode: "8086*",
    wifi: "77777777"
  },
  jhonor202C: {
    beds: {
      single: 2,
      bunk: 1
    },
    passcode: "0359*",
    wifi: "77777777"
  },
  jhonor202D: {
    beds: { single: 1, bunk: 1 },
    passcode: "1410*",
    wifi: "77777777"
  },
  jhonor301A: {
    beds: {
      single: 2,
      bunk: 1
    },
    passcode: "5272*",
    wifi: "77777777"
  },
  jhonor301B: {
    beds: {
      single: 2
    },
    passcode: "8625*",
    wifi: "77777777"
  },
  jhonor301C: {
    beds: {
      queen: 1
    },
    passcode: "7505*",
    wifi: "77777777"
  },
  jhonor301D: {
    beds: { bunk: 1 },
    passcode: "0430*",
    wifi: "77777777"
  },
  jhonor302A: {
    beds: {
      queen: 1
    },
    passcode: "6236*",
    wifi: "77777777"
  },
  jhonor302B: {
    beds: {
      bunk: 2
    },
    passcode: "1774*",
    wifi: "77777777"
  },
  jhonor302C: {
    beds: {
      single: 2,
      bunk: 1
    },
    passcode: "3120*",
    wifi: "77777777"
  },
  jhonor302D: {
    beds: { single: 1, bunk: 1 },
    passcode: "0288*",
    wifi: "77777777"
  }
};
*/
admin.initializeApp();

const firebaseDb = admin.firestore();

export const newAirbnb = functions.https.onRequest(
  async (request, response) => {
    const data = request.body;
    const re = new RegExp("dmyk");
    const reSinsa = new RegExp("sinsa");
    //const reJhonor = new RegExp("jhonor");
    const isDmyk = re.test(airbnbRoom(data.listing.id));
    const isSinsa = reSinsa.test(airbnbRoom(data.listing.id));
    //const isJhonor = reJhonor.test(airbnbRoom(data.listing.id));

    const stayingDates = getDaysArray(
      new Date(data.start_date),
      new Date(data.end_date)
    );
    const uniqueId = "airbnb" + "-" + data.code;

    console.log(`Airbnb listing id: ${data.listing.id}`);
    console.log(`Airbnb room name: ${airbnbRoom(data.listing.id)}`);
    console.log("Airbnb status", data.status);
    console.log("Airbnb reservationCode", data.code);
    console.log("Airbnb data:", data);

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
            checkInTime: isSinsa ? 15 : 16,
            checkOutTime: isSinsa ? 11 : 10,
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

export const bookingJhonor = functions.https.onRequest(
  async (request, response) => {
    const data = request.body;

    const uniqueId = "booking" + "-" + data.reservationCode;
    console.log("Jhonor new booking reservation");
    console.log(`reservation id: ${uniqueId}, jhonor`);
    console.log(data.status === "Cancellation" ? "cancel" : "new");
    if (data.status === "Cancellation") {
      try {
        await firebaseDb
          .collection("reservations")
          .doc(uniqueId)
          .delete();

        return response.status(200).send("jhonor booking.com delete ok");
      } catch (error) {
        console.log("error", error);
        return response.status(500).send(error);
      }
    }

    try {
      const checkInDate = bookingStyleDate(data.checkInDate);
      const checkOutDate = bookingStyleDate(data.checkOutDate);
      const stayingDates = getDaysArray(
        new Date(checkInDate),
        new Date(checkOutDate)
      );
      await firebaseDb
        .collection("reservations")
        .doc(uniqueId)
        .set({
          platform: "booking",
          reservationCode: data.reservationCode,
          checkInDate: checkInDate,
          checkOutDate: checkOutDate,
          checkInTime: 16,
          checkOutTime: 10,
          nights: parseInt(data.nights),
          guests: parseInt(data.guests),
          guestName: data.guestName,
          stayingDates: stayingDates,
          roomNumber: data.roomNumber,
          phoneNumber: data.phoneNumber,
          price: krwToString(data.totalPrice).toString(),
          payoutPrice: (krwToString(data.totalPrice) * 0.85).toString(),
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
    const data = request.body;
    try {
      const querySnapshot = await firebaseDb
        .collection("reservations")
        .where("stayingDates", "array-contains", data.date)
        .get();
      let sum = 0;
      console.log("--------------------");
      querySnapshot.forEach(function(doc) {
        if (
          doc.data().checkOutDate !== data.date &&
          doc.data().guestHouseName === "jhonor"
        ) {
          console.log(doc.data().guestName);
          sum = sum + krwToString(doc.data().payoutPrice) / doc.data().nights;
        }
        console.log("sub", sum);
      });
      console.log(` ${sum}`);
      return response.status(200).send(`${sum}`);

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
export const calRevenue = functions.https.onRequest(
  async (request, response) => {
    const data = request.body;
    const dates = getDaysArray(
      new Date(data.startDate),
      new Date(data.endDate)
    );
    const promises: Promise<FirebaseFirestore.QuerySnapshot>[] = [];
    try {
      console.log("dates", dates);
      dates.forEach(date => {
        const p = firebaseDb
          .collection("reservations")
          .where("stayingDates", "array-contains", date)
          .get();
        promises.push(p);
      });
      const snapshots = await Promise.all(promises);
      let totalSum = 0;
      snapshots.forEach(function(snapshot, i) {
        let daySum = 0;
        snapshot.forEach(doc => {
          let roomSum = 0;
          if (
            doc.data().checkOutDate !== dates[i] &&
            doc.data().guestHouseName === "jhonor"
          ) {
            roomSum =
              roomSum + krwToString(doc.data().payoutPrice) / doc.data().nights;
            console.log(doc.data().guestName, roomSum);
          }
          daySum = daySum + roomSum;
        });
        totalSum = daySum + totalSum;
        console.log("total", totalSum);
      });
      return response.status(200).send(`${totalSum}`);
    } catch (error) {
      console.log("error", error);
      return response.status(500).send(error);
    }
  }
);

export const calFilledRoom = functions.https.onRequest(
  async (request, response) => {
    const data = request.body;
    const dates = getDaysArray(
      new Date(data.startDate),
      new Date(data.endDate)
    );
    const promises: Promise<FirebaseFirestore.QuerySnapshot>[] = [];
    try {
      console.log("dates", dates);
      dates.forEach(date => {
        const p = firebaseDb
          .collection("reservations")
          .where("stayingDates", "array-contains", date)
          .get();
        promises.push(p);
      });
      const snapshots = await Promise.all(promises);
      let totalSum = 0;
      snapshots.forEach(function(snapshot, i) {
        let daySum = 0;
        snapshot.forEach(doc => {
          let roomSum = 0;
          if (
            doc.data().checkOutDate !== dates[i] &&
            doc.data().guestHouseName === "jhonor"
          ) {
            roomSum =
              roomSum + (doc.data().roomNumber === "jhonor302X" ? 4 : 1);
            console.log(doc.data().guestName, roomSum);
          }
          daySum = daySum + roomSum;
        });
        totalSum = daySum + totalSum;
        console.log("total", totalSum);
      });
      return response.status(200).send(`${totalSum}`);
    } catch (error) {
      console.log("error", error);
      return response.status(500).send(error);
    }
  }
);
/*
export const numOfTowels = functions.https.onRequest(
  async (request, response) => {
    const data = request.body;
    function sumObjectsByKey(...objs) {
      return objs.reduce((a, b) => {
        for (let k in b) {
          if (b.hasOwnProperty(k))
            a[k] = (a[k] || 0) + b[k];
        }
        return a;
      }, {});
    }
    try {
        const p = firebaseDb
          .collection("reservations")
          .where("checkOutDate", ">=", data.startDate)
          .where("checkOutDate", "<=", data.endDate) 
          .get();
      const snap = await p
      const total = {bunk: 0, single: 0, queen: 0}
        snap.forEach(doc => {
          let roomNum = doc.data().roomNumber
         let a = {...total, ...jhonorData[roomNum].beds}

        })
      return response.status(200).send(`${totalSum}`);
    } catch (error) {
      console.log("error", error);
      return response.status(500).send(error);
    }
  }
);
*/

// new parseur parsing

export const parseurAgoda = functions.https.onRequest(
  async (request, response) => {
    const data = request.body;

    const reservationCode = data.reservationCode.replace(/[^0-9]/g, "");
    const uniqueId = "agoda" + "-" + reservationCode;
    console.log(uniqueId);
    console.log(data, data);

    if (data.status === "취소") {
      try {
        await firebaseDb
          .collection("reservations")
          .doc(uniqueId)
          .delete();

        return response.status(200).send("parseur agoda delete ok");
      } catch (error) {
        console.log("error", error);
        return response.status(500).send(error);
      }
    }

    const checkInDate = DateTime.fromFormat(
      data.checkInDate,
      "d-MM-yyyy"
    ).toISODate();
    const checkOutDate = DateTime.fromFormat(
      data.checkOutDate,
      "d-MM-yyyy"
    ).toISODate();
    const stayingDates = getDaysArray(
      new Date(checkInDate),
      new Date(checkOutDate)
    );

    const guests = data.guests.replace(/[^0-9]/g, ""); // extract number
    console.log("agoda parseur roomNumber", data.roomNumber);
    console.log(
      "agoda parseur roomNumber",
      data.roomNumber.replace(/[0-9]/g, "").trim()
    );

    let roomTypeCode = "";
    if (agodaHotelType(data.hotel) === "jhonor") {
      roomTypeCode = data.roomNumber.trim();
    } else {
      roomTypeCode = data.roomNumber.replace(/[0-9]/g, "").trim(); // extract number
    }
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
            guestName: `${data.firstName} ${data.lastName}`,
            stayingDates: stayingDates,
            roomNumber: agodaRoom(roomTypeCode),
            phoneNumber: phoneNumber,
            price: data.price,
            payoutPrice: data.payoutPrice,
            guestHouseName: agodaHotelType(data.hotel),
            parser: "parseur",
            paymentType: paymentType(data.paymentType),
            numberOfRoom: data.numberOfRoom || "n/a"
          });
        return response.status(200).send("new parseur agoda ok");
      }
    } catch (error) {
      console.log("error", error);
      return response.status(500).send(error);
    }

    console.log("no action parseur agoda");
    return response.status(200).send("ok");
  }
);

export const parseurTemplateNeeded = functions.https.onRequest(
  async (request, response) => {
    const data = request.body;
    console.log("data: ", data);

    try {
      return req.post(
        "https://hooks.slack.com/services/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",
        { json: { text: "🤟new template needed" } }
      );
    } catch (error) {
      console.log("error", error);
      return response.status(500).send(error);
    }
  }
);

export const parseurBooking = functions.https.onRequest(
  async (request, response) => {
    const data = request.body;

    const uniqueId = "booking" + "-" + data.reservationCode;
    console.log("Jhonor new booking reservation");
    console.log(`reservation id: ${uniqueId}, jhonor`);
    console.log(data.status);
    if (data.status === "Cancellation") {
      try {
        await firebaseDb
          .collection("reservations")
          .doc(uniqueId)
          .delete();

        return response.status(200).send("jhonor booking.com delete ok");
      } catch (error) {
        console.log("error", error);
        return response.status(500).send(error);
      }
    }

    try {
      const checkInDate = bookingStyleDate(data.checkInDate);
      const checkOutDate = bookingStyleDate(data.checkOutDate);
      const stayingDates = getDaysArray(
        new Date(checkInDate),
        new Date(checkOutDate)
      );
      await firebaseDb
        .collection("reservations")
        .doc(uniqueId)
        .set({
          platform: "booking",
          reservationCode: data.reservationCode,
          checkInDate: checkInDate,
          checkOutDate: checkOutDate,
          checkInTime: 16,
          checkOutTime: 10,
          nights: parseInt(data.nights),
          guests: parseInt(data.guests),
          guestName: data.fullName,
          stayingDates: stayingDates,
          roomNumber: `jhonor${data.roomNumber}`,
          phoneNumber: data.phoneNumber,
          price: krwToString(data.price).toString(),
          payoutPrice: (krwToString(data.price) * 0.85).toString(),
          guestHouseName: "jhonor",
          parser: "parseur",
          paymentType: paymentType(data.paymentType),
          numberOfRoom: data.numberOfRoom || "n/a"
        });
      return response.status(200).send("new booking ok");
    } catch (error) {
      console.log("error", error);
      return response.status(500).send(error);
    }
  }
);
