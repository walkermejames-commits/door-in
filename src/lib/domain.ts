import { z } from "zod";

export const serviceTypes = ["collection_delivery", "shop_and_deliver"] as const;
export type ServiceType = (typeof serviceTypes)[number];

export const orderStatuses = [
  "draft",
  "quote_ready",
  "awaiting_payment",
  "paid",
  "float_reserved",
  "shopping",
  "ready_for_dispatch",
  "driver_assigned",
  "driver_arrived_at_pickup",
  "item_collected",
  "driver_en_route_to_delivery",
  "driver_arrived_at_delivery",
  "delivery_verified",
  "completed",
  "cancelled",
  "disputed",
  "refunded",
] as const;
export type OrderStatus = (typeof orderStatuses)[number];

export type Money = { amountPence: number; currency: "GBP" };

export type Order = {
  id: string;
  serviceType: ServiceType;
  customerName: string;
  customerEmail: string;
  pickupPostcode: string;
  deliveryPostcode: string;
  status: OrderStatus;
  createdAt: string;
  price: PriceBreakdown;
  floatStatus?: "not_required" | "reserved" | "blocked" | "released";
};

export type PriceBreakdown = {
  customerTotal: Money;
  delivery: Money;
  platformFee: Money;
  goodsRrp?: Money;
  goodsMarkup?: Money;
  driverPayoutEstimate?: Money;
};

const itemSizeSchema = z.preprocess(
  (value) => value === null || value === "" ? undefined : value,
  z.enum(["small", "medium", "large", "furniture", "van_load"]).optional(),
);

export const createOrderSchema = z.object({
  serviceType: z.enum(serviceTypes),
  customerName: z.string().trim().min(2).max(120),
  customerEmail: z.string().email(),
  pickupPostcode: z.string().trim().min(3).max(12),
  deliveryPostcode: z.string().trim().min(3).max(12),
  distanceMiles: z.coerce.number().min(0).max(100).default(3),
  itemSize: itemSizeSchema,
  basketRrpPence: z.coerce.number().int().min(0).max(100000).optional(),
  restrictedItems: z.boolean().default(false),
}).superRefine((order, context) => {
  if (order.serviceType === "collection_delivery" && !order.itemSize) {
    context.addIssue({ code: "custom", path: ["itemSize"], message: "Choose an item size." });
  }
  if (order.serviceType === "shop_and_deliver" && order.basketRrpPence === undefined) {
    context.addIssue({ code: "custom", path: ["basketRrpPence"], message: "Enter a rough basket value." });
  }
});
export type CreateOrderInput = z.infer<typeof createOrderSchema>;

const terminalStatuses = new Set<OrderStatus>(["completed", "cancelled", "disputed", "refunded"]);
const commonTransitions: Partial<Record<OrderStatus, OrderStatus[]>> = {
  draft: ["quote_ready", "cancelled"],
  quote_ready: ["awaiting_payment", "cancelled"],
  awaiting_payment: ["paid", "cancelled"],
  paid: ["ready_for_dispatch", "float_reserved", "cancelled", "refunded"],
  ready_for_dispatch: ["driver_assigned", "cancelled", "refunded"],
  driver_assigned: ["driver_arrived_at_pickup", "cancelled", "disputed"],
  driver_arrived_at_pickup: ["item_collected", "disputed"],
  item_collected: ["driver_en_route_to_delivery", "disputed"],
  driver_en_route_to_delivery: ["driver_arrived_at_delivery", "disputed"],
  driver_arrived_at_delivery: ["delivery_verified", "disputed"],
  delivery_verified: ["completed", "disputed"],
  float_reserved: ["shopping", "cancelled", "refunded"],
  shopping: ["ready_for_dispatch", "cancelled", "disputed"],
};

export function canTransition(from: OrderStatus, to: OrderStatus, serviceType: ServiceType) {
  if (terminalStatuses.has(from)) return false;
  if (serviceType === "collection_delivery" && ["float_reserved", "shopping"].includes(to)) return false;
  return commonTransitions[from]?.includes(to) ?? false;
}

const pence = (amountPence: number): Money => ({ amountPence: Math.round(amountPence), currency: "GBP" });

export function calculateCollectionPrice(distanceMiles: number, itemSize = "small"): PriceBreakdown {
  const base = { small: 1000, medium: 1600, large: 3200, furniture: 4500, van_load: 5500 }[itemSize] ?? 1000;
  const deliveryPence = Math.max(base, base + Math.max(0, distanceMiles - 3) * 145);
  const platformFeePence = Math.max(150, Math.round(deliveryPence * 0.1));
  const total = deliveryPence + platformFeePence;
  return {
    customerTotal: pence(total),
    delivery: pence(deliveryPence),
    platformFee: pence(platformFeePence),
    driverPayoutEstimate: pence(Math.round(deliveryPence * 0.78)),
  };
}

export function calculateShoppingPrice(basketRrpPence: number, distanceMiles: number, restrictedItems = false): PriceBreakdown {
  const goodsMarkupPence = Math.round(basketRrpPence * 0.2);
  const deliveryPence = distanceMiles <= 5 ? 599 : 899;
  const restrictedFeePence = restrictedItems ? 200 : 0;
  const total = basketRrpPence + goodsMarkupPence + deliveryPence + restrictedFeePence;
  return {
    customerTotal: pence(total),
    goodsRrp: pence(basketRrpPence),
    goodsMarkup: pence(goodsMarkupPence),
    delivery: pence(deliveryPence + restrictedFeePence),
    platformFee: pence(goodsMarkupPence + restrictedFeePence),
    driverPayoutEstimate: pence(Math.round(deliveryPence * 0.78)),
  };
}

export function formatMoney(value: Money) {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: value.currency }).format(value.amountPence / 100);
}
