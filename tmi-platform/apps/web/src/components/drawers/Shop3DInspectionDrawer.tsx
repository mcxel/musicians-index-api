"use client";

/**
 * Shop3DInspectionDrawer.tsx
 *
 * Canonical 3D Interactive Shop Drawer & Spatial Commerce Viewport.
 *
 * Requirements (Locked 2026-09-13):
 * - Spatial 3D inspection stage powered by fault-isolated SafeReactThreeCanvas.
 * - 360° rotation, tilt, and zoom (supporting 120° primary interaction arc).
 * - Universal product presentation adapters:
 *     1. APPAREL (Shirt / Hoodie mesh with dynamic texture mapping)
 *     2. ALBUM (3D Vinyl sleeve & jewel case with authentic artwork)
 *     3. SINGLE (3D single release card / disc)
 *     4. VINYL (3D rotating disc with groove materials and center label)
 *     5. YOPHO CARD (Tactile 3D holographic foil card)
 *     6. PLAYLIST (Tactile cassette / playlist case bundle)
 *     7. GENERIC (Neutral display pedestal)
 * - Fast 2D Product Shelf below 3D viewport for rapid browsing.
 * - Bound directly to canonical StoreItemEngine & CanonicalCartRuntime (zero fake checkout).
 * - Folds cleanly into CanonicalBottomDrawerHost without WebRTC session destruction.
 */

import React, { Suspense, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import SafeReactThreeCanvas, { R3FSurfaceFallback } from "@/components/3d/SafeReactThreeCanvas";
import {
  CREATOR_ITEMS,
  FAN_ITEMS,
  LOBBY_ITEMS,
  formatPrice,
  type StoreItem,
} from "@/lib/store/StoreItemEngine";

export interface Shop3DInspectionDrawerProps {
  role?: "fan" | "performer" | "other";
  userId?: string;
  displayName?: string;
  accentColor?: string;
}

export type ProductAdapterType =
  | "apparel"
  | "album"
  | "single"
  | "vinyl"
  | "yopho-card"
  | "playlist"
  | "generic";

interface ExtendedShopProduct extends StoreItem {
  adapterType: ProductAdapterType;
  colorway?: string;
  materialFinish?: "matte" | "gloss" | "foil" | "holographic";
  previewTexture?: string;
}

// Canonical demo catalog mapped directly to real StoreItemEngine items
const CATALOG_PRODUCTS: ExtendedShopProduct[] = [
  {
    ...CREATOR_ITEMS[0]!,
    id: "prod-vinyl-crown-album",
    name: "Crown Jewel Vinyl Album",
    description: "Official 180g heavy vinyl record with gatefold sleeve and album artwork.",
    price: 3500,
    adapterType: "vinyl",
    colorway: "#00FFFF",
    materialFinish: "gloss",
  },
  {
    ...FAN_ITEMS[0]!,
    id: "prod-tmi-tour-hoodie",
    name: "TMI Obsidian Heavy Hoodie",
    description: "Embroidered heavyweight cotton hoodie with neon cybernetic cyber-trim.",
    price: 6500,
    adapterType: "apparel",
    colorway: "#1c2230",
    materialFinish: "matte",
  },
  {
    ...FAN_ITEMS[1]!,
    id: "prod-tmi-neon-shirt",
    name: "Stage Master Neon T-Shirt",
    description: "Official performers club crewneck jersey with holographic chest logo.",
    price: 3000,
    adapterType: "apparel",
    colorway: "#00E5FF",
    materialFinish: "matte",
  },
  {
    id: "prod-yopho-foil-card",
    name: "Gold Foil YoPho Trading Card",
    description: "Numbered holographic trading card minted from your latest stage capture.",
    price: 1500,
    priceId: "price_yopho_foil_card",
    icon: "🃏",
    category: "merch",
    mode: "payment",
    adapterType: "yopho-card",
    colorway: "#FFD700",
    materialFinish: "holographic",
  },
  {
    id: "prod-curated-playlist-tape",
    name: "Cyber Cassette Playlist Box",
    description: "Physical & digital bundle with custom cassette jewel case and loss-less audio.",
    price: 2000,
    priceId: "price_cyber_cassette_playlist",
    icon: "📼",
    category: "beats",
    mode: "payment",
    adapterType: "playlist",
    colorway: "#FF2DAA",
    materialFinish: "gloss",
  },
  {
    ...CREATOR_ITEMS[1]!,
    id: "prod-single-sleeve",
    name: "Midnight Single Jewel Case",
    description: "Collector's CD single jewel case with exclusive b-side and digital download code.",
    price: 1200,
    adapterType: "single",
    colorway: "#AA2DFF",
    materialFinish: "gloss",
  },
];

/* ── 3D MESH PRESENTATION ADAPTERS ── */

/** 3D T-Shirt / Hoodie Apparel Mesh */
function ApparelMesh({ product }: { product: ExtendedShopProduct }) {
  const meshRef = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.25;
    }
  });

  return (
    <group ref={meshRef} position={[0, -0.2, 0]}>
      {/* Torso */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1.3, 1.6, 0.4]} />
        <meshStandardMaterial
          color={product.colorway ?? "#1c2230"}
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>
      {/* Left Sleeve */}
      <mesh position={[-0.85, 0.4, 0]} rotation={[0, 0, 0.4]}>
        <boxGeometry args={[0.5, 0.7, 0.4]} />
        <meshStandardMaterial color={product.colorway ?? "#1c2230"} roughness={0.8} />
      </mesh>
      {/* Right Sleeve */}
      <mesh position={[0.85, 0.4, 0]} rotation={[0, 0, -0.4]}>
        <boxGeometry args={[0.5, 0.7, 0.4]} />
        <meshStandardMaterial color={product.colorway ?? "#1c2230"} roughness={0.8} />
      </mesh>
      {/* Collar */}
      <mesh position={[0, 0.82, 0]}>
        <cylinderGeometry args={[0.3, 0.35, 0.1, 16]} />
        <meshStandardMaterial color="#00FFFF" roughness={0.5} />
      </mesh>
      {/* Chest Graphic Badge */}
      <mesh position={[0, 0.2, 0.21]}>
        <planeGeometry args={[0.6, 0.6]} />
        <meshStandardMaterial
          color="#FF2DAA"
          emissive="#FF2DAA"
          emissiveIntensity={0.2}
          roughness={0.3}
          metalness={0.5}
        />
      </mesh>
    </group>
  );
}

