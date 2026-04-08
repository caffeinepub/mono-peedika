import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useDeleteProduct, useListProducts } from "@/hooks/useQueries";
import { formatBigIntPrice } from "@/utils/format";
import { AlertTriangle, Edit, PackagePlus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Product } from "../../backend.d.ts";
import { ProductFormDialog } from "./ProductFormDialog";

export function ProductsTab() {
  const { data: products, isLoading } = useListProducts();
  const deleteProduct = useDeleteProduct();
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  async function handleDelete(id: string) {
    try {
      await deleteProduct.mutateAsync(id);
      toast.success("Product deleted successfully");
    } catch {
      toast.error("Failed to delete product");
    } finally {
      setDeletingId(null);
    }
  }

  function openAdd() {
    setEditingProduct(null);
    setFormOpen(true);
  }

  function openEdit(p: Product) {
    setEditingProduct(p);
    setFormOpen(true);
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-lg font-bold text-foreground">
            Products
          </h2>
          <p className="text-sm text-muted-foreground">
            {products?.length ?? 0} product
            {(products?.length ?? 0) !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          type="button"
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
          data-ocid="add-product-btn"
        >
          <PackagePlus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border overflow-hidden bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-muted/40">
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground w-16">
                  Image
                </th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">
                  Name
                </th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground hidden md:table-cell">
                  Category
                </th>
                <th className="text-right px-4 py-3 font-semibold text-muted-foreground">
                  Price
                </th>
                <th className="text-right px-4 py-3 font-semibold text-muted-foreground hidden sm:table-cell">
                  Stock
                </th>
                <th className="text-right px-4 py-3 font-semibold text-muted-foreground hidden lg:table-cell">
                  Rating
                </th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground hidden xl:table-cell">
                  Tags
                </th>
                <th className="text-right px-4 py-3 font-semibold text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {isLoading
                ? Array.from({ length: 4 }).map((_, i) => (
                    // biome-ignore lint/suspicious/noArrayIndexKey: skeleton rows
                    <tr key={i}>
                      {Array.from({ length: 8 }).map((_, j) => (
                        // biome-ignore lint/suspicious/noArrayIndexKey: skeleton cells
                        <td key={j} className="px-4 py-3">
                          <Skeleton className="h-4 w-full rounded" />
                        </td>
                      ))}
                    </tr>
                  ))
                : (products ?? []).map((p) => (
                    <ProductRow
                      key={p.id}
                      product={p}
                      onEdit={() => openEdit(p)}
                      onDelete={() => setDeletingId(p.id)}
                    />
                  ))}
              {!isLoading && (products ?? []).length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-12 text-center text-muted-foreground"
                  >
                    No products yet. Add your first product.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Form Dialog */}
      <ProductFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        editingProduct={editingProduct}
      />

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deletingId}
        onOpenChange={(o) => !o && setDeletingId(null)}
      >
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-foreground">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Delete Product?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The product will be permanently
              removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingId && handleDelete(deletingId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-ocid="confirm-delete-btn"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function ProductRow({
  product: p,
  onEdit,
  onDelete,
}: {
  product: Product;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const discounted =
    Number(p.discountPercent) > 0
      ? Number(p.price) * (1 - Number(p.discountPercent) / 100)
      : Number(p.price);

  return (
    <tr
      className="hover:bg-muted/20 transition-colors"
      data-ocid={`product-row-${p.id}`}
    >
      <td className="px-4 py-3">
        <div className="w-10 h-10 rounded-md bg-muted overflow-hidden flex-shrink-0">
          {p.imageUrl ? (
            <img
              src={p.imageUrl}
              alt={p.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground text-xs">
              —
            </div>
          )}
        </div>
      </td>
      <td className="px-4 py-3">
        <p className="font-medium text-foreground truncate max-w-[200px]">
          {p.name}
        </p>
        <p className="text-xs text-muted-foreground truncate max-w-[200px]">
          {p.id}
        </p>
      </td>
      <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">
        {p.category}
      </td>
      <td className="px-4 py-3 text-right font-mono">
        <span className="text-foreground font-semibold">
          {formatBigIntPrice(BigInt(Math.round(discounted)))}
        </span>
        {Number(p.discountPercent) > 0 && (
          <span className="text-xs text-muted-foreground line-through ml-1 block">
            {formatBigIntPrice(p.price)}
          </span>
        )}
      </td>
      <td className="px-4 py-3 text-right hidden sm:table-cell">
        <span
          className={
            Number(p.stockQty) <= 5
              ? "text-destructive font-semibold"
              : "text-foreground"
          }
        >
          {Number(p.stockQty)}
        </span>
      </td>
      <td className="px-4 py-3 text-right hidden lg:table-cell text-muted-foreground">
        ⭐ {p.rating.toFixed(1)} ({Number(p.reviewCount)})
      </td>
      <td className="px-4 py-3 hidden xl:table-cell">
        <div className="flex flex-wrap gap-1 max-w-[180px]">
          {p.tags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="text-xs px-1.5 py-0"
            >
              {tag}
            </Badge>
          ))}
        </div>
      </td>
      <td className="px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            onClick={onEdit}
            className="p-1.5 rounded-md hover:bg-accent/10 hover:text-accent transition-colors text-muted-foreground"
            aria-label="Edit product"
            data-ocid={`edit-product-${p.id}`}
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="p-1.5 rounded-md hover:bg-destructive/10 hover:text-destructive transition-colors text-muted-foreground"
            aria-label="Delete product"
            data-ocid={`delete-product-${p.id}`}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}
