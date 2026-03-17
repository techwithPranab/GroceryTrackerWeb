'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import type { IScannerControls } from '@zxing/browser';
import styles from './BarcodeScanner.module.css';

type ScanStatus = 'idle' | 'scanning' | 'found' | 'error' | 'notfound';

export interface ScannedProduct {
  barcode: string;
  name: string;
  brand: string;
  quantity: string;
  imageUrl: string;
  category: string;
}

interface Props {
  onClose: () => void;
  onUseProduct: (product: ScannedProduct) => void;
}

async function lookupBarcode(barcode: string): Promise<ScannedProduct | null> {
  try {
    const res = await fetch(
      `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`
    );
    const data = await res.json();
    if (data.status !== 1) return null;
    const p = data.product;
    return {
      barcode,
      name: p.product_name ?? '',
      brand: p.brands ?? '',
      quantity: p.quantity ?? '',
      imageUrl: p.image_front_url ?? '',
      category:
        p.categories_tags?.[0]?.replace('en:', '').replace(/-/g, ' ') ?? '',
    };
  } catch {
    return null;
  }
}

export default function BarcodeScanner({ onClose, onUseProduct }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [status, setStatus] = useState<ScanStatus>('idle');
  const [product, setProduct] = useState<ScannedProduct | null>(null);
  const [manualInput, setManualInput] = useState('');
  const [torchOn, setTorchOn] = useState(false);
  const [camError, setCamError] = useState('');

  const stopCamera = useCallback(() => {
    try { controlsRef.current?.stop(); } catch { /* ignore */ }
    controlsRef.current = null;
    try { streamRef.current?.getTracks().forEach((t) => t.stop()); } catch { /* ignore */ }
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  const handleBarcodeFound = useCallback(
    async (code: string) => {
      stopCamera();
      setStatus('scanning');
      const result = await lookupBarcode(code);
      if (result) {
        setProduct(result);
        setStatus('found');
      } else {
        setProduct({ barcode: code, name: '', brand: '', quantity: '', imageUrl: '', category: '' });
        setStatus('notfound');
      }
    },
    [stopCamera]
  );

  const startScanner = useCallback(async () => {
    stopCamera();
    setStatus('idle');
    setProduct(null);
    setCamError('');
    setManualInput('');

    if (!videoRef.current) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      await videoRef.current.play();

      const { BrowserMultiFormatReader } = await import('@zxing/browser');
      const reader = new BrowserMultiFormatReader();
      const controls = await reader.decodeFromStream(
        stream,
        videoRef.current,
        (result, _err, ctrl) => {
          if (result) {
            ctrl.stop();
            handleBarcodeFound(result.getText());
          }
        }
      );
      controlsRef.current = controls;
      setStatus('scanning');
    } catch (err: unknown) {
      const msg = (err as Error).message ?? 'Camera access denied';
      setCamError(msg);
      setStatus('error');
    }
  }, [handleBarcodeFound, stopCamera]);

  useEffect(() => {
    startScanner();
    return () => { stopCamera(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTorch = async () => {
    if (!controlsRef.current?.switchTorch) return;
    const next = !torchOn;
    await controlsRef.current.switchTorch(next);
    setTorchOn(next);
  };

  const handleManualLookup = async () => {
    const code = manualInput.trim();
    if (!code) return;
    await handleBarcodeFound(code);
  };

  return (
    <div
      className={styles.overlay}
      onClick={(e) => { if (e.target === e.currentTarget) { stopCamera(); onClose(); } }}
    >
      <div className={styles.modal}>

        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerTitle}>
            <span>📷</span>
            <span>Scan Barcode</span>
          </div>
          <button className={styles.closeBtn} onClick={() => { stopCamera(); onClose(); }}>✕</button>
        </div>

        {/* Video */}
        <div className={styles.videoWrapper}>
          <video ref={videoRef} className={styles.video} playsInline muted />
          {status === 'scanning' && (
            <>
              <div className={styles.scanLine} />
              <div className={styles.aimBox} />
            </>
          )}
          {status === 'error' && (
            <div className={styles.cameraError}>
              <div className={styles.cameraErrorIcon}>📷</div>
              <p>{camError || 'Camera unavailable'}</p>
              <button className={styles.retryBtn} onClick={startScanner}>Try Again</button>
            </div>
          )}
          {controlsRef.current?.switchTorch && (
            <button
              className={`${styles.torchBtn} ${torchOn ? styles.torchOn : ''}`}
              onClick={handleTorch}
            >
              {torchOn ? '🔦 On' : '🔦 Off'}
            </button>
          )}
        </div>

        {/* Status */}
        <div className={styles.statusRow}>
          {status === 'idle' && <span className={`${styles.statusBadge} ${styles.statusIdle}`}>Initializing camera…</span>}
          {status === 'scanning' && <span className={`${styles.statusBadge} ${styles.statusScanning}`}>⚡ Scanning — point camera at barcode</span>}
          {status === 'found' && <span className={`${styles.statusBadge} ${styles.statusFound}`}>✅ Product found!</span>}
          {status === 'notfound' && <span className={`${styles.statusBadge} ${styles.statusNotFound}`}>⚠️ Unknown barcode — fill details manually</span>}
        </div>

        {/* Product result */}
        {product && (
          <div className={styles.resultCard}>
            {product.imageUrl && (
              <img src={product.imageUrl} alt={product.name} className={styles.productImage} />
            )}
            <div className={styles.resultInfo}>
              <div className={styles.resultBarcode}>#{product.barcode}</div>
              <div className={styles.resultName}>{product.name || <em>Unknown product</em>}</div>
              <div className={styles.resultMeta}>
                {product.brand && <span>🏷 {product.brand}</span>}
                {product.quantity && <span>⚖️ {product.quantity}</span>}
                {product.category && <span>📂 {product.category}</span>}
              </div>
              <div className={styles.resultActions}>
                <button className={styles.prefillBtn} onClick={() => product && onUseProduct(product)}>✚ Use This Product</button>
                <button className={styles.rescanBtn} onClick={startScanner}>🔄 Re-scan</button>
              </div>
            </div>
          </div>
        )}

        {/* Manual */}
        <div className={styles.manualSection}>
          <p className={styles.manualLabel}>Or enter barcode manually:</p>
          <div className={styles.manualRow}>
            <input
              className={styles.manualInput}
              placeholder="e.g. 0012000161155"
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleManualLookup()}
            />
            <button className={styles.manualBtn} onClick={handleManualLookup}>Look Up</button>
          </div>
        </div>

        <p className={styles.instructions}>
          Supports EAN-13, EAN-8, UPC-A, UPC-E, Code128 and more. Requires camera permission.
        </p>

      </div>
    </div>
  );
}
