import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import dotenv from "dotenv";
import mongoose from "mongoose";
import PartnerApplication from "../models/PartnerApplication.js";
import User from "../models/User.js";
import { connectDB } from "../config/db.js";

dotenv.config();

export const hotelPartnerAccounts = [
  {
    passwordKey: "JP_HILLS",
    businessName: "Hotel JP Hills",
    email: "jphills@gmail.com",
    phone: "7892134450",
    destination: "Rishikesh",
    city: "Rishikesh",
    state: "Uttarakhand",
    address:
      "Badrinath Marg, Opposite Nainital Bank, Tapovan, Rishikesh, Uttarakhand – 249192, India.",
    description:
      "A peaceful riverside stay designed for early morning yoga, quiet evenings, and mountain-view breaks.",
  },
  {
    passwordKey: "KAVITA_INN",
    businessName: "Hotel Kavita Inn",
    email: "hotelkavitainn@gmail.com",
    phone: "7890023458",
    destination: "Ujjain",
    city: "Ujjain",
    state: "Madhya Pradesh",
    address:
      "164/2, Opposite Mahakal Mandir, Mahakal Road, Ujjain, Madhya Pradesh – 456006, India.",
    description:
      "A modern, comfortable stay near Mahakal Mandir for pilgrims and families visiting Ujjain.",
  },
  {
    passwordKey: "OBEROI_CEIL",
    businessName: "The Oberoi Ceil",
    email: "oberoiceil@gmail.com",
    phone: "9082345566",
    destination: "Shimla",
    city: "Shimla",
    state: "Himachal Pradesh",
    address: "Near Mall Road, Upper Mall, Shimla, Himachal Pradesh – 171001, India.",
    description:
      "A welcoming mountain stay with convenient access to Shimla's historic Mall Road and Ridge.",
  },
  {
    passwordKey: "ATLAS_PALACE",
    businessName: "Hotel Atlas Palace",
    email: "hotelatlaspalace@gmail.com",
    phone: "7000832911",
    destination: "Ujjain",
    city: "Ujjain",
    state: "Madhya Pradesh",
    address: "No. 2, 4, Nazar Ali Marg, Malipura, Ujjain, Madhya Pradesh – 456001, India.",
    description:
      "A centrally located Ujjain stay for visitors to Mahakaleshwar Temple and the surrounding city.",
  },
  {
    passwordKey: "SNOW_VALLEY",
    businessName: "Snow Valley Heights",
    email: "snowvalleyheights@gmail.com",
    phone: "9023488331",
    destination: "Shimla",
    city: "Shimla",
    state: "Himachal Pradesh",
    address: "Ghora Chowki, Shimla, Himachal Pradesh – 171004, India.",
    description: "A welcoming mountain stay with cedar views and convenient access to Shimla.",
  },
  {
    passwordKey: "HOTEL_VALLEY",
    businessName: "The Hotel Valley",
    email: "hotelvalley@gmail.com",
    phone: "9317888220",
    destination: "Shimla",
    city: "Shimla",
    state: "Himachal Pradesh",
    address: "Opposite Tourism Lift, The Mall, Shimla, Himachal Pradesh – 171001, India.",
    description: "A comfortable Shimla stay near The Mall and the Tourism Lift.",
  },
  {
    passwordKey: "YOG_NIKETAN",
    businessName: "Yog Niketan by Sanskriti",
    email: "yogniketan@gmail.com",
    phone: "9023441567",
    destination: "Rishikesh",
    city: "Rishikesh",
    state: "Uttarakhand",
    address:
      "Parking, NH52, Badrinath Marg, Near Ram Jhula, Ganga Vatika, Rishikesh, Uttarakhand – 249192, India.",
    description:
      "A peaceful riverside retreat for quiet mornings, yoga sessions, and easy visits to Rishikesh's ghats and suspension bridges.",
  },
];

