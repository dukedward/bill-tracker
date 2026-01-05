import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryResult,
} from "@tanstack/react-query";
import { apiFetch } from "./api";
import { useAuth } from "@/lib/useAuth";
import type { Bill, BillDTO, CreateBillDTO, UpdateBillDTO } from "@/types/bill";
import { billFromDTO } from "@/types/bill";

type ListBillsResponse = { data: BillDTO[] };
type OneBillResponse = { data: BillDTO };

async function getToken(user: { getIdToken: () => Promise<string> } | null) {
  if (!user) return null;
  return user.getIdToken();
}

export function useBills(): UseQueryResult<Bill[]> {
  const { user } = useAuth();

  return useQuery<Bill[]>({
    queryKey: ["bills"],
    queryFn: async () => {
      const token = await getToken(user);
      if (!token) return [];
      const res = await apiFetch<ListBillsResponse>("/api/bills", { token });
      return res.data.map(billFromDTO);
    },
    enabled: Boolean(user),
  });
}

export function useCreateBill() {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateBillDTO) => {
      const token = await getToken(user);
      if (!token) throw new Error("Not authenticated");
      const res = await apiFetch<OneBillResponse>("/api/bills", {
        method: "POST",
        body: payload,
        token,
      });
      return billFromDTO(res.data);
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["bills"] });
    },
  });
}

export function useUpdateBill() {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (args: { id: string; patch: UpdateBillDTO }) => {
      const token = await getToken(user);
      if (!token) throw new Error("Not authenticated");
      const res = await apiFetch<OneBillResponse>(`/api/bills/${args.id}`, {
        method: "PATCH",
        body: args.patch,
        token,
      });
      return billFromDTO(res.data);
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["bills"] });
    },
  });
}

export function useDeleteBill() {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const token = await getToken(user);
      if (!token) throw new Error("Not authenticated");
      await apiFetch<{ ok: true }>(`/api/bills/${id}`, {
        method: "DELETE",
        token,
      });
      return id;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["bills"] });
    },
  });
}


export function useToggleBillPaid() {
  const qc = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (vars: { id: string; paid: boolean }) => {
      const token = await getToken(user);
      if (!token) throw new Error("Not authenticated");

      const res = await apiFetch<OneBillResponse>(`/api/bills/${vars.id}`, {
        method: "PATCH",
        token,
        body: { paid: vars.paid } satisfies UpdateBillDTO,
      });

      return billFromDTO(res.data);
    },
    onMutate: async ({ id, paid }) => {
      await qc.cancelQueries({ queryKey: ["bills"] });

      const prev = qc.getQueryData<Bill[]>(["bills"]);
      if (prev) {
        qc.setQueryData<Bill[]>(
          ["bills"],
          prev.map((b) => (b.id === id ? { ...b, paid } : b))
        );
      }

      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(["bills"], ctx.prev);
    },
    onSettled: async () => {
      await qc.invalidateQueries({ queryKey: ["bills"] });
    },
  });
}
