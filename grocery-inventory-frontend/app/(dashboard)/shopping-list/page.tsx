'use client';
import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/useAppStore';
import {
  fetchShoppingList, addShoppingItem,
  updateShoppingItem, deleteShoppingItem, clearPurchasedItems,
} from '@/store/slices/shoppingListSlice';
import { fetchInventory } from '@/store/slices/inventorySlice';
import { Badge, EmptyState, LoadingSpinner } from '@/components/ui';
import { ShoppingListItem, Unit } from '@/types';
import toast from 'react-hot-toast';
import styles from './page.module.css';

const PRIORITY_COLOR: Record<string, string> = {
  high: '#ef4444', medium: '#f59e0b', low: '#10b981',
};

const ALL_UNITS = ['pcs', 'kg', 'g', 'lbs', 'oz', 'liters', 'ml', 'bottles', 'cans', 'boxes', 'bags', 'packs', 'dozen'] as const;
const SIZED_UNITS: Unit[] = ['g', 'kg', 'ml', 'liters', 'lbs', 'oz'];

/** Returns the quantity label for an item row, e.g. "3 × 500 g" or "2 pcs" */
const qtyLabel = (item: ShoppingListItem): string => {
  if (item.unitSize && item.unitSize > 0) {
    return `${item.quantityNeeded} × ${item.unitSize} ${item.unit}`;
  }
  return `${item.quantityNeeded} ${item.unit}`;
};

/** Returns the total label, e.g. "1500 g total", or null */
const totalLabel = (item: ShoppingListItem): string | null => {
  if (item.unitSize && item.unitSize > 0) {
    return `${item.quantityNeeded * item.unitSize} ${item.unit} total`;
  }
  return null;
};

