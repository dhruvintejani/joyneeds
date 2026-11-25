import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Boxes,
  ClipboardList,
  ExternalLink,
  ImagePlus,
  LayoutDashboard,
  Package,
  RefreshCw,
  Save,
  Trash2,
  UploadCloud,
} from "lucide-react";
import toast from "react-hot-toast";
import { useConfirm } from "../components/common/ConfirmDialog";
import {
  createAdminProduct,
  deleteAdminProductImage,
  listAdminCategories,
  getAdminProduct,
  replaceAdminProductImage,
  updateAdminProduct,
  uploadAdminProductImages,
  type AdminCategory,
  type AdminProduct,
  type AdminProductImage,
} from "../api/admin";
import ProductImage from "../components/common/ProductImage";
import { useCatalogStore } from "../store/catalogStore";
import "./admin.css";
import "./adminImages.css";

const MAX_IMAGES = 8;
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const allowedImageTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);

export default function AdminProductEditorWorkspace() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<AdminProduct | null>(null);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [pendingImages, setPendingImages] = useState<File[]>([]);
  const [loading, setLoading] = useState(Boolean(productId));
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    slug: "",
    sku: "",
    categoryId: "",
    subcategory: "",
    price: "",
    originalPrice: "",
    stock: "",
    stockStatus: "IN_STOCK" as "IN_STOCK" | "OUT_OF_STOCK",
    shortDescription: "",
    description: "",
    features: "",
    specifications: "",
    tags: "",
    shippingInfo: "",
    returnInfo: "",
    active: true,
    featured: false,
    newArrival: false,
  });

  useEffect(() => {
    let active = true;
    void Promise.all([productId ? getAdminProduct(productId) : Promise.resolve(null), listAdminCategories()])
      .then(([found, categoryItems]) => {
        if (!active) return;
        setCategories(categoryItems.filter((item) => item.active));
        if (!productId) return;
        setProduct(found);
        if (found) {
          setForm({
            name: found.name,
            slug: found.slug,
            sku: found.sku,
            categoryId: found.categoryId,
            subcategory: found.subcategory || "",
            price: String(found.pricePaise / 100),
            originalPrice: found.originalPricePaise === null ? "" : String(found.originalPricePaise / 100),
            stock: found.stockQuantity == null ? "" : String(found.stockQuantity),
            stockStatus: found.stockStatus,
            shortDescription: found.shortDescription,
            description: found.description,
            features: (found.features || []).join("\n"),
            specifications: Object.entries(found.specifications || {}).map(([key, value]) => `${key}: ${value}`).join("\n"),
            tags: (found.tags || []).join(", "),
            shippingInfo: found.shippingInfo || "",
            returnInfo: found.returnInfo || "",
            active: found.active,
            featured: found.featured,
            newArrival: found.newArrival,
          });
        }
      })
      .catch((error: unknown) => {
        toast.error(error instanceof Error ? error.message : "Unable to load product editor.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [productId]);

  const title = productId ? "Edit Product" : "Add Product";

  if (loading) {
    return <EditorShell><div className="admin-empty-module"><p>Loading product…</p></div></EditorShell>;
  }

  if (productId && !product) {
    return (
      <EditorShell>
        <div className="admin-empty-module">
          <h2>Product not found</h2>
          <Link to="/admin/products">Back to products</Link>
        </div>
      </EditorShell>
    );
  }

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.categoryId) return toast.error("Select a category.");
    const price = Number(form.price);
    if (!Number.isFinite(price) || price < 0) return toast.error("Enter a valid price.");
    const originalPrice = form.originalPrice.trim() === "" ? null : Number(form.originalPrice);
    if (originalPrice !== null && (!Number.isFinite(originalPrice) || originalPrice < price || originalPrice > 1_000_000)) {
      return toast.error("Original price must be at least the selling price.");
    }
    const features = form.features.split("\n").map((value) => value.trim()).filter(Boolean);
    const tags = form.tags.split(",").map((value) => value.trim()).filter(Boolean);
    if (features.length > 30 || features.some((value) => value.length > 200)) {
      return toast.error("Use at most 30 features, up to 200 characters each.");
    }
    if (tags.length > 30 || tags.some((value) => value.length > 80)) {
      return toast.error("Use at most 30 tags, up to 80 characters each.");
    }
    const specifications: Record<string, string> = {};
    for (const line of form.specifications.split("\n").map((value) => value.trim()).filter(Boolean)) {
      const colon = line.indexOf(":");
      const key = line.slice(0, colon).trim();
      const value = line.slice(colon + 1).trim();
      if (colon < 1 || !key || !value || key.length > 80 || value.length > 500) {
        return toast.error("Specifications must use a separate Key: Value per line.");
      }
      specifications[key] = value;
    }
    const stock = form.stock === "" ? null : Number(form.stock);
    if (stock !== null && (!Number.isInteger(stock) || stock < 0)) {
      return toast.error("Stock must be a whole number or left blank.");
    }

    setSaving(true);
    try {
      const input = {
        name: form.name.trim(),
        slug: form.slug.trim() || undefined,
        sku: form.sku.trim(),
        categoryId: form.categoryId,
        subcategory: form.subcategory.trim() || null,
        pricePaise: Math.round(price * 100),
        originalPricePaise: originalPrice === null ? null : Math.round(originalPrice * 100),
        stockQuantity: stock,
        stockStatus: stock === 0 ? "OUT_OF_STOCK" : form.stockStatus,
        shortDescription: form.shortDescription.trim(),
        description: form.description.trim(),
        features,
        specifications,
        tags,
        shippingInfo: form.shippingInfo.trim() || null,
        returnInfo: form.returnInfo.trim() || null,
        active: form.active,
        featured: form.featured,
        newArrival: form.newArrival,
      };

      const saved = productId
        ? await updateAdminProduct(productId, input)
        : await createAdminProduct(input);

      if (!productId && pendingImages.length) {
        try {
          await uploadAdminProductImages(saved.id, pendingImages);
        } catch (imageError) {
          await useCatalogStore.getState().loadCatalog(true);
          toast.error(
            `Product created, but images were not uploaded: ${imageError instanceof Error ? imageError.message : "upload failed"}`,
          );
          navigate(`/admin/products/${saved.id}/edit`);
          return;
        }
      }

      await useCatalogStore.getState().loadCatalog(true);
      toast.success(productId ? "Product updated." : "Product created.");
      navigate("/admin/products");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save product.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <EditorShell>
      <div className="admin-page-header">
        <div>
          <p className="admin-eyebrow">Catalog</p>
          <h1>{title}</h1>
          <p>Product details and images are saved through protected admin APIs.</p>
        </div>
        <Link className="admin-outline-button" to="/admin/products"><ArrowLeft size={17} /> Back to Products</Link>
      </div>

      <form className="admin-editor-grid" onSubmit={submit}>
        <div className="admin-product-editor-main">
          <section className="admin-panel admin-form-card">
            <h2>Product Information</h2>
            <div className="admin-form-grid">
              <label className="wide">Product Name<input required minLength={2} maxLength={160} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Product name" /></label>
              <label>Product URL slug <small>(optional)</small><input maxLength={120} pattern="[a-z0-9]+(-[a-z0-9]+)*" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") })} placeholder="Generated from name" /></label>
              <label>SKU<input required minLength={2} maxLength={80} value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} placeholder="Unique product code" /></label>
              <label>Category<select required value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}><option value="">Choose category</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
              <label>Subcategory<input maxLength={120} value={form.subcategory} onChange={(e) => setForm({ ...form, subcategory: e.target.value })} placeholder="Optional" /></label>
              <label>Selling Price (₹)<input required type="number" min="0" max="1000000" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="0.00" /></label>
              <label>Original Price (₹) <small>(optional)</small><input type="number" min="0" max="1000000" step="0.01" value={form.originalPrice} onChange={(e) => setForm({ ...form, originalPrice: e.target.value })} placeholder="Leave empty if no discount" /></label>
              <label>Stock Quantity<input type="number" min="0" step="1" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} placeholder="Unknown" /></label>
              <label>Availability<select value={form.stockStatus} onChange={(e) => setForm({ ...form, stockStatus: e.target.value as "IN_STOCK" | "OUT_OF_STOCK" })}><option value="IN_STOCK">Available</option><option value="OUT_OF_STOCK">Out of stock</option></select></label>
              <label className="wide">Short Description<textarea required minLength={2} maxLength={500} rows={3} value={form.shortDescription} onChange={(e) => setForm({ ...form, shortDescription: e.target.value })} /></label>
              <label className="wide">Full Description<textarea required minLength={2} maxLength={10000} rows={7} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
            </div>
          </section>
          <section className="admin-panel admin-form-card jn-admin-detail-section">
            <h2>Additional product details</h2>
            <p className="admin-muted">These fields are saved with the product and displayed where supported by the storefront.</p>
            <div className="admin-form-grid">
              <label className="wide">Key Features <small>(one per line)</small><textarea rows={5} value={form.features} onChange={(e) => setForm({ ...form, features: e.target.value })} placeholder={"Easy to use\nCompact design\nDurable construction"} /></label>
              <label className="wide">Specifications <small>(one Key: Value per line)</small><textarea rows={5} value={form.specifications} onChange={(e) => setForm({ ...form, specifications: e.target.value })} placeholder={"Material: Steel\nSize: Medium"} /></label>
              <label className="wide">Search tags <small>(comma separated)</small><input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="home, kitchen, useful" /></label>
              <label className="wide">Shipping information<textarea rows={3} maxLength={1000} value={form.shippingInfo} onChange={(e) => setForm({ ...form, shippingInfo: e.target.value })} placeholder="Actual handling and shipping terms" /></label>
              <label className="wide">Return information<textarea rows={3} maxLength={1000} value={form.returnInfo} onChange={(e) => setForm({ ...form, returnInfo: e.target.value })} placeholder="Actual return policy for this product" /></label>
            </div>
          </section>

          <ProductImageManager
            product={product}
            pendingImages={pendingImages}
            onPendingImagesChange={setPendingImages}
            onImagesChange={(images) => {
              if (product) setProduct({ ...product, images });
            }}
          />
        </div>

        <aside className="admin-panel admin-form-card admin-editor-publishing">
          <h2>Publishing</h2>
          <div className="jn-admin-product-preview" aria-live="polite">
            <span>PRODUCT PREVIEW</span>
            <strong>{form.name.trim() || "New product"}</strong>
            <small>{categories.find((category) => category.id === form.categoryId)?.name || "Choose a category"}{form.subcategory ? " / " + form.subcategory : ""}</small>
            <div className="jn-admin-preview-prices">
              <b>{Number.isFinite(Number(form.price)) && form.price !== "" ? new Intl.NumberFormat("en-IN", { style:"currency", currency:"INR", maximumFractionDigits:2 }).format(Number(form.price)) : "₹ —"}</b>
              {form.originalPrice && Number(form.originalPrice) > Number(form.price) && <del>{new Intl.NumberFormat("en-IN", { style:"currency", currency:"INR" }).format(Number(form.originalPrice))}</del>}
            </div>
            <em>{form.active ? "Published when saved" : "Hidden from the store"}</em>
          </div>
          <label className="admin-check-row"><input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} /> Active</label>
          <label className="admin-check-row"><input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} /> Featured</label>
          <label className="admin-check-row"><input type="checkbox" checked={form.newArrival} onChange={(e) => setForm({ ...form, newArrival: e.target.checked })} /> New arrival</label>
          <div className="admin-image-security-note">
            <UploadCloud size={23} />
            <div><strong>Cloudinary managed images</strong><p>JPG, PNG, WebP or AVIF. Maximum 8 MB each and 8 images per product.</p></div>
          </div>
          {categories.length === 0 && <p className="jn-admin-category-hint" role="status">Add an active category first. <Link to="/admin/categories">Manage categories</Link></p>}
          <div className="admin-form-actions">
            <button className="admin-primary-button" type="submit" disabled={saving || categories.length === 0}><Save size={17} /> {saving ? "Saving…" : productId ? "Save Changes" : "Create Product"}</button>
            <Link className="admin-outline-button" to="/admin/products">Cancel</Link>
          </div>
        </aside>
      </form>
    </EditorShell>
  );
}

