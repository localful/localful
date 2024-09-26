import { test, describe, afterAll, beforeAll, beforeEach, expect } from "vitest"

import {TestHelper} from "@testing/test-helper.js";
import {testAdminUser1, testUser1} from "@testing/data/users.js";
import {expectForbidden} from "@testing/common/expect-forbidden.js";
import {expectUnauthorized} from "@testing/common/expect-unauthorized.js";
import {testInvalidDataTypes} from "@testing/common/test-invalid-data-types.js";
import {testMalformedData} from "@testing/common/test-malformed-data.js";

const testHelper = new TestHelper();
beforeAll(async () => {
  await testHelper.beforeAll();
});
afterAll(async () => {
  await testHelper.afterAll()
});
beforeEach(async () => {
  await testHelper.beforeEach()
});

describe("Update Settings - /v1/server/settings [PATCH]", () => {

  // Testing success cases/happy paths work.
  describe("Success Cases", () => {
    test("When authorized as admin, the settings should be updated", async () => {
      const accessToken = await testHelper.getUserAccessToken(testAdminUser1.id);

      // Disable registration and check that change has been made
      const {body: disabledBody, statusCode: disabledStatusCode} = await testHelper.client
        .patch("/v1/server/settings")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          registrationEnabled: false,
        });
      expect(disabledStatusCode).toEqual(200);
      expect(disabledBody).toEqual(expect.objectContaining({
        registrationEnabled: false,
        createdAt: expect.any(String),
      }))

      // Enable registration again and check that change has been made
      const {body: enabledBody, statusCode: enabledStatusCode} = await testHelper.client
          .patch("/v1/server/settings")
          .set("Authorization", `Bearer ${accessToken}`)
          .send({
            registrationEnabled: true,
          });
      expect(enabledStatusCode).toEqual(200);
      expect(enabledBody).toEqual(expect.objectContaining({
        registrationEnabled: true,
        createdAt: expect.any(String),
      }))
    });
  })

  // Testing auth & permissions work.
  describe("Invalid Authentication", () => {
    test("When authorized as regular user, the request should be forbidden", async () => {
      const accessToken = await testHelper.getUserAccessToken(testUser1.id);

      const {body, statusCode} = await testHelper.client
          .patch("/v1/server/settings")
          .set("Authorization", `Bearer ${accessToken}`)
          .send({
            registrationEnabled: true,
          });

      expectForbidden(body, statusCode)
    });

    test("When unauthorized, the request should be unauthorized", async () => {
      const {body, statusCode} = await testHelper.client
          .patch("/v1/server/settings")
          .send({
            registrationEnabled: true,
          });

      expectUnauthorized(body, statusCode)
    });
  })

  // Data validation (required fields, invalid data types, unique constraints, malformed data etc).
  describe("Data Validation", () => {
    describe("When not supplying registrationEnabled as boolean, the request should fail", async () => {
      testInvalidDataTypes({
        testHelper: testHelper,
        req: {
          clientMethod: "patch",
          endpoint: "/v1/server/settings",
          initialData: {registrationEnabled: true},
        },
        auth: {
          userId: testAdminUser1.id
        },
        testFieldKey: "registrationEnabled",
        testCases: [1, 1.5, "testing", null, undefined, {test: "yes"}, [1, 2]]
      })
    })

    test("When supplying invalid JSON data, the request should fail", async () => {
      const accessToken = await testHelper.getUserAccessToken(testAdminUser1.id);

      await testMalformedData({
        clientFunction: testHelper.client.patch.bind(testHelper.client),
        accessToken: accessToken,
        endpoint: "/v1/server/settings"
      })
    })
  })
})