const createListing = (hotel) => ({
  name: hotel.businessName,
  type: "Hotel",
  destination: hotel.destination,
  description: hotel.description,
  active: true,
  images: [],
  city: hotel.city,
  state: hotel.state,
  address: hotel.address,
  price: null,
  priceLabel: "Contact for price",
  amenities: [],
  contactPhone: hotel.phone,
  contactEmail: hotel.email,
});

const hasMatchingApplication = (application, hotel) =>
  application.businessName.trim().toLowerCase() === hotel.businessName.toLowerCase() &&
  application.businessType === "Hotel" &&
  application.destination === hotel.destination;

export async function provisionHotelPartners({
  UserModel = User,
  PartnerApplicationModel = PartnerApplication,
  passwords = process.env,
  log = console.log,
} = {}) {
  const preparedHotels = await Promise.all(
    hotelPartnerAccounts.map(async (hotel) => {
      const email = hotel.email.toLowerCase();
      const user = await UserModel.findOne({ email });
      const application = user
        ? await PartnerApplicationModel.findOne({ ownerId: user._id })
        : null;

      if (application && !hasMatchingApplication(application, hotel)) {
        throw new Error(
          `The existing partner application for ${email} does not match ${hotel.businessName}.`,
        );
      }
      if (user && !application && (user.plan !== "Partner" || user.name !== hotel.businessName)) {
        throw new Error(
          `An unrelated account already uses ${email}; review it before provisioning this hotel.`,
        );
      }

      const password = passwords[`HOTEL_PARTNER_PASSWORD_${hotel.passwordKey}`];
      if (!user && (typeof password !== "string" || password.length < 8)) {
        throw new Error(
          `Set HOTEL_PARTNER_PASSWORD_${hotel.passwordKey} to an initial password of at least 8 characters.`,
        );
      }

      return { hotel, email, password, user, application };
    }),
  );

  for (const entry of preparedHotels) {
    const { hotel, email } = entry;
    let { user, application } = entry;

    if (!user) {
      user = await UserModel.create({
        name: hotel.businessName,
        email,
        password: entry.password,
        plan: "Partner",
      });
    }

    const listingData = createListing(hotel);
    if (!application) {
      application = await PartnerApplicationModel.create({
        ownerId: user._id,
        businessName: hotel.businessName,
        ownerName: hotel.businessName,
        ownerEmail: email,
        phone: hotel.phone,
        address: hotel.address,
        city: hotel.city,
        state: hotel.state,
        businessType: "Hotel",
        destination: hotel.destination,
        description: hotel.description,
        status: "approved",
        reviewedAt: new Date(),
        reviewedBy: "hotel-provisioning",
        listings: [listingData],
      });
    } else {
      Object.assign(application, {
        businessName: hotel.businessName,
        ownerName: hotel.businessName,
        ownerEmail: email,
        phone: hotel.phone,
        address: hotel.address,
        city: hotel.city,
        state: hotel.state,
        businessType: "Hotel",
        destination: hotel.destination,
        description: hotel.description,
        status: "approved",
        reviewedAt: application.reviewedAt ?? new Date(),
        reviewedBy: application.reviewedBy ?? "hotel-provisioning",
      });

      const listing = application.listings.find(
        (candidate) =>
          candidate.name.trim().toLowerCase() === hotel.businessName.toLowerCase() &&
          candidate.type === "Hotel" &&
          candidate.destination === hotel.destination,
      );
      if (listing) {
        Object.assign(listing, {
          name: listingData.name,
          type: listingData.type,
          destination: listingData.destination,
          description: listingData.description,
          active: true,
          city: listingData.city,
          state: listingData.state,
          address: listingData.address,
          contactPhone: listingData.contactPhone,
          contactEmail: listingData.contactEmail,
        });
      } else {
        application.listings.push(listingData);
      }
      await application.save();
    }

    log(`Provisioned approved hotel partner: ${email}`);
  }

  return preparedHotels.map(({ email }) => email);
}

const runProvisioning = async () => {
  try {
    await connectDB();
    await provisionHotelPartners();
  } catch (error) {
    console.error("Hotel partner provisioning failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  await runProvisioning();
}
