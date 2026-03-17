'use client';
import React, { useEffect, useState, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/useAppStore';
import {
  fetchInventory, createInventoryItem,
  updateInventoryItem, deleteInventoryItem, updateItemQuantity,
  setSelectedItem, clearSelectedItem,
} from '@/store/slices/inventorySlice';
import { Modal, Badge, EmptyState, LoadingSpinner } from '@/components/ui';
import { Input, Select, Textarea } from '@/components/ui';
import { Button } from '@/components/ui';
import { categoryService, locationService } from '@/services/householdService';
import { formatDate, getExpiryBadgeInfo } from '@/utils/formatters';
import { Category, Location, InventoryItem, Unit } from '@/types';
import toast from 'react-hot-toast';
import BarcodeScanner, { ScannedProduct } from '@/components/features/BarcodeScanner/BarcodeScanner';
import styles from './page.module.css';

const UNITS: Unit[] = [
  'pcs', 'kg', 'g', 'lbs', 'oz', 'liters', 'ml',
  'bottles', 'cans', 'boxes', 'bags', 'packs', 'dozen',
];

// Units where a per-package size makes sense (weight / volume)
const SIZED_UNITS: Unit[] = ['g', 'kg', 'ml', 'liters', 'lbs', 'oz'];

interface ItemForm {
  itemName: string; categoryId: string; locationId: string;
  quantity: string; unitSize: string; unit: Unit; minimumThreshold: string;
  expirationDate: string; brand: string; notes: string;
}

const EMPTY_FORM: ItemForm = {
  itemName:'', categoryId:'', locationId:'',
  quantity:'1', unitSize:'', unit:'pcs', minimumThreshold:'0',
  expirationDate:'', brand:'', notes:'',
};

export default function InventoryPage() {
  const dispatch = useAppDispatch();
  const { items, pagination, isLoading: loading } = useAppSelector(s => s.inventory);

  const [categories, setCategories] = useState<Category[]>([]);
  const [locations, setLocations]   = useState<Location[]>([]);

  const [search,   setSearch]   = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [locFilter, setLocFilter] = useState('');
  const [lowStock,  setLowStock]  = useState(false);
  const [expiring,  setExpiring]  = useState(false);
  const [page, setPage]           = useState(1);

  const [showModal,  setShowModal]  = useState(false);
  const [isEditing,  setIsEditing]  = useState(false);
  const [editId,     setEditId]     = useState<string | null>(null);
  const [form,       setForm]       = useState<ItemForm>(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState<Partial<ItemForm>>({});
  const [saving,     setSaving]     = useState(false);

  const [deleteConfirm, setDeleteConfirm] = useState<InventoryItem | null>(null);
  const [showScanner, setShowScanner] = useState(false);

  const handleScannedProduct = useCallback((product: ScannedProduct) => {
    setShowScanner(false);
    setIsEditing(false);
    setEditId(null);
    setForm({
      ...EMPTY_FORM,
      itemName: product.name,
      brand: product.brand,
      quantity: '1',
      notes: product.barcode ? `Barcode: ${product.barcode}` : '',
    });
    setFormErrors({});
    setShowModal(true);
  }, []);

  const load = useCallback(() => {
    dispatch(fetchInventory({
      page, limit: 15,
      search: search || undefined,
      categoryId: catFilter || undefined,
      locationId: locFilter || undefined,
      lowStock: lowStock || undefined,
      expiring: expiring || undefined,
    }));
  }, [dispatch, page, search, catFilter, locFilter, lowStock, expiring]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    categoryService.getAll().then(r => setCategories(r.data?.categories ?? []));
    locationService.getAll().then(r => setLocations(r.data?.locations ?? []));
  }, []);

  // debounce search
  useEffect(() => {
    const t = setTimeout(() => setPage(1), 400);
    return () => clearTimeout(t);
  }, [search]);

  const openAdd = () => {
    setIsEditing(false); setEditId(null);
    setForm(EMPTY_FORM); setFormErrors({});
    setShowModal(true);
  };

  const openEdit = (item: InventoryItem) => {
    setIsEditing(true); setEditId(item._id);
    setForm({
      itemName: item.itemName, categoryId: item.categoryId?._id ?? '',
      locationId: item.locationId?._id ?? '', quantity: String(item.quantity),
      unitSize: item.unitSize != null ? String(item.unitSize) : '',
      unit: item.unit, minimumThreshold: String(item.minimumThreshold ?? 0),
      expirationDate: item.expirationDate ? item.expirationDate.slice(0,10) : '',
      brand: item.brand ?? '', notes: item.notes ?? '',
    });
    setFormErrors({});
    dispatch(setSelectedItem(item));
    setShowModal(true);
  };

  const validate = (): boolean => {
    const errs: Partial<ItemForm> = {};
    if (!form.itemName.trim()) errs.itemName = 'Name is required.';
    if (isNaN(Number(form.quantity)) || Number(form.quantity) < 0) errs.quantity = 'Must be ≥ 0.';
    if (form.unitSize !== '' && (isNaN(Number(form.unitSize)) || Number(form.unitSize) <= 0)) errs.unitSize = 'Must be > 0.';
    if (isNaN(Number(form.minimumThreshold)) || Number(form.minimumThreshold) < 0) errs.minimumThreshold = 'Must be ≥ 0.';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = {
        itemName: form.itemName.trim(),
        categoryId: form.categoryId || '',
        locationId: form.locationId || undefined,
        quantity: Number(form.quantity),
        unitSize: form.unitSize !== '' ? Number(form.unitSize) : null,
        unit: form.unit as Unit,
        minimumThreshold: Number(form.minimumThreshold),
        expirationDate: form.expirationDate || undefined,
        brand: form.brand || undefined,
        notes: form.notes || undefined,
      };
      if (isEditing && editId) {
        await dispatch(updateInventoryItem({ id: editId, payload })).unwrap();
        toast.success('Item updated');
      } else {
        await dispatch(createInventoryItem(payload)).unwrap();
        toast.success('Item added');
      }
      setShowModal(false); dispatch(clearSelectedItem()); load();
    } catch (err: unknown) {
      toast.error((err as { message?: string })?.message ?? 'Failed to save');
    } finally { setSaving(false); }
  };

  const handleDelete = async (item: InventoryItem) => {
    try {
      await dispatch(deleteInventoryItem(item._id)).unwrap();
      toast.success('Item deleted');
      setDeleteConfirm(null); load();
    } catch { toast.error('Failed to delete'); }
  };

  const handleQty = async (item: InventoryItem, delta: number) => {
    const newQty = Math.max(0, item.quantity + delta);
    try {
      await dispatch(updateItemQuantity({ id: item._id, quantity: newQty })).unwrap();
      load();
    } catch { toast.error('Failed to update quantity'); }
  };

  const fc = (field: keyof ItemForm, value: string) => {
    setForm(p => ({ ...p, [field]: value }));
    setFormErrors(p => ({ ...p, [field]: undefined }));
  };

  // Helper: format a quantity label like "3 × 500 g" or "3 pcs"
  const qtyLabel = (item: InventoryItem) =>
    item.unitSize ? `${item.unitSize} ${item.unit}` : item.unit;

  const totalLabel = (item: InventoryItem) =>
    item.unitSize && item.totalAmount != null
      ? `${item.totalAmount} ${item.unit} total`
      : null;

  const catOptions  = categories.map(c => ({ value: c._id, label: c.name }));
  const locOptions  = locations.map(l => ({ value: l._id, label: l.name }));
  const unitOptions = UNITS.map(u => ({ value: u, label: u }));
  const totalPages  = pagination ? Math.ceil(pagination.total / pagination.limit) : 1;
  const showSizeField = SIZED_UNITS.includes(form.unit as Unit);

  return (
    <div className={styles.page}>
      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.searchWrap}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            className={styles.searchInput}
            placeholder="Search items…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
        </div>

        <div className={styles.filters}>
          <select
            className={styles.filterSelect}
            value={catFilter}
            onChange={e => { setCatFilter(e.target.value); setPage(1); }}
          >
            <option value="">All categories</option>
            {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
          <select
            className={styles.filterSelect}
            value={locFilter}
            onChange={e => { setLocFilter(e.target.value); setPage(1); }}
          >
            <option value="">All locations</option>
            {locations.map(l => <option key={l._id} value={l._id}>{l.name}</option>)}
          </select>
          <button
            className={`${styles.filterChip} ${lowStock ? styles.active : ''}`}
            onClick={() => { setLowStock(p => !p); setPage(1); }}
          >⚠️ Low stock</button>
          <button
            className={`${styles.filterChip} ${expiring ? styles.active : ''}`}
            onClick={() => { setExpiring(p => !p); setPage(1); }}
          >🕐 Expiring</button>
        </div>

        <button className={styles.addBtn} onClick={openAdd}>＋ Add Item</button>
        <button className={styles.scanBtn} onClick={() => setShowScanner(true)}>📷 Scan</button>
      </div>

      {/* Table */}
      <div className={styles.tableCard}>
        {loading ? (
          <div style={{ padding: 40, display: 'flex', justifyContent: 'center' }}>
            <LoadingSpinner size={32} />
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            icon="📦"
            title="No items found"
            message="Add your first grocery item to start tracking your inventory."
            action={<button className={styles.addBtn} onClick={openAdd} style={{ margin: '0 auto' }}>＋ Add Item</button>}
          />
        ) : (
          <>
            {/* ── Desktop table ─────────────────────────────────────── */}
            <div className={styles.desktopTable}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--color-border)' }}>
                    {['Item', 'Category', 'Location', 'Quantity', 'Expiry', 'Status', 'Actions'].map(h => (
                      <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {items.map(item => {
                    const expBadge = getExpiryBadgeInfo(item.expirationDate);
                    const isLow = item.quantity <= (item.minimumThreshold ?? 0) && (item.minimumThreshold ?? 0) > 0;
                    const catName = item.categoryId?.name ?? '—';
                    const locName = item.locationId?.name ?? '—';
                    return (
                      <tr key={item._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '12px 16px' }}>
                          <div className={styles.itemName}>{item.itemName}</div>
                          {item.brand && <div className={styles.itemMeta}>{item.brand}</div>}
                        </td>
                        <td style={{ padding: '12px 16px', color: 'var(--color-text-secondary)' }}>{catName}</td>
                        <td style={{ padding: '12px 16px', color: 'var(--color-text-secondary)' }}>{locName}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <div className={styles.qtyCell}>
                            <button className={styles.qtyBtn} onClick={() => handleQty(item, -1)}>−</button>
                            <span className={styles.qtyValue}>{item.quantity}</span>
                            <button className={styles.qtyBtn} onClick={() => handleQty(item, 1)}>+</button>
                            <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>× {qtyLabel(item)}</span>
                            {isLow && <span className={styles.lowStockChip}>Low</span>}
                          </div>
                          {totalLabel(item) && (
                            <div className={styles.itemMeta}>{totalLabel(item)}</div>
                          )}
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--color-text-secondary)' }}>
                          {item.expirationDate ? formatDate(item.expirationDate) : '—'}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          {item.expirationDate
                            ? <Badge variant={expBadge.variant}>{expBadge.label}</Badge>
                            : <Badge variant="neutral">No expiry</Badge>
                          }
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <div className={styles.actions}>
                            <button className={styles.actionBtn} onClick={() => openEdit(item)}>Edit</button>
                            <button className={`${styles.actionBtn} ${styles.del}`} onClick={() => setDeleteConfirm(item)}>Delete</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* ── Mobile cards ──────────────────────────────────────── */}
            <div className={styles.mobileCards}>
              {items.map(item => {
                const expBadge = getExpiryBadgeInfo(item.expirationDate);
                const isLow = item.quantity <= (item.minimumThreshold ?? 0) && (item.minimumThreshold ?? 0) > 0;
                return (
                  <div key={item._id} className={styles.mobileCard}>
                    <div className={styles.mobileCardTop}>
                      <div>
                        <div className={styles.mobileCardTitle}>{item.itemName}</div>
                        {item.brand && <div className={styles.mobileCardBrand}>{item.brand}</div>}
                      </div>
                      <div className={styles.actions}>
                        <button className={styles.actionBtn} onClick={() => openEdit(item)}>Edit</button>
                        <button className={`${styles.actionBtn} ${styles.del}`} onClick={() => setDeleteConfirm(item)}>Del</button>
                      </div>
                    </div>
                    <div className={styles.mobileCardMeta}>
                      {item.categoryId?.name && (
                        <span className={styles.mobileCardMetaItem}>📂 {item.categoryId.name}</span>
                      )}
                      {item.locationId?.name && (
                        <span className={styles.mobileCardMetaItem}>📍 {item.locationId.name}</span>
                      )}
                      {item.expirationDate && (
                        <span className={styles.mobileCardMetaItem}>🕐 {formatDate(item.expirationDate)}</span>
                      )}
                    </div>
                    <div className={styles.mobileCardBottom}>
                      <div className={styles.qtyCell}>
                        <button className={styles.qtyBtn} onClick={() => handleQty(item, -1)}>−</button>
                        <span className={styles.qtyValue}>{item.quantity}</span>
                        <button className={styles.qtyBtn} onClick={() => handleQty(item, 1)}>+</button>
                        <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>× {qtyLabel(item)}</span>
                        {isLow && <span className={styles.lowStockChip}>Low</span>}
                      </div>
                      {item.expirationDate
                        ? <Badge variant={expBadge.variant}>{expBadge.label}</Badge>
                        : <Badge variant="neutral">No expiry</Badge>
                      }
                    </div>
                    {totalLabel(item) && (
                      <div className={styles.itemMeta} style={{ marginTop: 6 }}>{totalLabel(item)}</div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {pagination && pagination.total > pagination.limit && (
              <div className={styles.pagination}>
                <span>
                  Showing {(pagination.page - 1) * pagination.limit + 1}–
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
                </span>
                <div className={styles.paginationBtns}>
                  <button className={styles.pageBtn} disabled={page === 1} onClick={() => setPage(1)}>«</button>
                  <button className={styles.pageBtn} disabled={page === 1} onClick={() => setPage(p => p - 1)}>‹</button>
                  {[...Array(totalPages)].map((_, i) => (
                    <button key={i} className={`${styles.pageBtn} ${page === i+1 ? styles.current : ''}`} onClick={() => setPage(i+1)}>
                      {i+1}
                    </button>
                  ))}
                  <button className={styles.pageBtn} disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>›</button>
                  <button className={styles.pageBtn} disabled={page === totalPages} onClick={() => setPage(totalPages)}>»</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Add / Edit modal */}
      <Modal
        open={showModal}
        onClose={() => { setShowModal(false); dispatch(clearSelectedItem()); }}
        title={isEditing ? 'Edit Item' : 'Add Inventory Item'}
        footer={
          <>
            <Button variant="secondary" onClick={() => { setShowModal(false); dispatch(clearSelectedItem()); }}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSave} loading={saving}>
              {isEditing ? 'Save Changes' : 'Add Item'}
            </Button>
          </>
        }
      >
        <div className={styles.formGrid}>
          <div className={styles.formGridFull}>
            <Input label="Item name" value={form.itemName} onChange={e => fc('itemName', e.target.value)} error={formErrors.itemName} required placeholder="e.g. Whole Milk" />
          </div>
          <Select label="Category" options={catOptions} placeholder="— No category —" value={form.categoryId} onChange={e => fc('categoryId', e.target.value)} />
          <Select label="Location" options={locOptions} placeholder="— No location —" value={form.locationId} onChange={e => fc('locationId', e.target.value)} />

          {/* Unit row: unit selector + optional size per unit */}
          <Select
            label="Unit"
            options={unitOptions}
            value={form.unit}
            onChange={e => { fc('unit', e.target.value); if (!SIZED_UNITS.includes(e.target.value as Unit)) fc('unitSize', ''); }}
            required
          />
          <Input
            label={showSizeField ? `Size per unit (${form.unit})` : 'Size per unit (select g/ml/kg… to enable)'}
            type="number"
            min="0"
            step="any"
            placeholder={showSizeField ? `e.g. 500` : '—'}
            value={form.unitSize}
            onChange={e => fc('unitSize', e.target.value)}
            error={formErrors.unitSize}
            disabled={!showSizeField}
          />

          {/* Quantity + threshold */}
          <Input
            label={`No. of ${form.unitSize && showSizeField ? `${form.unitSize} ${form.unit} units` : form.unit}`}
            type="number"
            min="0"
            value={form.quantity}
            onChange={e => fc('quantity', e.target.value)}
            error={formErrors.quantity}
            required
          />
          <Input
            label={`Min threshold (units, auto-adds to shopping list)`}
            type="number"
            min="0"
            value={form.minimumThreshold}
            onChange={e => fc('minimumThreshold', e.target.value)}
            error={formErrors.minimumThreshold}
          />

          {/* Preview */}
          {form.unitSize && showSizeField && Number(form.quantity) > 0 && (
            <div className={styles.formGridFull}>
              <div className={styles.unitPreview}>
                📦 {form.quantity} × {form.unitSize} {form.unit}
                &nbsp;=&nbsp;
                <strong>{Number(form.quantity) * Number(form.unitSize)} {form.unit}</strong> total
                &nbsp;·&nbsp; min threshold: {form.minimumThreshold} units
              </div>
            </div>
          )}

          <Input label="Expiration date" type="date" value={form.expirationDate} onChange={e => fc('expirationDate', e.target.value)} />
          <Input label="Brand (optional)" value={form.brand} onChange={e => fc('brand', e.target.value)} placeholder="e.g. Organic Valley" />
          <div className={styles.formGridFull}>
            <Textarea label="Notes (optional)" value={form.notes} onChange={e => fc('notes', e.target.value)} placeholder="Any notes…" />
          </div>
        </div>
      </Modal>

      {/* Delete confirmation */}
      <Modal
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Delete Item"
        maxWidth={400}
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button variant="danger" onClick={() => deleteConfirm && handleDelete(deleteConfirm)}>
              Yes, delete
            </Button>
          </>
        }
      >
        <p style={{ fontSize: 15, color: 'var(--color-text-secondary)' }}>
          Delete <strong>{deleteConfirm?.itemName}</strong>? This cannot be undone.
        </p>
      </Modal>

      {/* Barcode scanner */}
      {showScanner && (
        <BarcodeScanner
          onClose={() => setShowScanner(false)}
          onUseProduct={handleScannedProduct}
        />
      )}
    </div>
  );
}