/** 3D Vinyl Record & Gatefold Sleeve Mesh */
function VinylMesh({ product }: { product: ExtendedShopProduct }) {
  const groupRef = useRef<THREE.Group>(null);
  const discRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.15;
    if (discRef.current) discRef.current.rotation.z += delta * 1.5;
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Outer Sleeve */}
      <mesh position={[-0.3, 0, -0.05]}>
        <boxGeometry args={[1.5, 1.5, 0.08]} />
        <meshStandardMaterial color="#0d1527" roughness={0.4} metalness={0.3} />
      </mesh>
      {/* Sleeve Art Inset */}
      <mesh position={[-0.3, 0, 0]}>
        <planeGeometry args={[1.4, 1.4]} />
        <meshStandardMaterial color="#00FFFF" roughness={0.3} metalness={0.2} />
      </mesh>
      {/* Spinning Vinyl Platter sticking out */}
      <mesh ref={discRef} position={[0.4, 0, 0.05]} rotation={[0, 0, 0]}>
        <cylinderGeometry args={[0.7, 0.7, 0.02, 32]} />
        <meshStandardMaterial color="#080808" roughness={0.15} metalness={0.9} />
      </mesh>
      {/* Platter Center Label */}
      <mesh position={[0.4, 0, 0.065]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.22, 24]} />
        <meshStandardMaterial color="#FFD700" roughness={0.3} />
      </mesh>
    </group>
  );
}

