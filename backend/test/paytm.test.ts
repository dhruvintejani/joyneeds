import test from "node:test";
import assert from "node:assert/strict";
import { parsePaytmAmount, paymentMatchesOrder } from "../src/services/paytmClient.js";
test("Paytm amounts are parsed without floating-point rounding", () => {
  assert.equal(parsePaytmAmount("1.00"), 100);
  assert.equal(parsePaytmAmount("100.5"), 10050);
  assert.equal(parsePaytmAmount("0.01"), 1);
  for (const invalid of ["-1.00", "0.001", "NaN", "Infinity", "10e4", "", 100, " 10.00"]) {
    assert.equal(parsePaytmAmount(invalid), null);
  }
});
test("Paytm success requires matching merchant, order, exact amount and transaction", () => {
  const order = { mid: "testMID", orderId: "JN-20261122-0A1B2C3D", amountPaise: 12345 };
  const success = { resultInfo: { resultStatus: "TXN_SUCCESS" }, mid: "testMID", orderId: order.orderId, txnAmount: "123.45", txnId: "provider-1" };
  assert.equal(paymentMatchesOrder(success, order), true);
  assert.equal(paymentMatchesOrder({ ...success, txnAmount: "123.46" }, order), false);
  assert.equal(paymentMatchesOrder({ ...success, mid: "otherMID" }, order), false);
  assert.equal(paymentMatchesOrder({ ...success, orderId: "different" }, order), false);
  assert.equal(paymentMatchesOrder({ ...success, txnId: "" }, order), false);
  assert.equal(paymentMatchesOrder({ ...success, resultInfo: { resultStatus: "PENDING" } }, order), false);
});
