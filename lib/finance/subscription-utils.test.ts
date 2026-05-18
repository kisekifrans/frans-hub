import assert from "node:assert/strict";
import {
  billingCountdownLabel,
  daysUntilBilling,
  isSubscriptionOverdue,
} from "./subscription-utils";
import type { FinanceSubscription } from "./types";

const sub: FinanceSubscription = {
  id: "1",
  name: "Spotify",
  amount: 50000,
  currency: "IDR",
  billingCycle: "monthly",
  nextPaymentDate: "2099-01-01",
  autoRenew: true,
  active: true,
};

assert.ok(daysUntilBilling(sub.nextPaymentDate) > 0);
assert.equal(isSubscriptionOverdue(sub), false);

const overdue: FinanceSubscription = {
  ...sub,
  nextPaymentDate: "2020-01-01",
};
assert.equal(isSubscriptionOverdue(overdue), true);
assert.ok(billingCountdownLabel(overdue).includes("overdue"));

console.log("subscription-utils tests passed");
