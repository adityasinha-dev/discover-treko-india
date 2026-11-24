import assert from "node:assert/strict";
import test from "node:test";
import { hotelPartnerAccounts, provisionHotelPartners } from "../scripts/provisionHotelPartners.js";

function createPartnerModels() {
  const users = [];
  const applications = [];
  let nextId = 0;

  const UserModel = {
    async findOne({ email }) {
      return users.find((user) => user.email === email) ?? null;
    },
    async create(userData) {
      const user = { ...userData, _id: `user-${++nextId}` };
      users.push(user);
      return user;
    },
  };
  const PartnerApplicationModel = {
    async findOne({ ownerId }) {
      return applications.find((application) => application.ownerId === ownerId) ?? null;
    },
    async create(applicationData) {
      const application = {
        ...applicationData,
        _id: `application-${++nextId}`,
        listings: applicationData.listings.map((listing) => ({ ...listing })),
        async save() {},
      };
      applications.push(application);
      return application;
    },
  };

  return { users, applications, UserModel, PartnerApplicationModel };
}

const initialPasswords = Object.fromEntries(
  hotelPartnerAccounts.map((hotel) => [
    `HOTEL_PARTNER_PASSWORD_${hotel.passwordKey}`,
    "test-password",
  ]),
);

test("provisions approved hotel partners and reruns without duplicate listings or password changes", async () => {
  const { users, applications, UserModel, PartnerApplicationModel } = createPartnerModels();
  const options = {
    UserModel,
    PartnerApplicationModel,
    passwords: initialPasswords,
    log: () => {},
  };

  const provisionedEmails = await provisionHotelPartners(options);
  const originalPasswords = users.map((user) => user.password);
  await provisionHotelPartners({
    ...options,
    passwords: {},
  });

  assert.equal(provisionedEmails.length, hotelPartnerAccounts.length);
  assert.equal(users.length, hotelPartnerAccounts.length);
  assert.equal(applications.length, hotelPartnerAccounts.length);
  assert.deepEqual(
    users.map((user) => user.password),
    originalPasswords,
  );
  for (const hotel of hotelPartnerAccounts) {
    const application = applications.find((candidate) => candidate.ownerEmail === hotel.email);
    assert.equal(application.status, "approved");
    assert.equal(application.listings.length, 1);
    assert.equal(application.listings[0].address, hotel.address);
    assert.equal(application.listings[0].contactPhone, hotel.phone);
    assert.equal(application.listings[0].contactEmail, hotel.email);
  }
});

test("requires an initial password before creating any hotel accounts", async () => {
  const { users, UserModel, PartnerApplicationModel } = createPartnerModels();

  await assert.rejects(
    provisionHotelPartners({
      UserModel,
      PartnerApplicationModel,
      passwords: {},
      log: () => {},
    }),
    /Set HOTEL_PARTNER_PASSWORD_/,
  );
  assert.equal(users.length, 0);
});

test("does not claim an unrelated existing account", async () => {
  const { users, UserModel, PartnerApplicationModel } = createPartnerModels();
  users.push({
    _id: "existing-user",
    name: "Different account",
    email: hotelPartnerAccounts[0].email,
    plan: "Free",
  });

  await assert.rejects(
    provisionHotelPartners({
      UserModel,
      PartnerApplicationModel,
      passwords: initialPasswords,
      log: () => {},
    }),
    /review it before provisioning this hotel/,
  );
  assert.equal(users.length, 1);
});
