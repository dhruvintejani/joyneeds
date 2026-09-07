import { useEffect, useMemo, useState } from "react";
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
import {
  createAdminProduct,
  deleteAdminProductImage,
  listAdminCategories,
  listAdminProducts,
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
    sku: "",
    categoryId: "",
    price: "",
    stock: "",
    shortDescription: "",
    description: "",
    active: true,
    featured: false,
    newArrival: false,
  });

  useEffect(() => {
    let active = true;
    void Promise.all([listAdminProducts(), listAdminCategories()])
      .then(([products, categoryItems]) => {
        if (!active) return;
        setCategories(categoryItems.filter((item) => item.active));
        if (!productId) return;
        const found = products.find((item) => item.id === productId) ?? null;
        setProduct(found);
        if (found) {
          setForm({
            name: found.name,
            sku: found.sku,
            categoryId: found.categoryId,
            price: String(found.pricePaise / 100),
            stock: found.stockQuantity == null ? "" : String(found.stockQuantity),
            shortDescription: found.shortDescription,
            description: found.description,
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
    const stock = form.stock === "" ? null : Number(form.stock);
    if (stock !== null && (!Number.isInteger(stock) || stock < 0)) {
      return toast.error("Stock must be a whole number or left blank.");
    }

    setSaving(true);
    try {
      const input = {
        name: form.name.trim(),
        sku: form.sku.trim(),
        categoryId: form.categoryId,
        pricePaise: Math.round(price * 100),
        stockQuantity: stock,
        shortDescription: form.shortDescription.trim(),
        description: form.description.trim(),
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
              <label className="wide">Product Name<input required minLength={2} maxLength={160} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
              <label>SKU<input required minLength={2} maxLength={80} value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} /></label>
              <label>Category<select required value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}><option value="">Choose category</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
              <label>Price (₹)<input required type="number" min="0" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></label>
              <label>Stock Quantity<input type="number" min="0" step="1" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} placeholder="Unknown" /></label>
              <label className="wide">Short Description<textarea required minLength={2} maxLength={500} rows={3} value={form.shortDescription} onChange={(e) => setForm({ ...form, shortDescription: e.target.value })} /></label>
              <label className="wide">Full Description<textarea required minLength={2} maxLength={10000} rows={7} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
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
          <label className="admin-check-row"><input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} /> Active</label>
          <label className="admin-check-row"><input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} /> Featured</label>
          <label className="admin-check-row"><input type="checkbox" checked={form.newArrival} onChange={(e) => setForm({ ...form, newArrival: e.target.checked })} /> New arrival</label>
          <div className="admin-image-security-note">
            <UploadCloud size={23} />
            <div><strong>Cloudinary managed images</strong><p>JPG, PNG, WebP or AVIF. Maximum 8 MB each and 8 images per product.</p></div>
          </div>
          <div className="admin-form-actions">
            <button className="admin-primary-button" type="submit" disabled={saving}><Save size={17} /> {saving ? "Saving…" : productId ? "Save Changes" : "Create Product"}</button>
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
                    if (!window.confirm("Delete this product image?")) return;
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

function EditorShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-app">
      <aside className="admin-sidebar">
        <div className="admin-brand-row"><Link to="/admin"><img src="/brand/joyneeds-logo.png" alt="JoyNeeds" /></Link></div>
        <nav className="admin-nav" aria-label="Admin navigation">
          <NavLink to="/admin" end><LayoutDashboard size={20} /> Dashboard</NavLink>
          <NavLink to="/admin/orders"><ClipboardList size={20} /> Orders</NavLink>
          <NavLink to="/admin/products" className="active"><Package size={20} /> Products</NavLink>
          <NavLink to="/admin/categories"><Boxes size={20} /> Categories</NavLink>
        </nav>
        <div className="admin-sidebar-spacer" />
        <Link className="admin-view-store" to="/"><ExternalLink size={18} /> View Store</Link>
      </aside>
      <div className="admin-shell">
        <header className="admin-topbar"><div className="admin-global-search"><Package size={18} /><span>Catalog management</span></div><div className="admin-user-copy"><strong>Admin</strong><small>Secure session</small></div></header>
        <main className="admin-content">{children}</main>
      </div>
    </div>
  );
}