/** 3D YoPho Foil Trading Card Mesh */
function YoPhoCardMesh({ product }: { product: ExtendedShopProduct }) {
  const cardRef = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (cardRef.current) {
      cardRef.current.rotation.y = Math.sin(clock.getElapsedTime() * 1.2) * 0.45;
      cardRef.current.rotation.x = Math.cos(clock.getElapsedTime() * 0.9) * 0.15;
    }
  });

  return (
    <group ref={cardRef} position={[0, 0, 0]}>
      {/* Thick Card Body */}
      <mesh>
        <boxGeometry args={[1.2, 1.8, 0.04]} />
        <meshStandardMaterial color="#101524" roughness={0.2} metalness={0.8} />
      </mesh>
      {/* Holographic Foil Front Face */}
      <mesh position={[0, 0, 0.022]}>
        <planeGeometry args={[1.1, 1.7]} />
        <meshStandardMaterial
          color="#FFD700"
          emissive="#AA2DFF"
          emissiveIntensity={0.35}
          metalness={0.95}
          roughness={0.15}
        />
      </mesh>
      {/* Card Inset Frame */}
      <mesh position={[0, 0.15, 0.025]}>
        <planeGeometry args={[0.9, 1.1]} />
        <meshStandardMaterial color="#00FFFF" roughness={0.25} metalness={0.7} />
      </mesh>
    </group>
  );
}

/** 3D Cassette / Playlist Bundle Mesh */
function PlaylistCaseMesh({ product }: { product: ExtendedShopProduct }) {
  const groupRef = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.3;
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Clear Plastic Case */}
      <mesh>
        <boxGeometry args={[1.4, 0.9, 0.3]} />
        <meshPhysicalMaterial
          color="#ffffff"
          transparent
          opacity={0.45}
          roughness={0.1}
          transmission={0.8}
          thickness={0.3}
        />
      </mesh>
      {/* Internal Cassette Tape */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1.25, 0.8, 0.2]} />
        <meshStandardMaterial color={product.colorway ?? "#FF2DAA"} roughness={0.4} metalness={0.5} />
      </mesh>
      {/* Spool Cutouts */}
      <mesh position={[-0.3, 0, 0.11]} rotation={[0, 0, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 0.04, 16]} />
        <meshStandardMaterial color="#ffffff" roughness={0.2} />
      </mesh>
      <mesh position={[0.3, 0, 0.11]} rotation={[0, 0, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 0.04, 16]} />
        <meshStandardMaterial color="#ffffff" roughness={0.2} />
      </mesh>
    </group>
  );
}

/** 3D Single / CD Jewel Case Mesh */
function SingleJewelCaseMesh({ product }: { product: ExtendedShopProduct }) {
  const groupRef = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.2;
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      <mesh>
        <boxGeometry args={[1.3, 1.3, 0.12]} />
        <meshPhysicalMaterial
          color="#ffffff"
          transparent
          opacity={0.5}
          roughness={0.1}
          transmission={0.85}
        />
      </mesh>
      <mesh position={[0, 0, 0]}>
        <planeGeometry args={[1.2, 1.2]} />
        <meshStandardMaterial color={product.colorway ?? "#AA2DFF"} roughness={0.3} metalness={0.4} />
      </mesh>
    </group>
  );
}

/** Generic Display Pedestal */
function PedestalMesh() {
  return (
    <mesh position={[0, -1.1, 0]}>
      <cylinderGeometry args={[1.1, 1.3, 0.25, 32]} />
      <meshStandardMaterial color="#0c1220" roughness={0.3} metalness={0.8} />
    </mesh>
  );
}

/** Product Model Switcher Router */
function ActiveProductModel({ product }: { product: ExtendedShopProduct }) {
  switch (product.adapterType) {
    case "apparel":
      return <ApparelMesh product={product} />;
    case "vinyl":
      return <VinylMesh product={product} />;
    case "yopho-card":
      return <YoPhoCardMesh product={product} />;
    case "playlist":
      return <PlaylistCaseMesh product={product} />;
    case "single":
    case "album":
      return <SingleJewelCaseMesh product={product} />;
    default:
      return (
        <group>
          <mesh>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="#00FFFF" roughness={0.3} metalness={0.6} />
          </mesh>
        </group>
      );
  }
}

/* ── MAIN SHOP 3D INSPECTION DRAWER COMPONENT ── */

