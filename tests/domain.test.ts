import assert from "node:assert/strict";
import test from "node:test";
import { calculateShoppingPrice, canTransition } from "../src/lib/domain";

test("shopping price preserves basket, markup and delivery economics", () => {
  const price = calculateShoppingPrice(2500, 2, true);
  assert.equal(price.goodsMarkup?.amountPence, 500);
  assert.equal(price.customerTotal.amountPence, 3799);
});

test("collection orders cannot enter shopping-only workflow states", () => {
  assert.equal(canTransition("paid", "float_reserved", "collection_delivery"), false);
  assert.equal(canTransition("paid", "ready_for_dispatch", "collection_delivery"), true);
});