export default function ShoppingListPage() {
  const dispatch = useAppDispatch();
  const { items, isLoading: loading } = useAppSelector(s => s.shoppingList);

  const [newName,    setNewName]    = useState('');
  const [newQty,     setNewQty]     = useState('1');
  const [newUnitSize, setNewUnitSize] = useState('');
  const [newUnit,    setNewUnit]    = useState<Unit>('pcs');
  const [newPrio,    setNewPrio]    = useState<'low' | 'medium' | 'high'>('medium');
  const [adding,     setAdding]     = useState(false);

  const showSizeField = SIZED_UNITS.includes(newUnit);

  useEffect(() => { dispatch(fetchShoppingList({})); }, [dispatch]);

  const pending   = items.filter(i => i.status === 'pending');
  const purchased = items.filter(i => i.status === 'purchased');

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setAdding(true);
    try {
      await dispatch(addShoppingItem({
        itemName: newName.trim(),
        quantityNeeded: Number(newQty) || 1,
        unitSize: showSizeField && newUnitSize ? Number(newUnitSize) : null,
        unit: newUnit,
        priority: newPrio,
      })).unwrap();
      setNewName(''); setNewQty('1'); setNewUnitSize('');
      toast.success('Added to shopping list');
    } catch { toast.error('Failed to add item'); }
    finally { setAdding(false); }
  };

  const toggle = async (item: ShoppingListItem) => {
    try {
      const newStatus = item.status === 'pending' ? 'purchased' : 'pending';
      await dispatch(updateShoppingItem({ id: item._id, payload: { status: newStatus } })).unwrap();
      if (newStatus === 'purchased') {
        dispatch(fetchInventory({}));
        toast.success(`"${item.itemName}" purchased — inventory updated!`);
      }
    } catch { toast.error('Failed to update'); }
  };

  const adjustQty = async (item: ShoppingListItem, delta: number) => {
    const next = Math.max(1, (item.quantityNeeded || 1) + delta);
    try {
      await dispatch(updateShoppingItem({ id: item._id, payload: { quantityNeeded: next } })).unwrap();
    } catch { toast.error('Failed to update quantity'); }
  };

  const remove = async (id: string) => {
    try {
      await dispatch(deleteShoppingItem(id)).unwrap();
    } catch { toast.error('Failed to delete'); }
  };

  const handleClear = async () => {
    if (!purchased.length) return;
    if (!confirm(`Clear ${purchased.length} purchased items?`)) return;
    try {
      await dispatch(clearPurchasedItems()).unwrap();
      toast.success('Cleared purchased items');
    } catch { toast.error('Failed to clear'); }
  };

  if (loading && !items.length) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><LoadingSpinner size={36} /></div>;
  }

  return (
    <div className={styles.page}>
      {/* Quick-add form */}
      <form className={styles.toolbar} onSubmit={handleAdd}>
        <div className={styles.addForm}>
          <input
            className={styles.addInput}
            placeholder="Item name (e.g. Almond Milk)…"
            value={newName}
            onChange={e => setNewName(e.target.value)}
          />
          <div className={styles.qtyGroup}>
            <input
              className={styles.addInput}
              type="number" min="1" step="1"
              style={{ width: 64 }}
              value={newQty}
              onChange={e => setNewQty(e.target.value)}
              title="Number of packages"
              placeholder="Qty"
            />
            {showSizeField && (
              <input
                className={styles.addInput}
                type="number" min="0" step="any"
                style={{ width: 76 }}
                value={newUnitSize}
                onChange={e => setNewUnitSize(e.target.value)}
                placeholder="Size"
                title="Size per package (e.g. 500)"
              />
            )}
            <select
              className={styles.select}
              value={newUnit}
              onChange={e => {
                const u = e.target.value as Unit;
                setNewUnit(u);
                if (!SIZED_UNITS.includes(u)) setNewUnitSize('');
              }}
            >
              {ALL_UNITS.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
          <select
            className={styles.select}
            value={newPrio}
            onChange={e => setNewPrio(e.target.value as 'low' | 'medium' | 'high')}
          >
            <option value="high">🔴 High</option>
            <option value="medium">🟡 Medium</option>
            <option value="low">🟢 Low</option>
          </select>
          <button type="submit" className={styles.addBtn} disabled={adding || !newName.trim()}>
            {adding ? '…' : '＋ Add'}
          </button>
        </div>

        {/* Live preview of quantity */}
        {newName.trim() && (
          <div className={styles.addPreview}>
            📦 {newQty || 1}
            {showSizeField && newUnitSize ? ` × ${newUnitSize} ${newUnit} = ${Number(newQty || 1) * Number(newUnitSize)} ${newUnit} total` : ` ${newUnit}`}
            {' · '}
            {newPrio} priority
          </div>
        )}

        {purchased.length > 0 && (
          <button type="button" className={styles.clearBtn} onClick={handleClear}>
            🧹 Clear purchased ({purchased.length})
          </button>
        )}
      </form>

      {items.length === 0 ? (
        <EmptyState
          icon="🛒"
          title="Your shopping list is empty"
          message="Add items above, or they'll appear automatically when inventory runs low."
        />
      ) : (
        <div className={styles.lists}>
          {/* Pending */}
          <div className={styles.listSection}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionTitle}>
                🛒 To Buy
                <span className={styles.countPill}>{pending.length}</span>
              </span>
            </div>
            {pending.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: 14 }}>
                All done! Nothing left to buy.
              </div>
            ) : (
              pending.map(item => (
                <div key={item._id} className={styles.itemRow}>
                  <input
                    type="checkbox"
                    className={styles.checkbox}
                    checked={false}
                    onChange={() => toggle(item)}
                    title="Mark as purchased"
                  />
                  <div className={styles.itemBody}>
                    <div className={styles.itemName}>
                      {item.itemName}
                      {item.autoAdded && <Badge variant="auto">Auto</Badge>}
                    </div>
                    <div className={styles.itemMeta}>
                      <span
                        className={styles.priorityDot}
                        style={{ background: PRIORITY_COLOR[item.priority] }}
                        title={`${item.priority} priority`}
                      />
                      <div className={styles.qtyControl}>
                        <button
                          className={styles.qtyBtn}
                          onClick={() => adjustQty(item, -1)}
                          title="Decrease quantity"
                        >−</button>
                        <span className={styles.qtyValue}>{qtyLabel(item)}</span>
                        <button
                          className={styles.qtyBtn}
                          onClick={() => adjustQty(item, 1)}
                          title="Increase quantity"
                        >+</button>
                      </div>
                      {totalLabel(item) && (
                        <span className={styles.totalBadge}>{totalLabel(item)}</span>
                      )}
                    </div>
                  </div>
                  <button className={styles.deleteBtn} onClick={() => remove(item._id)} title="Remove">✕</button>
                </div>
              ))
            )}
          </div>

          {/* Purchased */}
          <div className={styles.listSection}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionTitle}>
                ✅ Purchased
                <span className={styles.countPill} style={{ background: '#10b981' }}>{purchased.length}</span>
              </span>
            </div>
            {purchased.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: 14 }}>
                Nothing purchased yet.
              </div>
            ) : (
              purchased.map(item => (
                <div key={item._id} className={styles.itemRow}>
                  <input
                    type="checkbox"
                    className={styles.checkbox}
                    checked
                    onChange={() => toggle(item)}
                    title="Mark as pending"
                  />
                  <div className={styles.itemBody}>
                    <div className={`${styles.itemName} ${styles.purchased}`}>{item.itemName}</div>
                    <div className={styles.itemMeta}>
                      <span className={styles.purchasedQty}>{qtyLabel(item)}</span>
                      {totalLabel(item) && (
                        <span className={styles.totalBadge}>{totalLabel(item)}</span>
                      )}
                    </div>
                  </div>
                  <button className={styles.deleteBtn} onClick={() => remove(item._id)} title="Remove">✕</button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
