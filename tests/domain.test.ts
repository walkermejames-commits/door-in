import assert from "node:assert/strict";
import test from "node:test";
import { calculateShoppingPrice, canTransition, createOrderSchema } from "../src/lib/domain";

test("shopping price preserves basket, markup and delivery economics", () => {
  const price = calculateShoppingPrice(2500, 2, true);
  assert.equal(price.goodsMarkup?.amountPence, 500);
  assert.equal(price.customerTotal.amountPence, 3799);
});

test("collection orders cannot enter shopping-only workflow states", () => {
  assert.equal(canTransition("paid", "float_reserved", "collection_delivery"), false);
  assert.equal(canTransition("paid", "ready_for_dispatch", "collection_delivery"), true);
});

test("shopping requests accept a missing item size", () => {
  const result = createOrderSchema.safeParse({
    serviceType: "shop_and_deliver",
    customerName: "James Walker",
    customerEmail: "james@example.com",
    pickupPostcode: "TN1 1AA",
    deliveryPostcode: "TN4 8AB",
    distanceMiles: "3",
    itemSize: null,
    basketRrpPence: 1500,
    restrictedItems: false,
  });

  assert.equal(result.success, true);
});

test("collection requests still require an item size", () => {
  const result = createOrderSchema.safeParse({
    serviceType: "collection_delivery",
    customerName: "James Walker",
    customerEmail: "james@example.com",
    pickupPostcode: "TN1 1AA",
    deliveryPostcode: "TN4 8AB",
    distanceMiles: 3,
    restrictedItems: false,
  });

  assert.equal(result.success, false);
});
