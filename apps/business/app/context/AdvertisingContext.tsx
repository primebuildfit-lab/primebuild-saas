import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import type {
  Advertisement,
  AdvertisementStatus,
  Offer,
} from "~/types/advertising";
import { demoStore } from "~/data";
import { createId } from "~/lib/id";

/**
 * Client store for the VIP advertising domain (advertisements + offers).
 *
 * It starts EMPTY on purpose — a new tenant has no advertisements or offers, so
 * screens show honest "create your first…" empty states rather than fake data.
 * Mutations are optimistic and client-side; wiring these to the persistence seam
 * (repository/migration) is the next backend step and does not change this API.
 */
interface AdvertisingContextValue {
  advertisements: Advertisement[];
  offers: Offer[];
  createAdvertisement: (
    input: Omit<Advertisement, "id" | "storeId" | "createdAt" | "updatedAt">,
  ) => Advertisement;
  updateAdvertisement: (id: string, patch: Partial<Advertisement>) => void;
  setAdvertisementStatus: (id: string, status: AdvertisementStatus) => void;
  duplicateAdvertisement: (id: string) => Advertisement | undefined;
  deleteAdvertisement: (id: string) => void;
  createOffer: (input: Omit<Offer, "id" | "storeId" | "createdAt" | "updatedAt">) => Offer;
  updateOffer: (id: string, patch: Partial<Offer>) => void;
  deleteOffer: (id: string) => void;
}

const Ctx = createContext<AdvertisingContextValue | null>(null);

export function AdvertisingProvider({ children }: { children: ReactNode }) {
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);

  const createAdvertisement = useCallback<AdvertisingContextValue["createAdvertisement"]>((input) => {
    const now = new Date().toISOString();
    const ad: Advertisement = {
      ...input,
      id: createId("adv"),
      storeId: demoStore.id,
      createdAt: now,
      updatedAt: now,
    };
    setAdvertisements((prev) => [ad, ...prev]);
    return ad;
  }, []);

  const updateAdvertisement = useCallback((id: string, patch: Partial<Advertisement>) => {
    setAdvertisements((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...patch, updatedAt: new Date().toISOString() } : a)),
    );
  }, []);

  const setAdvertisementStatus = useCallback(
    (id: string, status: AdvertisementStatus) => updateAdvertisement(id, { status }),
    [updateAdvertisement],
  );

  const duplicateAdvertisement = useCallback((id: string) => {
    let copy: Advertisement | undefined;
    setAdvertisements((prev) => {
      const src = prev.find((a) => a.id === id);
      if (!src) return prev;
      const now = new Date().toISOString();
      copy = {
        ...src,
        id: createId("adv"),
        name: `${src.name} (copy)`,
        status: "draft",
        createdFromId: src.id,
        version: (src.version ?? 1) + 1,
        createdAt: now,
        updatedAt: now,
      };
      return [copy, ...prev];
    });
    return copy;
  }, []);

  const deleteAdvertisement = useCallback((id: string) => {
    setAdvertisements((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const createOffer = useCallback<AdvertisingContextValue["createOffer"]>((input) => {
    const now = new Date().toISOString();
    const offer: Offer = {
      ...input,
      id: createId("off"),
      storeId: demoStore.id,
      createdAt: now,
      updatedAt: now,
    };
    setOffers((prev) => [offer, ...prev]);
    return offer;
  }, []);

  const updateOffer = useCallback((id: string, patch: Partial<Offer>) => {
    setOffers((prev) =>
      prev.map((o) => (o.id === id ? { ...o, ...patch, updatedAt: new Date().toISOString() } : o)),
    );
  }, []);

  const deleteOffer = useCallback((id: string) => {
    setOffers((prev) => prev.filter((o) => o.id !== id));
  }, []);

  const value = useMemo<AdvertisingContextValue>(
    () => ({
      advertisements,
      offers,
      createAdvertisement,
      updateAdvertisement,
      setAdvertisementStatus,
      duplicateAdvertisement,
      deleteAdvertisement,
      createOffer,
      updateOffer,
      deleteOffer,
    }),
    [
      advertisements,
      offers,
      createAdvertisement,
      updateAdvertisement,
      setAdvertisementStatus,
      duplicateAdvertisement,
      deleteAdvertisement,
      createOffer,
      updateOffer,
      deleteOffer,
    ],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAdvertising(): AdvertisingContextValue {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAdvertising must be used within <DataProvider>");
  return v;
}
