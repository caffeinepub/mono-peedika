import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useImageUpload } from "@/hooks/useImageUpload";
import { useAddProduct, useUpdateProduct } from "@/hooks/useQueries";
import { ImagePlus, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { Product } from "../../backend.d.ts";

const CATEGORIES = [
  "Electronics",
  "Mobiles",
  "Laptops",
  "Audio",
  "Cameras",
  "Accessories",
  "Wearables",
  "Gaming",
];
const ALL_TAGS = ["Best Seller", "Deal of the Day", "New Arrival", "Top Rated"];

interface FormState {
  name: string;
  description: string;
  category: string;
  priceRupees: string;
  discountPercent: string;
  stockQty: string;
  tags: string[];
  imageUrl: string;
}

const EMPTY_FORM: FormState = {
  name: "",
  description: "",
  category: "Electronics",
  priceRupees: "",
  discountPercent: "0",
  stockQty: "0",
  tags: [],
  imageUrl: "",
};

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingProduct: Product | null;
}

export function ProductFormDialog({
  open,
  onOpenChange,
  editingProduct,
}: Props) {
  const addProduct = useAddProduct();
  const updateProduct = useUpdateProduct();
  const { uploadImage, progress: uploadProgress } = useImageUpload();
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    if (editingProduct) {
      setForm({
        name: editingProduct.name,
        description: editingProduct.description,
        category: editingProduct.category,
        priceRupees: (Number(editingProduct.price) / 100).toString(),
        discountPercent: Number(editingProduct.discountPercent).toString(),
        stockQty: Number(editingProduct.stockQty).toString(),
        tags: editingProduct.tags,
        imageUrl: editingProduct.imageUrl,
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [editingProduct, open]);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function toggleTag(tag: string) {
    set(
      "tags",
      form.tags.includes(tag)
        ? form.tags.filter((t) => t !== tag)
        : [...form.tags, tag],
    );
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await uploadImage(file);
      set("imageUrl", url);
      toast.success("Image uploaded");
    } catch {
      toast.error("Image upload failed");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const paise = BigInt(
      Math.round(Number.parseFloat(form.priceRupees || "0") * 100),
    );
    const discount = BigInt(Number.parseInt(form.discountPercent || "0", 10));
    const stock = BigInt(Number.parseInt(form.stockQty || "0", 10));

    try {
      if (editingProduct) {
        await updateProduct.mutateAsync({
          id: editingProduct.id,
          name: form.name,
          description: form.description,
          category: form.category,
          price: paise,
          discountPercent: discount,
          stockQty: stock,
          tags: form.tags,
          imageUrl: form.imageUrl,
          rating: editingProduct.rating,
          reviewCount: editingProduct.reviewCount,
        });
        toast.success("Product updated");
      } else {
        await addProduct.mutateAsync({
          name: form.name,
          description: form.description,
          category: form.category,
          price: paise,
          discountPercent: discount,
          stockQty: stock,
          tags: form.tags,
          imageUrl: form.imageUrl,
          rating: 0,
          reviewCount: BigInt(0),
        });
        toast.success("Product added");
      }
      onOpenChange(false);
    } catch {
      toast.error(
        editingProduct ? "Failed to update product" : "Failed to add product",
      );
    }
  }

  const isPending = addProduct.isPending || updateProduct.isPending;
  const isUploading = uploadProgress !== null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-foreground">
            {editingProduct ? "Edit Product" : "Add Product"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Image Upload */}
          <div className="space-y-1.5">
            <Label className="text-foreground">Product Image</Label>
            <div className="flex items-start gap-3">
              <button
                type="button"
                className="w-20 h-20 rounded-lg bg-muted border border-border overflow-hidden flex-shrink-0 flex items-center justify-center cursor-pointer hover:border-accent/50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
                aria-label="Click to upload product image"
              >
                {form.imageUrl ? (
                  <img
                    src={form.imageUrl}
                    alt="Product preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ImagePlus className="w-6 h-6 text-muted-foreground" />
                )}
              </button>
              <div className="flex-1 space-y-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="w-full flex items-center justify-center gap-2 h-9 px-3 rounded-lg border border-dashed border-border/60 bg-muted/30 text-sm text-muted-foreground hover:border-accent/50 hover:text-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  data-ocid="image-upload-btn"
                >
                  <ImagePlus className="w-4 h-4" />
                  {isUploading
                    ? `Uploading ${uploadProgress}%…`
                    : "Upload Image"}
                </button>
                {form.imageUrl && !isUploading && (
                  <button
                    type="button"
                    onClick={() => set("imageUrl", "")}
                    className="w-full flex items-center justify-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <X className="w-3 h-3" /> Remove
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                  data-ocid="image-file-input"
                />
              </div>
            </div>
            {isUploading && (
              <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                <div
                  className="h-full bg-accent transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            )}
          </div>

          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="pf-name" className="text-foreground">
              Product Name
            </Label>
            <Input
              id="pf-name"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="e.g. Sony WH-1000XM5"
              required
              className="bg-muted/30 border-border text-foreground"
              data-ocid="product-name-input"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="pf-desc" className="text-foreground">
              Description
            </Label>
            <Textarea
              id="pf-desc"
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Product description…"
              rows={3}
              className="bg-muted/30 border-border text-foreground resize-none"
              data-ocid="product-desc-input"
            />
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <Label htmlFor="pf-category" className="text-foreground">
              Category
            </Label>
            <select
              id="pf-category"
              value={form.category}
              onChange={(e) => set("category", e.target.value)}
              className="w-full h-9 px-3 rounded-lg bg-muted/30 border border-border text-foreground text-sm outline-none focus:border-accent/60 transition-colors"
              data-ocid="product-category-select"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Price + Discount row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="pf-price" className="text-foreground">
                Price (₹)
              </Label>
              <Input
                id="pf-price"
                type="number"
                min="0"
                step="0.01"
                value={form.priceRupees}
                onChange={(e) => set("priceRupees", e.target.value)}
                placeholder="e.g. 29999"
                required
                className="bg-muted/30 border-border text-foreground"
                data-ocid="product-price-input"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pf-discount" className="text-foreground">
                Discount %
              </Label>
              <Input
                id="pf-discount"
                type="number"
                min="0"
                max="100"
                value={form.discountPercent}
                onChange={(e) => set("discountPercent", e.target.value)}
                placeholder="0"
                className="bg-muted/30 border-border text-foreground"
                data-ocid="product-discount-input"
              />
            </div>
          </div>

          {/* Stock */}
          <div className="space-y-1.5">
            <Label htmlFor="pf-stock" className="text-foreground">
              Stock Qty
            </Label>
            <Input
              id="pf-stock"
              type="number"
              min="0"
              value={form.stockQty}
              onChange={(e) => set("stockQty", e.target.value)}
              placeholder="0"
              required
              className="bg-muted/30 border-border text-foreground"
              data-ocid="product-stock-input"
            />
          </div>

          {/* Tags */}
          <div className="space-y-1.5">
            <Label className="text-foreground">Tags</Label>
            <div className="flex flex-wrap gap-2">
              {ALL_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    form.tags.includes(tag)
                      ? "bg-accent/20 border-accent/50 text-accent"
                      : "bg-muted/30 border-border text-muted-foreground hover:border-accent/30 hover:text-foreground"
                  }`}
                  data-ocid={`tag-toggle-${tag.replace(/\s/g, "-").toLowerCase()}`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-border"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending || isUploading}
              className="bg-accent text-accent-foreground hover:opacity-90"
              data-ocid="product-form-submit-btn"
            >
              {isPending
                ? "Saving…"
                : editingProduct
                  ? "Save Changes"
                  : "Add Product"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
