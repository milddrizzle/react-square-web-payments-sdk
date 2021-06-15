// Vendor Modules
import { MethodType, Payments } from '@square/web-payments-sdk-types';

export type Methods = keyof { [M in keyof typeof MethodType as `${typeof MethodType[M]}`]: M };

export type ActionMethodReducer = {
  type: "CHANGE_STATE",
  payload: Record<MethodType, "loading" | "ready" | "unavailable">[]
}

export type MethodsSupported = {
  ach?: boolean
  applePay?: boolean
  card?: boolean
  cashApp?: boolean
  googlePay?: boolean
  giftCard?: boolean
}

export type InitialStateMethods = Record<"ach" | "applePay" | "card" | "cashApp" | "googlePay" | "giftCard", "loading" | "ready" | "unavailable">

export interface FormContextInterface extends InitialStateMethods {
  /** Unique form ID */
  formId?: string;
  payments?: Payments
  dispatchMethods: React.Dispatch<ActionMethodReducer>
}