function ProductImageManager({
  product,
  pendingImages,
  onPendingImagesChange,
  onImagesChange,
}: {
  product: AdminProduct | null;
  pendingImages: File[];
  onPendingImagesChange: (files: File[]) => void;
  onImagesChange: (images: AdminProductImage[]) => void;
}) {
  const confirm = useConfirm();
  const [uploading, setUploading] = useState(false);
  const images = product?.images ?? [];
  const remainingSlots = MAX_IMAGES - images.length;

  const validateFiles = (files: File[]) => {
    if (!files.length) return null;
    if (files.length > remainingSlots) return `Only ${remainingSlots} image slot${remainingSlots === 1 ? " is" : "s are"} available.`;
    const wrongType = files.find((file) => !allowedImageTypes.has(file.type));
    if (wrongType) return `${wrongType.name}: use JPG, PNG, WebP, or AVIF.`;
    const tooLarge = files.find((file) => file.size > MAX_IMAGE_BYTES);
    if (tooLarge) return `${tooLarge.name}: each image must be 8 MB or smaller.`;
    return null;
  };

  const handleChoose = async (selected: File[]) => {
    const error = validateFiles(selected);
    if (error) return toast.error(error);

    if (!product) {
      onPendingImagesChange(selected);
      return;
    }

    setUploading(true);
    try {
      const next = await uploadAdminProductImages(product.id, selected);
      onImagesChange(next);
      await useCatalogStore.getState().loadCatalog(true);
      toast.success(`${selected.length} image${selected.length === 1 ? "" : "s"} uploaded.`);
    } catch (uploadError) {
      toast.error(uploadError instanceof Error ? uploadError.message : "Unable to upload images.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <section className="admin-panel admin-form-card admin-image-manager">
      <div className="admin-panel-heading">
        <div><h2>Product Images</h2><p>{product ? `${images.length} of ${MAX_IMAGES} images` : "Images upload after the product record is created."}</p></div>
        <label className={`admin-primary-button ${uploading || remainingSlots <= 0 ? "disabled" : ""}`}>
          <ImagePlus size={17} /> {uploading ? "Uploading…" : product ? "Add Images" : "Choose Images"}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            multiple
            disabled={uploading || remainingSlots <= 0}
            onChange={(event) => {
              const files = Array.from(event.target.files ?? []);
              event.target.value = "";
              void handleChoose(files);
            }}
          />
        </label>
      </div>

      {!product && pendingImages.length > 0 && (
        <div className="admin-pending-images">
          {pendingImages.map((file) => (
            <div key={`${file.name}-${file.lastModified}`}><UploadCloud size={18} /><span>{file.name}</span><small>{(file.size / 1024 / 1024).toFixed(1)} MB</small></div>
          ))}
          <button type="button" className="admin-outline-button" onClick={() => onPendingImagesChange([])}>Clear selection</button>
        </div>
      )}

      {product && images.length > 0 && (
        <div className="admin-image-grid">
          {images.map((image, index) => (
            <article key={image.id} className="admin-image-card">
              <ProductImage src={image.secureUrl || image.sourceUrl || "/brand/joyneeds-icon.png"} alt={image.altText || product.name} />
              <div className="admin-image-card-meta">
                <strong>{index === 0 ? "Main image" : `Image ${index + 1}`}</strong>
                <small>{image.publicId ? "Cloudinary" : "Existing seed image"}</small>
              </div>
              <div className="admin-image-card-actions">
                <label className="admin-outline-button admin-small-button">
                  <RefreshCw size={15} /> Replace
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/avif"
                    disabled={uploading}
                    onChange={async (event) => {
                      const file = event.target.files?.[0];
                      event.target.value = "";
                      if (!file) return;
                      const error = validateSingleImage(file);
                      if (error) return toast.error(error);
                      setUploading(true);
                      try {
                        const next = await replaceAdminProductImage(product.id, image.id, file);
                        onImagesChange(next);
                        await useCatalogStore.getState().loadCatalog(true);
                        toast.success("Image replaced.");
                      } catch (replaceError) {
                        toast.error(replaceError instanceof Error ? replaceError.message : "Unable to replace image.");
                      } finally {
                        setUploading(false);
                      }
                    }}
                  />
                </label>
                <button
                  type="button"
                  className="admin-danger-button admin-small-button"
                  disabled={uploading}
                  onClick={async () => {
                    if (!await confirm({ title: "Delete product image?", message: "This permanently removes the selected image from the product. This action cannot be undone.", confirmLabel: "Delete image" })) return;
                    setUploading(true);
                    try {
                      const next = await deleteAdminProductImage(product.id, image.id);
                      onImagesChange(next);
                      await useCatalogStore.getState().loadCatalog(true);
                      toast.success("Image deleted.");
                    } catch (deleteError) {
                      toast.error(deleteError instanceof Error ? deleteError.message : "Unable to delete image.");
                    } finally {
                      setUploading(false);
                    }
                  }}
                ><Trash2 size={15} /> Delete</button>
              </div>
            </article>
          ))}
        </div>
      )}

      {product && !images.length && (
        <div className="admin-image-empty"><ImagePlus size={30} /><strong>No product images</strong><p>Upload the first image. The storefront will use the JoyNeeds fallback until then.</p></div>
      )}
    </section>
  );
}

function validateSingleImage(file: File) {
  if (!allowedImageTypes.has(file.type)) return "Use JPG, PNG, WebP, or AVIF images only.";
  if (file.size > MAX_IMAGE_BYTES) return "The image must be 8 MB or smaller.";
  return null;
}

function EditorShell({ children }: { children: React.ReactNode }) { return <>{children}</>; }
