import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { toast } from "sonner";
import { useState } from "react";
import { Loader2, Plus, Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  listPackages,
  createPackage,
  updatePackage,
  deletePackage,
  type CreditPackage,
} from "@/lib/admin-api";

const packageSchema = z.object({
  id: z.string().min(1, "ID is required"),
  name: z.string().min(1, "Name is required"),
  credits: z.number().min(1, "Credits must be positive"),
  price: z.number().min(1, "Price must be positive"),
  polarProductId: z.string().min(1, "Polar Product ID is required"),
});

export default function AdminPackagesPage() {
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<CreditPackage | null>(
    null,
  );

  // Fetch packages
  const { data: packages, isLoading } = useQuery({
    queryKey: ["admin-packages"],
    queryFn: listPackages,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: createPackage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-packages"] });
      setIsCreateOpen(false);
      toast.success("Package created successfully");
    },
    onError: () => {
      toast.error("Failed to create package");
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<z.infer<typeof packageSchema>>;
    }) => {
      return updatePackage(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-packages"] });
      setEditingPackage(null);
      toast.success("Package updated successfully");
    },
    onError: () => {
      toast.error("Failed to update package");
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deletePackage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-packages"] });
      toast.success("Package deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete package");
    },
  });

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Credit Packages</h2>
          <p className="text-muted-foreground">
            Manage the credit packages available for purchase.
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Package
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Package</DialogTitle>
              <DialogDescription>
                Add a new credit package configuration.
              </DialogDescription>
            </DialogHeader>
            <PackageForm
              onSubmit={(data) => createMutation.mutate(data)}
              isSubmitting={createMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Packages</CardTitle>
          <CardDescription>
            List of all configured credit packages.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-md border">
            <table className="w-full caption-bottom text-sm min-w-[800px]">
              <thead className="bg-muted/50 [&_tr]:border-b">
                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    ID
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Name
                  </th>
                  <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">
                    Credits
                  </th>
                  <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">
                    Price (Cents)
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Polar Product ID
                  </th>
                  <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {packages?.map((pkg) => (
                  <tr
                    key={pkg.id}
                    className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                  >
                    <td className="p-4 align-middle font-medium">{pkg.id}</td>
                    <td className="p-4 align-middle">{pkg.name}</td>
                    <td className="p-4 text-right align-middle">
                      {pkg.credits}
                    </td>
                    <td className="p-4 text-right align-middle">{pkg.price}</td>
                    <td className="p-4 align-middle font-mono text-xs">
                      {pkg.polarProductId}
                    </td>
                    <td className="p-4 align-middle text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingPackage(pkg)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => {
                            if (
                              confirm(
                                "Are you sure you want to delete this package?",
                              )
                            ) {
                              deleteMutation.mutate(pkg.id);
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {packages?.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-4 text-center h-24">
                      No packages found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={!!editingPackage}
        onOpenChange={(open) => !open && setEditingPackage(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Package</DialogTitle>
            <DialogDescription>
              Update the credit package configuration.
            </DialogDescription>
          </DialogHeader>
          {editingPackage && (
            <PackageForm
              defaultValues={editingPackage}
              onSubmit={(data) =>
                updateMutation.mutate({ id: editingPackage.id, data })
              }
              isSubmitting={updateMutation.isPending}
              isEditing
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PackageForm({
  defaultValues,
  onSubmit,
  isSubmitting,
  isEditing = false,
}: {
  defaultValues?: Partial<CreditPackage>;
  onSubmit: (data: any) => void;
  isSubmitting: boolean;
  isEditing?: boolean;
}) {
  const [formData, setFormData] = useState({
    id: defaultValues?.id || "",
    name: defaultValues?.name || "",
    credits: defaultValues?.credits || 0,
    price: defaultValues?.price || 0,
    polarProductId: defaultValues?.polarProductId || "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = packageSchema.safeParse(formData);

    if (!result.success) {
      const newErrors: Record<string, string> = {};
      (result.error as any).errors.forEach((err: any) => {
        if (err.path[0]) {
          newErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(newErrors);
      return;
    }

    setErrors({});
    onSubmit(result.data);
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="id">ID (Slug)</Label>
        <Input
          id="id"
          value={formData.id}
          onChange={(e) => handleChange("id", e.target.value)}
          disabled={isEditing}
        />
        {errors.id && <p className="text-sm text-destructive">{errors.id}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => handleChange("name", e.target.value)}
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="credits">Credits</Label>
          <Input
            id="credits"
            type="number"
            value={formData.credits}
            onChange={(e) => handleChange("credits", Number(e.target.value))}
          />
          {errors.credits && (
            <p className="text-sm text-destructive">{errors.credits}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="price">Price (Cents)</Label>
          <Input
            id="price"
            type="number"
            value={formData.price}
            onChange={(e) => handleChange("price", Number(e.target.value))}
          />
          {errors.price && (
            <p className="text-sm text-destructive">{errors.price}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="polarProductId">Polar Product ID</Label>
        <Input
          id="polarProductId"
          value={formData.polarProductId}
          onChange={(e) => handleChange("polarProductId", e.target.value)}
        />
        {errors.polarProductId && (
          <p className="text-sm text-destructive">{errors.polarProductId}</p>
        )}
      </div>

      <div className="flex justify-end pt-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEditing ? "Update Package" : "Create Package"}
        </Button>
      </div>
    </form>
  );
}
