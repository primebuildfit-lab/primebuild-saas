import "@shopify/shopify-app-react-router/adapters/node";
import {
  ApiVersion,
  AppDistribution,
  shopifyApp,
} from "@shopify/shopify-app-react-router/server";
import { PrismaSessionStorage } from "@shopify/shopify-app-session-storage-prisma";
import prisma from "./db.server";

// In non-production (local dev / MM5 preview) fall back to placeholder credentials
// so the app can BOOT without Shopify secrets for labeled preview inspection. These
// placeholders cannot authenticate anything real, and the preview loader skips
// `authenticate.admin` entirely. In production, missing secrets still fail loudly.
const isProd = process.env.NODE_ENV === "production";
const PLACEHOLDER = "preview-unconfigured";

const shopify = shopifyApp({
  apiKey: process.env.SHOPIFY_API_KEY || (isProd ? undefined : PLACEHOLDER),
  apiSecretKey: process.env.SHOPIFY_API_SECRET || (isProd ? "" : PLACEHOLDER),
  apiVersion: ApiVersion.October25,
  scopes: process.env.SCOPES?.split(","),
  appUrl: process.env.SHOPIFY_APP_URL || "",
  authPathPrefix: "/auth",
  sessionStorage: new PrismaSessionStorage(prisma),
  distribution: AppDistribution.AppStore,
  future: {
    expiringOfflineAccessTokens: true,
  },
  ...(process.env.SHOP_CUSTOM_DOMAIN
    ? { customShopDomains: [process.env.SHOP_CUSTOM_DOMAIN] }
    : {}),
});

export default shopify;
export const apiVersion = ApiVersion.October25;
export const addDocumentResponseHeaders = shopify.addDocumentResponseHeaders;
export const authenticate = shopify.authenticate;
export const unauthenticated = shopify.unauthenticated;
export const login = shopify.login;
export const registerWebhooks = shopify.registerWebhooks;
export const sessionStorage = shopify.sessionStorage;