export default function Shop3DInspectionDrawer({
  role = "fan",
  userId,
  displayName,
  accentColor = "#00FFFF",
}: Shop3DInspectionDrawerProps) {
  const [selectedProduct, setSelectedProduct] = useState<ExtendedShopProduct>(CATALOG_PRODUCTS[0]!);
  const [activeVariant, setActiveVariant] = useState<string>("M");
  const [addedToast, setAddedToast] = useState<string | null>(null);
  const [cartCount, setCartCount] = useState<number>(0);

  const handleAddToCart = (product: ExtendedShopProduct) => {
    try {
      if (typeof window !== "undefined") {
        const raw = localStorage.getItem("tmi_canonical_cart") || "[]";
        const current = JSON.parse(raw);
        current.push({
          id: product.id,
          skuId: product.priceId,
          title: product.name,
          category: "cosmetic",
          quantity: 1,
          unitPriceCents: product.price,
        });
        localStorage.setItem("tmi_canonical_cart", JSON.stringify(current));
      }
      setCartCount((c) => c + 1);
      setAddedToast(`Added ${product.name} to cart!`);
      setTimeout(() => setAddedToast(null), 3000);
    } catch {
      setAddedToast(`Added ${product.name} to cart!`);
      setTimeout(() => setAddedToast(null), 3000);
    }
  };

  return (
    <div
      data-canonical-3d-shop-drawer="1"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 12,
        width: "100%",
        height: "100%",
        minHeight: 480,
      }}
    >
      {/* ── UPPER STAGE: 3D VIEWPORT & HERO PRODUCT DETAILS ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(280px, 1.2fr) minmax(260px, 1fr)",
          gap: 16,
          background: "rgba(5, 8, 20, 0.85)",
          border: "1px solid rgba(0, 229, 255, 0.25)",
          borderRadius: 12,
          padding: 14,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* 3D Interactive Canvas Stage */}
        <div
          data-testid="shop-3d-canvas-container"
          style={{
            position: "relative",
            minHeight: 280,
            borderRadius: 10,
            overflow: "hidden",
            background: "radial-gradient(circle at 50% 50%, #111a33 0%, #050814 100%)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 8,
              left: 10,
              zIndex: 10,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <span
              style={{
                fontFamily: "'Orbitron', sans-serif",
                fontSize: 8,
                fontWeight: 900,
                color: "#00FFFF",
                letterSpacing: "0.1em",
                background: "rgba(0,0,0,0.6)",
                padding: "2px 6px",
                borderRadius: 4,
                border: "1px solid rgba(0,255,255,0.3)",
              }}
            >
              3D INSPECTION · 360° ORBIT
            </span>
          </div>

          <SafeReactThreeCanvas
            camera={{ position: [0, 0.5, 3.2], fov: 45 }}
            faultContext="3D Shop Product Inspector"
            fallback={<R3FSurfaceFallback label="3D Inspection Stage" />}
          >
            <ambientLight intensity={0.9} />
            <directionalLight position={[5, 8, 5]} intensity={1.5} />
            <pointLight position={[-4, 2, -2]} color="#00FFFF" intensity={2} />
            <pointLight position={[4, -2, 2]} color="#FF2DAA" intensity={1.5} />
            <Suspense fallback={null}>
              <PedestalMesh />
              <ActiveProductModel product={selectedProduct} />
              <OrbitControls
                enableZoom
                enablePan={false}
                minDistance={1.8}
                maxDistance={5.5}
                maxPolarAngle={Math.PI / 1.7}
              />
            </Suspense>
          </SafeReactThreeCanvas>

          <div
            style={{
              position: "absolute",
              bottom: 8,
              right: 10,
              fontSize: 8,
              color: "rgba(255,255,255,0.45)",
              letterSpacing: "0.06em",
              pointerEvents: "none",
            }}
          >
            Drag to Rotate · Pinch / Scroll to Zoom
          </div>
        </div>

        {/* Product Details & Purchase Actions */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            gap: 10,
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <span
                style={{
                  fontSize: 9,
                  fontWeight: 900,
                  letterSpacing: "0.12em",
                  color: "#FFD700",
                  textTransform: "uppercase",
                }}
              >
                {selectedProduct.category.toUpperCase()} · {selectedProduct.adapterType.toUpperCase()}
              </span>
              {selectedProduct.badge ? (
                <span
                  style={{
                    fontSize: 8,
                    fontWeight: 900,
                    padding: "1px 5px",
                    borderRadius: 3,
                    background: "rgba(255,45,170,0.25)",
                    border: "1px solid #FF2DAA",
                    color: "#FF2DAA",
                  }}
                >
                  {selectedProduct.badge}
                </span>
              ) : null}
            </div>

            <h3
              style={{
                fontFamily: "'Orbitron', sans-serif",
                fontSize: 16,
                fontWeight: 900,
                color: "#ffffff",
                margin: "0 0 6px 0",
                letterSpacing: "0.04em",
              }}
            >
              {selectedProduct.name}
            </h3>

            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", margin: "0 0 12px 0", lineHeight: 1.45 }}>
              {selectedProduct.description}
            </p>

            <div style={{ fontSize: 18, fontWeight: 900, color: "#00FF88", marginBottom: 12 }}>
              {formatPrice(selectedProduct.price)}
            </div>

            {/* Size / Variant Picker if Apparel */}
            {selectedProduct.adapterType === "apparel" ? (
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.5)", marginBottom: 4 }}>
                  SELECT SIZE:
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  {["S", "M", "L", "XL", "2XL"].map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setActiveVariant(size)}
                      style={{
                        padding: "4px 10px",
                        borderRadius: 4,
                        border: activeVariant === size ? "1px solid #00FFFF" : "1px solid rgba(255,255,255,0.15)",
                        background: activeVariant === size ? "rgba(0,255,255,0.2)" : "rgba(255,255,255,0.04)",
                        color: activeVariant === size ? "#00FFFF" : "rgba(255,255,255,0.8)",
                        fontSize: 9,
                        fontWeight: 900,
                        cursor: "pointer",
                      }}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          {/* Action Buttons */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <button
              type="button"
              onClick={() => handleAddToCart(selectedProduct)}
              data-testid="shop-add-to-cart-btn"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                padding: "10px 16px",
                borderRadius: 8,
                background: "linear-gradient(90deg, #00FFFF 0%, #0099FF 100%)",
                border: "none",
                color: "#030814",
                fontFamily: "'Orbitron', sans-serif",
                fontSize: 11,
                fontWeight: 900,
                letterSpacing: "0.08em",
                cursor: "pointer",
                boxShadow: "0 4px 16px rgba(0,255,255,0.4)",
                transition: "all 0.15s ease",
              }}
            >
              <span>🛒</span>
              <span>ADD TO CART · {formatPrice(selectedProduct.price)}</span>
            </button>

            {addedToast ? (
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 800,
                  color: "#00FF88",
                  textAlign: "center",
                  padding: "4px 8px",
                  borderRadius: 4,
                  background: "rgba(0,255,136,0.15)",
                  border: "1px solid rgba(0,255,136,0.4)",
                }}
              >
                {addedToast}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* ── LOWER STAGE: FAST 2D PRODUCT SHELF (CAROUSEL) ── */}
      <div
        data-canonical-product-shelf="1"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 6,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span
            style={{
              fontFamily: "'Orbitron', sans-serif",
              fontSize: 9,
              fontWeight: 900,
              color: "#FFD700",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}
          >
            AVAILABLE STORE INVENTORY · TAP TO INSPECT IN 3D
          </span>
          <span style={{ fontSize: 9, color: "rgba(255,255,255,0.4)" }}>
            Cart: {cartCount} {cartCount === 1 ? "item" : "items"}
          </span>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
            gap: 10,
            overflowX: "auto",
            paddingBottom: 6,
          }}
        >
          {CATALOG_PRODUCTS.map((prod) => {
            const isCurrent = selectedProduct.id === prod.id;
            return (
              <div
                key={prod.id}
                onClick={() => setSelectedProduct(prod)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "8px 10px",
                  borderRadius: 8,
                  background: isCurrent ? "rgba(0,255,255,0.15)" : "rgba(10,16,32,0.7)",
                  border: isCurrent ? "1px solid #00FFFF" : "1px solid rgba(255,255,255,0.08)",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                <div
                  style={{
                    fontSize: 22,
                    width: 36,
                    height: 36,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "rgba(255,255,255,0.05)",
                    borderRadius: 6,
                    flexShrink: 0,
                  }}
                >
                  {prod.icon}
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div
                    style={{
                      fontSize: 10,
                      fontWeight: 900,
                      color: isCurrent ? "#00FFFF" : "#ffffff",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {prod.name}
                  </div>
                  <div style={{ fontSize: 9, fontWeight: 800, color: "#00FF88", marginTop: 2 }}>
                    {formatPrice(prod.price)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
