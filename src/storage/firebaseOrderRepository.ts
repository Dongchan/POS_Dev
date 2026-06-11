import { initializeApp, getApp, getApps } from "firebase/app";
import {
  collection,
  deleteDoc,
  doc,
  getFirestore,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import type { Order } from "../features/order/orderTypes";
import type { OrderRepository } from "./orderRepository";

export function isFirebaseConfigured() {
  return Boolean(
    import.meta.env.VITE_FIREBASE_API_KEY &&
      import.meta.env.VITE_FIREBASE_PROJECT_ID &&
      import.meta.env.VITE_FIREBASE_APP_ID,
  );
}

export function createFirebaseOrderRepository(): OrderRepository {
  const app = getApps().length
    ? getApp()
    : initializeApp({
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
        authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
        storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
        appId: import.meta.env.VITE_FIREBASE_APP_ID,
      });
  const db = getFirestore(app);
  const ordersRef = collection(db, "orders");

  return {
    mode: "firebase",
    subscribe(businessDate, onData, onError) {
      const ordersQuery = query(ordersRef, where("businessDate", "==", businessDate));
      return onSnapshot(
        ordersQuery,
        (snapshot) => {
          const orders = snapshot.docs
            .map((orderDoc) => orderDoc.data() as Order)
            .sort((a, b) => a.createdAt - b.createdAt);
          onData(orders);
        },
        (error) => onError(error.message),
      );
    },
    async save(order) {
      await setDoc(doc(db, "orders", order.id), order);
    },
    async update(id, patch) {
      await updateDoc(doc(db, "orders", id), patch);
    },
    async deleteByIds(ids) {
      await Promise.all(ids.map((id) => deleteDoc(doc(db, "orders", id))));
    },
  };
}
