import { createFirebaseOrderRepository, isFirebaseConfigured } from "./firebaseOrderRepository";
import { createLocalOrderRepository } from "./localOrderRepository";
import type { OrderRepository } from "./orderRepository";

let repository: OrderRepository | null = null;

export function getOrderRepository() {
  if (!repository) {
    repository = isFirebaseConfigured() ? createFirebaseOrderRepository() : createLocalOrderRepository();
  }

  return repository;
}
