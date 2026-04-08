import { createActor } from "@/backend";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  AddProductRequest,
  Order,
  OrderStatus,
  Product,
  UpdateProductRequest,
} from "../backend.d.ts";

// ─── Products ────────────────────────────────────────────────────────────────

export function useListProducts() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listProducts();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useFeaturedProducts(tag: string) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Product[]>({
    queryKey: ["featured-products", tag],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getFeaturedProducts(tag);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetProduct(id: string) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Product | null>({
    queryKey: ["product", id],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getProduct(id);
    },
    enabled: !!actor && !isFetching && !!id,
  });
}

export function useSearchProducts(term: string) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Product[]>({
    queryKey: ["search", term],
    queryFn: async () => {
      if (!actor || !term.trim()) return [];
      return actor.searchProducts(term.trim());
    },
    enabled: !!actor && !isFetching && !!term.trim(),
  });
}

export function useAddProduct() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation<Product, Error, AddProductRequest>({
    mutationFn: async (req) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.addProduct(req);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useUpdateProduct() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation<Product | null, Error, UpdateProductRequest>({
    mutationFn: async (req) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.updateProduct(req);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useDeleteProduct() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation<boolean, Error, string>({
    mutationFn: async (id) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.deleteProduct(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

// ─── Orders ──────────────────────────────────────────────────────────────────

export function useListOrders() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Order[]>({
    queryKey: ["orders"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listOrders();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUpdateOrderStatus() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation<Order | null, Error, { id: string; status: OrderStatus }>({
    mutationFn: async ({ id, status }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.updateOrderStatus(id, status);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}
