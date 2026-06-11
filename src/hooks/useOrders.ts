import { useEffect, useMemo, useState } from "react";
import type { Order } from "../features/order/orderTypes";
import { getOrderRepository } from "../storage/repositoryFactory";

export function useOrders(businessDate: string) {
  const repository = useMemo(() => getOrderRepository(), []);
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    setError("");
    return repository.subscribe(businessDate, setOrders, setError);
  }, [businessDate, repository]);

  return {
    orders,
    storageMode: repository.mode,
    storageError: error,
    saveOrder: repository.save,
    updateOrder: repository.update,
    deleteOrders: repository.deleteByIds,
  };
}
