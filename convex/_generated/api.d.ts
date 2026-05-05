/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as admin from "../admin.js";
import type * as auth from "../auth.js";
import type * as cleanup from "../cleanup.js";
import type * as guests from "../guests.js";
import type * as http from "../http.js";
import type * as migration from "../migration.js";
import type * as monitoring from "../monitoring.js";
import type * as notifications from "../notifications.js";
import type * as reports from "../reports.js";
import type * as residents from "../residents.js";
import type * as seed from "../seed.js";
import type * as simpleAuth from "../simpleAuth.js";
import type * as subscriptions from "../subscriptions.js";
import type * as userManagement from "../userManagement.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  admin: typeof admin;
  auth: typeof auth;
  cleanup: typeof cleanup;
  guests: typeof guests;
  http: typeof http;
  migration: typeof migration;
  monitoring: typeof monitoring;
  notifications: typeof notifications;
  reports: typeof reports;
  residents: typeof residents;
  seed: typeof seed;
  simpleAuth: typeof simpleAuth;
  subscriptions: typeof subscriptions;
  userManagement: typeof userManagement;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
