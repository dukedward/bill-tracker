import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryResult,
} from "@tanstack/react-query";
import { apiFetch } from "@/components/bill-tracker/api";
import { useAuth } from "@/lib/useAuth";
import type { Income, IncomeDTO, CreateIncomeDTO, UpdateIncomeDTO } from "@/types/income";
import { incomeFromDTO } from "@/types/income";

type ListIncomeResponse = { data: IncomeDTO[] };
type OneIncomeResponse = { data: IncomeDTO };

async function getToken(user: { getIdToken: () => Promise<string> } | null) {
  if (!user) return null;
  return user.getIdToken();
}

export function useIncome(enabled = true): UseQueryResult<Income[]> {
  const { user } = useAuth();

  return useQuery<Income[]>({
    queryKey: ["income"],
    queryFn: async () => {
      const token = await getToken(user);
      if (!token) throw new Error("Not authenticated");

      const res = await apiFetch<ListIncomeResponse>(`/api/income`, {
        method: "GET",
        token,
      });
      return res.data.map(incomeFromDTO);
    },
    enabled: enabled && Boolean(user),
  });
}

export function useCreateIncome() {
  const qc = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (input: CreateIncomeDTO) => {
      const token = await getToken(user);
      if (!token) throw new Error("Not authenticated");

      const res = await apiFetch<OneIncomeResponse>(`/api/income`, {
        method: "POST",
        token,
        body: input,
      });

      return incomeFromDTO(res.data);
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["income"] });
    },
  });
}

export function useUpdateIncome() {
  const qc = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (vars: { id: string; patch: UpdateIncomeDTO }) => {
      const token = await getToken(user);
      if (!token) throw new Error("Not authenticated");

      const res = await apiFetch<OneIncomeResponse>(`/api/income/${vars.id}`, {
        method: "PATCH",
        token,
        body: vars.patch,
      });

      return incomeFromDTO(res.data);
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["income"] });
    },
  });
}

export function useDeleteIncome() {
  const qc = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (id: string) => {
      const token = await getToken(user);
      if (!token) throw new Error("Not authenticated");

      await apiFetch<{ ok: true }>(`/api/income/${id}`, {
        method: "DELETE",
        token,
      });
      return id;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["income"] });
    },
  });
}
