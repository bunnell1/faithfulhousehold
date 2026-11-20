export type Goals = {
  firstFruits: boolean;
  oneMonth: boolean;
  namedDebt: boolean;
};

export type HouseholdInput = {
  income: number;
  givingRate: number;
  reserveRate: number;
  debtBalance: number;
  debtPayment: number;
  emergencySaved: number;
};

export type HouseholdState = HouseholdInput & {
  source: "example" | "yours";
  goals: Goals;
};

export type MonthPlan = {
  giving: number;
  debtPay: number;
  debtShort: number;
  reserve: number;
  reserveShort: number;
  living: number;
};

export type Step = {
  title: string;
  body: string;
  verse: string;
  ref: string;
};

const emptyGoals: Goals = {
  firstFruits: false,
  oneMonth: false,
  namedDebt: false,
};

export const EXAMPLE: HouseholdState = {
  source: "example",
  income: 5800,
  givingRate: 0.1,
  reserveRate: 0.08,
  debtBalance: 12400,
  debtPayment: 280,
  emergencySaved: 900,
  goals: emptyGoals,
};

export const BLANK: HouseholdState = {
  source: "yours",
  income: 0,
  givingRate: 0.1,
  reserveRate: 0.1,
  debtBalance: 0,
  debtPayment: 0,
  emergencySaved: 0,
  goals: emptyGoals,
};

function nonNegative(value: number): number {
  if (!Number.isFinite(value) || value <= 0) return 0;
  return Math.min(1_000_000, Math.round(value));
}

export function clampInput(raw: HouseholdInput): HouseholdInput {
  return {
    income: nonNegative(raw.income),
    givingRate: Math.min(0.2, Math.max(0, Number.isFinite(raw.givingRate) ? raw.givingRate : 0)),
    reserveRate: Math.min(0.3, Math.max(0, Number.isFinite(raw.reserveRate) ? raw.reserveRate : 0)),
    debtBalance: nonNegative(raw.debtBalance),
    debtPayment: nonNegative(raw.debtPayment),
    emergencySaved: nonNegative(raw.emergencySaved),
  };
}

export function buildPlan(input: HouseholdInput): MonthPlan {
  const household = clampInput(input);
  let left = household.income;

  const giving = Math.min(Math.round(household.income * household.givingRate), left);
  left -= giving;

  const debtWant = household.debtBalance > 0 ? household.debtPayment : 0;
  const debtPay = Math.min(debtWant, left);
  left -= debtPay;

  const reserveWant = Math.round(household.income * household.reserveRate);
  const reserve = Math.min(reserveWant, left);
  left -= reserve;

  return {
    giving,
    debtPay,
    debtShort: debtWant - debtPay,
    reserve,
    reserveShort: reserveWant - reserve,
    living: left,
  };
}

const moneyFormat = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export function money(value: number): string {
  return moneyFormat.format(Math.round(value));
}

export function percentLabel(rate: number): string {
  return `${Math.round(rate * 100)}%`;
}

export function isHouseholdState(value: unknown): value is HouseholdState {
  if (!value || typeof value !== "object") return false;
  const row = value as HouseholdState;
  return (
    (row.source === "example" || row.source === "yours") &&
    typeof row.income === "number" &&
    typeof row.givingRate === "number" &&
    typeof row.reserveRate === "number" &&
    typeof row.debtBalance === "number" &&
    typeof row.debtPayment === "number" &&
    typeof row.emergencySaved === "number" &&
    !!row.goals &&
    typeof row.goals.firstFruits === "boolean" &&
    typeof row.goals.oneMonth === "boolean" &&
    typeof row.goals.namedDebt === "boolean"
  );
}

export function nextStep(input: HouseholdInput, plan: MonthPlan): Step {
  const household = clampInput(input);

  if (household.income <= 0) {
    return {
      title: "Know what came in",
      body: "Enter this month’s take-home. The order only means something when it is working with a real number.",
      verse: "Be thou diligent to know the state of thy flocks, and look well to thy herds.",
      ref: "Proverbs 27:23",
    };
  }

  if (household.givingRate <= 0) {
    return {
      title: "Set first fruits apart",
      body: "Before a reserve or a lifestyle, name an amount to give — even a small one. The month starts there.",
      verse: "Honour the LORD with thy substance, and with the firstfruits of all thine increase.",
      ref: "Proverbs 3:9",
    };
  }

  if (household.debtBalance > 0 && household.debtPayment <= 0) {
    return {
      title: "Name what is due",
      body: "A balance without a payment is only a worry. Enter what must go out this month so the rest of the plan can make room for it.",
      verse: "The borrower is servant to the lender.",
      ref: "Proverbs 22:7",
    };
  }

  if (plan.debtShort > 0) {
    return {
      title: "Make room for what is owed",
      body: "Giving is set aside, and the payment you entered does not fit in what is left. Lower the reserve until the payment fits. Do not plan a lifestyle that ignores it.",
      verse: "The borrower is servant to the lender.",
      ref: "Proverbs 22:7",
    };
  }

  const heavyDebt = household.debtBalance > household.income * 4;
  if (!heavyDebt && plan.living > 0 && household.emergencySaved < plan.living) {
    return {
      title: "One month, set aside",
      body: `Giving is first, and the payment fits. Next, grow what is already set aside (${money(household.emergencySaved)}) toward one month of living costs (${money(plan.living)}). That is margin for the household, not a pile for its own sake.`,
      verse: "There is treasure to be desired and oil in the dwelling of the wise; but a foolish man spendeth it up.",
      ref: "Proverbs 21:20",
    };
  }

  if (heavyDebt && household.reserveRate > 0.05) {
    return {
      title: "Send the margin to the debt",
      body: "The balance is large next to this month’s income. Keep a modest cushion, and aim extra reserve at the debt you named until it is smaller.",
      verse: "The borrower is servant to the lender.",
      ref: "Proverbs 22:7",
    };
  }

  if (household.givingRate < 0.1 && plan.living > household.income * 0.6) {
    return {
      title: "Look at the gift before lifestyle grows",
      body: "Living still takes most of the month. A tenth is a long-used starting point for giving, not a tax this tool collects. If you can choose it freely, move giving toward it before the remainder quietly expands.",
      verse: "Every man according as he purposeth in his heart, so let him give; not grudgingly, or of necessity: for God loveth a cheerful giver.",
      ref: "2 Corinthians 9:7",
    };
  }

  return {
    title: "Stay inside what remains",
    body: "The order is holding: giving, what is owed, and a reserve. The faithful work now is to live on what is left — and not invent new needs for it.",
    verse: "But godliness with contentment is great gain.",
    ref: "1 Timothy 6:6",
  };
}
