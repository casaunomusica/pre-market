import React, { useState, useMemo, useEffect, useRef, type Dispatch, type SetStateAction } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShoppingBag, 
  Plus, 
  Minus, 
  MessageCircle, 
  Lock, 
  X, 
  Info,
  ArrowRight,
  FlaskConical,
  Check
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility for tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Types ---

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  capsules: number;
  mg: number;
  icon: string;
  category: 'extract' | 'classic';
  kind: 'mushroom' | 'plant' | 'algae';
  color: string;
  imagePrompt: string;
  infoHeadline?: string;
  adaptationPeriod?: string;
  considerations?: string;
}

interface CartItem {
  product: Product;
  quantity: number;
}

interface MushroomIngredient {
  id: string;
  name: string;
  costPerMg: number;
  color: string;
}

// --- Data ---

const PRODUCTS: Product[] = [
  {
    id: 'melena-extract',
    name: 'Melena de León',
    description: 'Claridad mental · Neuroprotección · Salud digestiva',
    price: 32000,
    capsules: 30,
    mg: 500,
    icon: '🍄',
    category: 'extract',
    kind: 'mushroom',
    color: '#8B7D6B', // More saturated mushroom brown
    imagePrompt: 'Minimalist watercolor botanical illustration of Lion\'s Mane mushroom (Hericium erinaceus), white cascading icicle-like teeth, soft cream background, elegant artistic style, soft edges',
    adaptationPeriod: 'En las primeras semanas puede aparecer distensión o gases leves, especialmente en personas con microbiota sensible. Tomarlo con alimentos sólidos reduce este efecto.',
    considerations: 'Puede enlentecer la coagulación: evitar con anticoagulantes (Warfarina, Aspirina) y suspender 14 días antes de cirugía. Sin datos suficientes en embarazo y lactancia.'
  },
  {
    id: 'reishi-extract',
    name: 'Reishi',
    description: 'Inmunidad · Regulación inflamatoria · Descanso reparador',
    price: 32000,
    capsules: 30,
    mg: 500,
    icon: '🍄',
    category: 'extract',
    kind: 'mushroom',
    color: '#7D2D2D', // Deep reddish brown
    imagePrompt: 'Minimalist watercolor botanical illustration of Reishi mushroom (Ganoderma lucidum), shiny reddish-brown kidney-shaped cap, woody texture, soft beige background, artistic wash',
    adaptationPeriod: 'Algunos usuarios reportan mareos leves o prurito transitorio en los primeros días. La calma mental y la mejora del descanso suelen aparecer de forma gradual en las primeras dos semanas.',
    considerations: 'Inhibe enzimas hepáticas (CYP450): puede elevar niveles de estatinas, antihipertensivos y antidepresivos. Evitar con anticoagulantes y alcohol. Suspender 14 días antes de cirugía.'
  },
  {
    id: 'cordyceps-extract',
    name: 'Cordyceps',
    description: 'Energía celular · Resistencia física · Vitalidad',
    price: 32000,
    capsules: 30,
    mg: 500,
    icon: '🍄',
    category: 'extract',
    kind: 'mushroom',
    color: '#F27D26', // Vibrant orange
    imagePrompt: 'Minimalist watercolor botanical illustration of Cordyceps sinensis, slender orange club-shaped fungi, elegant line art with soft orange washes, warm background',
    adaptationPeriod: 'Puede aparecer sequedad bucal leve en las primeras semanas. La vitalidad y resistencia física suelen notarse de forma progresiva.',
    considerations: 'Puede potenciar hipoglucemiantes (Metformina, insulina) y anticoagulantes. Precaución en enfermedades autoinmunes activas. Suspender 14 días antes de cirugía.'
  },
  {
    id: 'ashwagandha-extract',
    name: 'Ashwagandha',
    description: 'Gestión del estrés · Equilibrio emocional · Relajación sostenida',
    price: 32000,
    capsules: 30,
    mg: 500,
    icon: '🌿',
    category: 'extract',
    kind: 'plant',
    color: '#D4B483', // Earthy yellow/beige
    imagePrompt: 'Minimalist watercolor botanical illustration of Ashwagandha plant (Withania somnifera), small green leaves and red berries, delicate roots, soft earthy background, artistic style',
    adaptationPeriod: 'La reducción del estrés y la mejora del sueño suelen sentirse en las primeras dos semanas. La interrupción abrupta tras uso prolongado puede generar ansiedad o insomnio transitorio.',
    considerations: 'Puede alterar hormonas tiroideas: evitar con medicación tiroidea. Riesgo hepático con paracetamol frecuente o alcohol. Evitar en embarazo. Usamos extracto de raíz, más seguro para el hígado.'
  },
  {
    id: 'tremella-extract',
    name: 'Tremella',
    description: 'Ácido hialurónico vegetal · Hidratación profunda',
    price: 32000,
    capsules: 30,
    mg: 500,
    icon: '🍄',
    category: 'extract',
    kind: 'mushroom',
    color: '#5E9E98', // Darker teal for legibility
    imagePrompt: 'Minimalist watercolor botanical illustration of Tremella mushroom (Snow fungus), translucent white frilly ruffles, jelly-like texture, soft cool background, delicate washes',
    adaptationPeriod: 'Es el adaptógeno de aclimatación más suave del catálogo. Algunos usuarios notan mayor elasticidad en la piel y lubricación articular en las primeras semanas.',
    considerations: 'Puede potenciar hipoglucemiantes (Metformina, insulina). Posible interacción con estatinas y antidepresivos. Suspender 14 días antes de cirugía.'
  },
  {
    id: 'melena-classic',
    name: 'Melena de León · Clásica',
    description: 'Hongo entero molido • 1 o 2 cápsulas por día',
    price: 17000,
    capsules: 30,
    mg: 300,
    icon: '🍄',
    category: 'classic',
    kind: 'mushroom',
    color: '#9E8B85', // Darker muted brown for legibility
    imagePrompt: 'Minimalist watercolor illustration of ground mushroom powder in a wooden spoon, Melena de León texture, soft neutral background, artistic style',
    adaptationPeriod: 'Al ser hongo entero, la liberación de activos es más gradual y la tolerancia digestiva es significativamente mejor que el extracto. Ideal como punto de entrada.',
    considerations: 'Mismas precauciones que el extracto pero con perfil de potencia más bajo. Evitar con anticoagulantes y consultar en caso de embarazo o lactancia.'
  },
  {
    id: 'chlorella-extract',
    name: 'Chlorella',
    description: 'Detox de metales pesados · Sistema inmune · Oxigenación celular',
    price: 16000,
    capsules: 30,
    mg: 500,
    icon: '🌿',
    category: 'extract',
    kind: 'algae',
    color: '#2D6A4F',
    imagePrompt: 'Scientific illustration of Chlorella microalgae cells, vibrant green, clean style, soft cream background',
    infoHeadline: 'Protocolo Detox · 2 semanas · Cada 3 meses',
    adaptationPeriod: 'Puede haber cambios en la frecuencia evacuatoria y gases leves en las primeras semanas por la interacción con la microbiota. Tomar con abundante agua.',
    considerations: 'Contraindicada en Hashimoto activo e hipertiroidismo de Graves por su contenido de yodo. Si tomás Levotiroxina, separar al menos 4 horas.'
  }
];

function normalizeKey(input: string) {
  return input
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove accents
    .replace(/[^a-z0-9]+/g, ' ') // collapse punctuation
    .trim()
    .replace(/\s+/g, '-');
}

const ADAPTOGEN_ALIASES: Record<string, string> = {
  // Spanish / variants
  'melena-de-leon': 'melena-extract',
  'melena-de-leon-clasica': 'melena-classic',
  'melena-de-leon-clasico': 'melena-classic',
  // English common names
  'lions-mane': 'melena-extract',
  'lions-mane-mushroom': 'melena-extract',
  'reishi': 'reishi-extract',
  'cordyceps': 'cordyceps-extract',
  'ashwagandha': 'ashwagandha-extract',
  'tremella': 'tremella-extract',
  'snow-fungus': 'tremella-extract',
  'chlorella': 'chlorella-extract',
};

const MUSHROOM_INGREDIENTS: MushroomIngredient[] = [
  { id: 'cositas', name: 'La Fuerza', costPerMg: 60, color: '#5A5A40' },
  { id: 'melena', name: 'Melena de León', costPerMg: 50, color: '#8B7D6B' },
  { id: 'reishi', name: 'Reishi', costPerMg: 50, color: '#7D2D2D' },
  { id: 'ashwagandha', name: 'Ashwagandha', costPerMg: 50, color: '#D4B483' },
  { id: 'niacina', name: 'Niacina (B3)', costPerMg: 40, color: '#F27D26' }
];

const PRESETS = [
  { id: 'fadiman', name: 'Fadiman Clásico', description: '100 mg La Fuerza', ingredients: { cositas: 100, melena: 0, reishi: 0, ashwagandha: 0, niacina: 0 }, niacinaEnabled: false, ashwagandhaActive: false },
  { id: 'stamets', name: 'Stamets Stack', description: '100 mg La Fuerza, 200 mg Melena, 50 mg Niacina', ingredients: { cositas: 100, melena: 200, reishi: 0, ashwagandha: 0, niacina: 50 }, niacinaEnabled: true, ashwagandhaActive: false },
  { id: 'nocturno', name: 'Nocturno', description: '100 mg La Fuerza, 250 mg Reishi', ingredients: { cositas: 100, melena: 0, reishi: 250, ashwagandha: 0, niacina: 0 }, niacinaEnabled: false, ashwagandhaActive: false }
];

/** Escala La Fuerza (no lineal). Incluye 0 para cupo agotado por otros ingredientes. */
const LA_FUERZA_SLIDER_STEPS = [0, 50, 100, 150, 200, 250, 300, 350] as const;

function laFuerzaSliderIndexFromMg(mg: number): number {
  const i = LA_FUERZA_SLIDER_STEPS.indexOf(mg as (typeof LA_FUERZA_SLIDER_STEPS)[number]);
  if (i >= 0) return i;
  let best = 0;
  let bestDiff = Infinity;
  LA_FUERZA_SLIDER_STEPS.forEach((v, idx) => {
    const d = Math.abs(v - mg);
    if (d < bestDiff) {
      bestDiff = d;
      best = idx;
    }
  });
  return best;
}

function laFuerzaMgFromSliderIndex(index: number, maxCosMg: number): number {
  const desired = LA_FUERZA_SLIDER_STEPS[Math.min(Math.max(0, index), LA_FUERZA_SLIDER_STEPS.length - 1)];
  const capped = Math.min(desired, maxCosMg);
  const valid = LA_FUERZA_SLIDER_STEPS.filter(m => m <= maxCosMg);
  if (valid.length === 0) return 0;
  const fits = LA_FUERZA_SLIDER_STEPS.filter(m => m <= capped);
  return fits.length ? fits[fits.length - 1]! : valid[valid.length - 1]!;
}

const WHATSAPP_NUMBER = '5493515915643';
const PRODUCER_NAME = 'Charlie';

interface CustomMixRecipe {
  ingredients: { [key: string]: number };
  isAshwagandhaActive: boolean;
  isNiacinaEnabled: boolean;
}

interface CustomMix extends CustomMixRecipe {
  jars: number; // frascos de esta mezcla a agregar al pedido
}

interface CustomMixCartItem {
  recipe: CustomMixRecipe;
  quantity: number;
}

const CUSTOM_MIX_MAX_JARS = 4;
const CUSTOM_MIX_BASE_FEE = 5500;

const DEFAULT_CUSTOM_MIX: CustomMix = {
  ingredients: {
    cositas: 100,
    melena: 0,
    reishi: 0,
    ashwagandha: 0,
    niacina: 0
  },
  jars: 1,
  isAshwagandhaActive: false,
  isNiacinaEnabled: false
};

function customMixDiscountRate(totalJars: number): number {
  if (totalJars >= 4) return 0.20;
  if (totalJars >= 2) return 0.10;
  return 0;
}

function computeCustomMixJarCost(recipe: CustomMixRecipe): number {
  const { ingredients, isAshwagandhaActive, isNiacinaEnabled } = recipe;
  const A_cos = ingredients.cositas || 0;
  const A_mel = ingredients.melena || 0;
  const A_adapt = isAshwagandhaActive
    ? (ingredients.ashwagandha || 0)
    : (ingredients.reishi || 0);
  const A_nia = isNiacinaEnabled ? (ingredients.niacina || 0) : 0;

  const C_ing_cap =
    (A_cos / 1000) * 10000 +
    (A_mel / 1000) * 760 +
    (A_adapt / 1000) * 760 +
    (A_nia / 1000) * 100;

  return 16 * C_ing_cap + 3382;
}

function customMixCartTotalJars(cart: CustomMixCartItem[]): number {
  return cart.reduce((acc, item) => acc + item.quantity, 0);
}

function computeCustomCartPricing(cart: CustomMixCartItem[]) {
  const subtotal = cart.reduce(
    (acc, item) => acc + item.quantity * computeCustomMixJarCost(item.recipe),
    0
  );
  const totalJars = customMixCartTotalJars(cart);
  const discountRate = customMixDiscountRate(totalJars);
  const subtotalConDescuento = subtotal * (1 - discountRate);
  const totalSinDescuento = Math.round((subtotal + CUSTOM_MIX_BASE_FEE) / 100) * 100;
  const totalFinal = Math.round((subtotalConDescuento + CUSTOM_MIX_BASE_FEE) / 100) * 100;

  return {
    subtotal,
    subtotalConDescuento,
    totalSinDescuento,
    totalFinal,
    discountRate,
    totalJars,
    descuentoAplicado: discountRate > 0
  };
}

function customMixRecipesEqual(a: CustomMixRecipe, b: CustomMixRecipe): boolean {
  if (a.isAshwagandhaActive !== b.isAshwagandhaActive) return false;
  if (a.isNiacinaEnabled !== b.isNiacinaEnabled) return false;
  const ids = ['cositas', 'melena', 'reishi', 'ashwagandha', 'niacina'] as const;
  return ids.every(id => (a.ingredients[id] ?? 0) === (b.ingredients[id] ?? 0));
}

function customMixRecipeFromBuilder(mix: CustomMix): CustomMixRecipe {
  const { ingredients, isAshwagandhaActive, isNiacinaEnabled } = mix;
  return { ingredients: { ...ingredients }, isAshwagandhaActive, isNiacinaEnabled };
}

function customMixActiveMg(recipe: CustomMixRecipe): number {
  return Object.entries(recipe.ingredients).reduce((acc, [id, mg]) => {
    if (id === 'niacina' && !recipe.isNiacinaEnabled) return acc;
    if (id === 'reishi' && recipe.isAshwagandhaActive) return acc;
    if (id === 'ashwagandha' && !recipe.isAshwagandhaActive) return acc;
    return acc + (mg as number);
  }, 0);
}

function formatCustomMixIngredients(recipe: CustomMixRecipe): string[] {
  return Object.entries(recipe.ingredients)
    .filter(([id, mg]) => {
      if (id === 'niacina' && !recipe.isNiacinaEnabled) return false;
      if (id === 'reishi' && recipe.isAshwagandhaActive) return false;
      if (id === 'ashwagandha' && !recipe.isAshwagandhaActive) return false;
      return (mg as number) > 0;
    })
    .map(([id, mg]) => {
      const name = MUSHROOM_INGREDIENTS.find(i => i.id === id)?.name;
      const suffix = id === 'niacina' ? ' (Stamets)' : '';
      return `${name}: ${mg} mg/cap${suffix}`;
    });
}

// --- Components ---

function ProductImage({ color, productId, alt }: { prompt?: string; color: string; productId: string; alt: string }) {
  const src = `/product-icons/${productId}.png`;
  return (
    <div
      className="w-full h-full flex items-center justify-center"
      style={{ backgroundColor: color + '20' }}
    >
      <img
        src={src}
        alt={alt}
        className="w-[70%] h-[70%] object-contain select-none pointer-events-none"
        draggable={false}
      />
    </div>
  );
}

function ProductCard({ 
  product, 
  quantity, 
  onAdd, 
  onRemove 
}: { 
  product: Product; 
  quantity: number; 
  onAdd: () => void; 
  onRemove: () => void;
  key?: string;
}) {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <div className="bg-white rounded-[32px] p-4 flex flex-col border border-[#2F4F4F]/15 hover:shadow-md transition-all group h-full relative overflow-hidden">
      <AnimatePresence>
        {showInfo && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute inset-0 z-10 bg-[#F0E6D2] flex flex-col min-h-0"
          >
            <button 
              onClick={() => setShowInfo(false)}
              className="absolute top-4 right-4 z-20 shrink-0 p-2 hover:bg-[#2F4F4F]/10 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex-1 overflow-y-auto overscroll-contain min-h-0 pt-14 pb-6 px-6">
              <div className="flex flex-col items-center text-center w-full">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center text-2xl mb-4"
                  style={{ backgroundColor: product.color + '20' }}
                >
                  <img
                    src={`/product-icons/${product.id}.png`}
                    alt={product.name}
                    className="w-[70%] h-[70%] object-contain select-none pointer-events-none"
                    draggable={false}
                  />
                </div>
                <h4 className="font-medium text-base mb-2">{product.name}</h4>
                {product.infoHeadline && (
                  <p className="text-sm font-medium text-[#1a1a1a] mb-3 leading-snug">
                    {product.infoHeadline}
                  </p>
                )}
                <p className="text-sm text-[#2F4F4F]/70 leading-relaxed italic">
                  {product.description}
                </p>
              </div>
              {product.adaptationPeriod && (
                <div className="mt-4 text-left w-full">
                  <p className="text-xs uppercase tracking-widest text-[#2F4F4F]/70 font-sans mb-1">
                    Período de adaptación
                  </p>
                  <p className="text-sm text-[#2F4F4F]/70 leading-relaxed">
                    {product.adaptationPeriod}
                  </p>
                </div>
              )}
              {product.considerations && (
                <div className="mt-3 text-left w-full">
                  <p className="text-xs uppercase tracking-widest text-[#2F4F4F]/70 font-sans mb-1">
                    Consideraciones
                  </p>
                  <p className="text-sm text-[#2F4F4F]/70 leading-relaxed">
                    {product.considerations}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div 
        className="w-full aspect-square rounded-xl flex items-center justify-center text-4xl group-hover:scale-105 transition-transform mb-2 overflow-hidden relative"
        style={{ backgroundColor: product.color + '10' }}
      >
        <ProductImage
          prompt={product.imagePrompt}
          color={product.color}
          productId={product.id}
          alt={product.name}
        />
        <div className="absolute top-3 right-3 flex flex-col gap-2">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setShowInfo(true);
            }}
            className="w-11 h-11 bg-white rounded-full shadow-sm hover:bg-white transition-colors flex items-center justify-center"
          >
            <Info className="w-5 h-5 text-[#2F4F4F]/70" />
          </button>
        </div>
      </div>
      <div className="flex-1 flex flex-col">
        <div className="mb-3">
          <h3 className="font-medium text-base leading-tight mb-1">{product.name}</h3>
          <span className="font-mono text-sm font-bold" style={{ color: product.color }}>
            ${product.price.toLocaleString()}
          </span>
        </div>
        
        <div className="flex flex-col gap-3 mt-auto">
          <span className="text-xs uppercase tracking-widest text-[#2F4F4F]/70 font-sans">
            {product.capsules} caps · {product.mg} mg {product.category === 'extract' && product.id !== 'chlorella-extract' && '· (10:1)'}
          </span>
          
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center justify-between w-full bg-[#F0E6D2] rounded-full p-1">
              <button 
                onClick={onRemove}
                className="w-11 h-11 rounded-full bg-white border border-[#2F4F4F]/15 flex items-center justify-center hover:bg-[#2F4F4F]/10 disabled:opacity-30"
                disabled={quantity === 0}
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className={cn("text-sm font-medium", quantity === 0 && "opacity-30")}>{quantity}</span>
              <button 
                onClick={onAdd}
                className="w-11 h-11 rounded-full text-white flex items-center justify-center hover:opacity-80 transition-opacity"
                style={{ backgroundColor: product.color }}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const IDS_ANTICOAG = ['reishi-extract', 'cordyceps-extract', 'melena-extract', 'melena-classic', 'tremella-extract'] as const;
const IDS_SURGERY = IDS_ANTICOAG;
const IDS_DIABETES = ['tremella-extract', 'cordyceps-extract', 'melena-extract', 'melena-classic'] as const;

function cartHasAnyId(cart: CartItem[], ids: readonly string[]): boolean {
  return cart.some(i => ids.includes(i.product.id));
}

function cloneCart(cart: CartItem[]): CartItem[] {
  return cart.map(item => ({ ...item, product: item.product }));
}

function swapProductInCart(cart: CartItem[], fromId: string, toProduct: Product): CartItem[] {
  const idx = cart.findIndex(i => i.product.id === fromId);
  if (idx === -1) return cart;
  const qty = cart[idx].quantity;
  let next = cart.filter(i => i.product.id !== fromId);
  const existing = next.find(i => i.product.id === toProduct.id);
  if (existing) {
    next = next.map(i =>
      i.product.id === toProduct.id ? { ...i, quantity: i.quantity + qty } : i
    );
  } else {
    next = [...next, { product: toProduct, quantity: qty }];
  }
  return next;
}

/** Quita todos los ids anticoag del carrito y suma cantidades en un único Ashwagandha. */
function swapAllAnticoagToAshwagandha(
  cart: CartItem[],
  anticoagIds: readonly string[],
  ashwagandha: Product
): CartItem[] {
  let qtySum = 0;
  let next = cart.filter(item => {
    if (!anticoagIds.includes(item.product.id)) return true;
    qtySum += item.quantity;
    return false;
  });
  if (qtySum === 0) return cart;
  const existing = next.find(i => i.product.id === 'ashwagandha-extract');
  if (existing) {
    next = next.map(i =>
      i.product.id === 'ashwagandha-extract'
        ? { ...i, quantity: i.quantity + qtySum }
        : i
    );
  } else {
    next = [...next, { product: ashwagandha, quantity: qtySum }];
  }
  return next;
}

function anticoagWarningForId(id: string): string {
  switch (id) {
    case 'reishi-extract':
      return 'El Reishi puede potenciar el efecto anticoagulante y aumentar el riesgo de sangrado.';
    case 'cordyceps-extract':
      return 'El Cordyceps puede potenciar el efecto anticoagulante y aumentar el riesgo de sangrado.';
    case 'melena-extract':
    case 'melena-classic':
      return 'La Melena de León puede enlentecer la coagulación.';
    case 'tremella-extract':
      return 'La Tremella puede afectar la hemodinámica y el riesgo de sangrado.';
    default:
      return '';
  }
}

type SwapUndo = { id: string; label: string; undo: () => void };

type SafetyPhase = 'intro' | 'chlorella' | 'security' | 'melenaFirst' | 'confirm';

type NavFrame = { phase: SafetyPhase; cart: CartItem[] };

function SafetyCheckModal({
  cart,
  products,
  setCart,
  onConfirm,
  onClose,
}: {
  cart: CartItem[];
  products: Product[];
  setCart: Dispatch<SetStateAction<CartItem[]>>;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const productById = useMemo(() => new Map(products.map(p => [p.id, p])), [products]);

  const [showChlorellaStep] = useState(() => cart.some(i => i.product.kind !== 'algae'));
  const firstActivePhase = showChlorellaStep ? ('chlorella' as const) : ('security' as const);
  const [phase, setPhase] = useState<SafetyPhase>('intro');
  const [navStack, setNavStack] = useState<NavFrame[]>(() => [{ phase: 'intro', cart: cloneCart(cart) }]);
  const cartAtOpenRef = useRef<CartItem[] | null>(null);
  if (cartAtOpenRef.current === null) {
    cartAtOpenRef.current = cloneCart(cart);
  }
  const pedidoHeadingShownRef = useRef(false);

  const [chlQ60, setChlQ60] = useState<'yes' | 'no' | null>(null);
  const [chlDur, setChlDur] = useState<'60-90' | '90+' | null>(null);
  const [swapUndos, setSwapUndos] = useState<SwapUndo[]>([]);

  const [p1, setP1] = useState<boolean | null>(null);
  const [p2, setP2] = useState<boolean | null>(null);
  const [p3, setP3] = useState<boolean | null>(null);
  const [p4, setP4] = useState<boolean | null>(null);
  const [p5, setP5] = useState<'hashimoto' | 'graves' | 'levo' | 'no' | null>(null);
  const [p6, setP6] = useState<boolean | null>(null);
  const [p6b, setP6b] = useState<boolean | null>(null);
  const [p7, setP7] = useState<boolean | null>(null);
  const [p8, setP8] = useState<boolean | null>(null);
  const [p9, setP9] = useState<boolean | null>(null);
  const [p10First, setP10First] = useState<boolean | null>(null);

  const showMelenaPhase = cart.some(i => i.product.id === 'melena-extract');
  const showReishiP6bStep = cart.some(i => i.product.id === 'reishi-extract');
  const totalSteps =
    (showChlorellaStep ? 1 : 0) +
    1 +
    (showMelenaPhase ? 1 : 0) +
    1 +
    (showReishiP6bStep ? 1 : 0);
  const stepLabel =
    phase === 'chlorella'
      ? 1
      : phase === 'security'
        ? 1 + (showChlorellaStep ? 1 : 0)
        : phase === 'melenaFirst'
          ? 1 + (showChlorellaStep ? 1 : 0) + 1 + (showReishiP6bStep ? 1 : 0)
          : totalSteps;

  useEffect(() => {
    if (phase === 'intro') return;
    if (stepLabel > 1) pedidoHeadingShownRef.current = true;
  }, [phase, stepLabel]);

  const showPedidoHeading =
    phase !== 'intro' && !pedidoHeadingShownRef.current && stepLabel === 1;

  const confirmPricing = useMemo(() => {
    const bottles = cart.reduce((a, i) => a + i.quantity, 0);
    const subtotal = cart.reduce((a, i) => a + i.product.price * i.quantity, 0);
    const rate = bottles >= 4 ? 0.2 : bottles >= 2 ? 0.1 : 0;
    const discountAmount = subtotal * rate;
    const total = subtotal * (1 - rate);
    return { bottles, subtotal, rate, discountAmount, total };
  }, [cart]);

  const forward = (next: SafetyPhase) => {
    setNavStack(s => [...s, { phase: next, cart: cloneCart(cart) }]);
    setPhase(next);
  };

  const back = () => {
    setNavStack(s => {
      if (s.length <= 1) return s;
      const nextStack = s.slice(0, -1);
      const prev = nextStack[nextStack.length - 1];
      queueMicrotask(() => {
        setPhase(prev.phase);
        setCart(cloneCart(prev.cart));
        setSwapUndos([]);
        if (prev.phase === 'intro' || prev.phase === 'chlorella') {
          setChlQ60(null);
          setChlDur(null);
        }
        if (prev.phase === 'security') {
          setP10First(null);
          setP1(null);
          setP2(null);
          setP3(null);
          setP4(null);
          setP5(null);
          setP6(null);
          setP6b(null);
          setP7(null);
          setP8(null);
          setP9(null);
        }
      });
      return nextStack;
    });
  };

  const leaveChlorellaToSecurity = (explicitCart?: CartItem[]) => {
    const c = explicitCart ?? cart;
    setNavStack(s => {
      if (s.length === 0) return [{ phase: 'intro', cart: cloneCart(c) }];
      const last = s[s.length - 1];
      if (last.phase === 'chlorella') {
        return [...s.slice(0, -1), { phase: 'security', cart: cloneCart(c) }];
      }
      return [...s, { phase: 'security', cart: cloneCart(c) }];
    });
    setPhase('security');
  };

  const leaveChlorellaAfterNo = () => {
    setChlQ60(null);
    setChlDur(null);
    leaveChlorellaToSecurity();
  };

  const pushSwapUndo = (id: string, label: string, before: CartItem[]) => {
    setSwapUndos(u => [
      ...u,
      {
        id,
        label,
        undo: () => {
          setCart(before);
          setSwapUndos(s => s.filter(x => x.id !== id));
        },
      },
    ]);
  };

  const applySwap = (fromId: string, toId: string) => {
    const toProduct = productById.get(toId);
    if (!toProduct) return;
    setCart(prev => {
      const before = cloneCart(prev);
      const after = swapProductInCart(prev, fromId, toProduct);
      const fromName = productById.get(fromId)?.name ?? fromId;
      const id = `swap-${fromId}-${Date.now()}`;
      queueMicrotask(() => pushSwapUndo(id, `${fromName} → ${toProduct.name}`, before));
      return after;
    });
  };

  const applySwapAllAnticoagToAshwagandha = () => {
    const ash = productById.get('ashwagandha-extract');
    if (!ash) return;
    setCart(prev => {
      const before = cloneCart(prev);
      const after = swapAllAnticoagToAshwagandha(prev, IDS_ANTICOAG, ash);
      const id = `swap-anticoag-all-${Date.now()}`;
      queueMicrotask(() =>
        pushSwapUndo(id, 'Productos anticoag → Ashwagandha', before)
      );
      return after;
    });
  };

  const addChlorellaOnce = () => {
    const ch = productById.get('chlorella-extract');
    if (!ch) return;
    setCart(prev => {
      if (prev.some(i => i.product.id === 'chlorella-extract')) return prev;
      const before = cloneCart(prev);
      const id = `chl-add-${Date.now()}`;
      queueMicrotask(() => pushSwapUndo(id, '+ Chlorella (×1)', before));
      return [...prev, { product: ch, quantity: 1 }];
    });
  };

  /** Agrega Chlorella y pasa a seguridad en un mismo paso (sin repetir el texto del ciclo). */
  const addChlorellaAndGoToSecurity = () => {
    const ch = productById.get('chlorella-extract');
    if (!ch) return;
    setCart(prev => {
      if (prev.some(i => i.product.id === 'chlorella-extract')) {
        queueMicrotask(() => leaveChlorellaToSecurity());
        return prev;
      }
      const before = cloneCart(prev);
      const next = [...prev, { product: ch, quantity: 1 }];
      const id = `chl-add-${Date.now()}`;
      queueMicrotask(() => {
        pushSwapUndo(id, '+ Chlorella (×1)', before);
        leaveChlorellaToSecurity(next);
      });
      return next;
    });
  };

  const hasChlorellaInCart = cart.some(i => i.product.id === 'chlorella-extract');

  const goSecurity = () => leaveChlorellaToSecurity();
  const goConfirm = () => forward('confirm');
  const goFromSecurity = () => {
    if (cart.some(i => i.product.id === 'melena-extract')) forward('melenaFirst');
    else forward('confirm');
  };

  /** Cierra el modal y restaura el carrito tal como estaba al abrir (sin cambios del flujo de seguridad). */
  const abortToShopping = () => {
    const snap = cartAtOpenRef.current;
    if (snap) setCart(cloneCart(snap));
    onClose();
  };

  const goBackOne = () => {
    if (phase === 'intro') return;
    if (phase === 'chlorella') {
      if (chlQ60 === 'yes' && chlDur !== null) {
        setChlDur(null);
        return;
      }
      if (chlQ60 === 'yes' && chlDur === null) {
        setChlQ60(null);
        return;
      }
      back();
      return;
    }
    if (navStack.length > 1) {
      back();
      return;
    }
    abortToShopping();
  };

  const renderIntro = () => (
    <div className="flex flex-col justify-center items-center min-h-[min(320px,45vh)] py-6">
      <p className="text-base font-medium text-[#2F4F4F] text-center leading-snug">
        ¿Querés hacer una compra informada?
      </p>
      <p className="text-sm text-[#2F4F4F]/60 text-center mt-2">
        Revisá si lo que elegiste es adecuado para vos.
      </p>
      <div className="flex flex-col gap-3 mt-8 w-full">
        <button
          type="button"
          onClick={() => forward(firstActivePhase)}
          className="w-full rounded-full py-3.5 bg-[#2F4F4F] text-white text-sm font-medium"
        >
          Sí
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="w-full rounded-full py-3.5 border border-[#2F4F4F]/25 text-sm"
        >
          Ir directo
        </button>
      </div>
    </div>
  );

  const renderChlorella = () => {
    if (chlQ60 === null) {
      return (
        <div className="space-y-4">
          <p className="text-sm text-[#2F4F4F]/90 leading-relaxed">
            ¿Estás tomando adaptógenos de forma continua hace 60 días o más?
          </p>
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => setChlQ60('yes')}
              className="rounded-full py-3 px-4 bg-[#2F4F4F] text-white text-sm font-medium"
            >
              Sí
            </button>
            <button
              type="button"
              onClick={leaveChlorellaAfterNo}
              className="rounded-full py-3 px-4 border border-[#2F4F4F]/25 text-sm"
            >
              No
            </button>
          </div>
          <button type="button" onClick={goBackOne} className="w-full rounded-full py-3.5 border border-[#2F4F4F]/25 text-sm">
            Volver
          </button>
        </div>
      );
    }
    if (chlQ60 === 'yes' && chlDur === null) {
      return (
        <div className="space-y-4">
          <p className="text-sm text-[#2F4F4F]/90 leading-relaxed">
            ¿Hace cuánto tiempo aproximadamente?
          </p>
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => setChlDur('60-90')}
              className="rounded-full py-3 px-4 bg-[#2F4F4F] text-white text-sm font-medium"
            >
              Entre 60 y 90 días
            </button>
            <button
              type="button"
              onClick={() => setChlDur('90+')}
              className="rounded-full py-3 px-4 bg-[#2F4F4F] text-white text-sm font-medium"
            >
              Más de 90 días
            </button>
          </div>
          <button type="button" onClick={goBackOne} className="w-full rounded-full py-3.5 border border-[#2F4F4F]/25 text-sm">
            Volver
          </button>
        </div>
      );
    }
    if (chlQ60 === 'yes' && chlDur === '60-90') {
      return (
        <div className="space-y-4 text-left">
          <p className="text-sm text-[#2F4F4F]/80 leading-relaxed">
            Estás cerca de completar un ciclo. Al terminar este mes, dos semanas de Chlorella (2 cápsulas por día) te permiten hacer un reset antes del próximo ciclo.
          </p>
          {!hasChlorellaInCart && (
            <button
              type="button"
              onClick={addChlorellaAndGoToSecurity}
              className="w-full rounded-full py-3 px-4 bg-[#AB5541] text-white text-sm font-medium"
            >
              + Agregar Chlorella al pedido
            </button>
          )}
          <button type="button" onClick={goSecurity} className="w-full rounded-full py-3 px-4 border border-[#2F4F4F]/25 text-sm">
            Continuar
          </button>
          <button type="button" onClick={goBackOne} className="w-full rounded-full py-3.5 border border-[#2F4F4F]/25 text-sm">
            Volver
          </button>
        </div>
      );
    }
    if (chlQ60 === 'yes' && chlDur === '90+') {
      return (
        <div className="space-y-4 text-left">
          <p className="text-sm text-[#2F4F4F]/80 leading-relaxed">
            Llevas un ciclo largo. Lo ideal es empezar por el reset: dos semanas de Chlorella (2 cápsulas por día) antes de arrancar con los adaptógenos.
          </p>
          {!hasChlorellaInCart && (
            <button
              type="button"
              onClick={addChlorellaAndGoToSecurity}
              className="w-full rounded-full py-3 px-4 bg-[#AB5541] text-white text-sm font-medium"
            >
              + Agregar Chlorella al pedido
            </button>
          )}
          <button type="button" onClick={goSecurity} className="w-full rounded-full py-3 px-4 border border-[#2F4F4F]/25 text-sm">
            Continuar
          </button>
          <button type="button" onClick={goBackOne} className="w-full rounded-full py-3.5 border border-[#2F4F4F]/25 text-sm">
            Volver
          </button>
        </div>
      );
    }
    return null;
  };

  const renderSecurity = () => (
    <div className="space-y-8 text-left">
      {cartHasAnyId(cart, IDS_ANTICOAG) && (
        <div className="space-y-3">
          <p className="text-sm text-[#2F4F4F]/90 leading-snug">
            ¿Estás tomando anticoagulantes o antiagregantes? (Warfarina, Acenocumarol, Aspirina u otros)
          </p>
          {p1 === null && (
            <div className="flex gap-2">
              <button type="button" onClick={() => setP1(true)} className="flex-1 rounded-full py-2.5 bg-[#2F4F4F] text-white text-sm">Sí</button>
              <button type="button" onClick={() => setP1(false)} className="flex-1 rounded-full py-2.5 border border-[#2F4F4F]/25 text-sm">No</button>
            </div>
          )}
          {p1 === false && (
            <div className="flex items-center gap-2 text-[#2F4F4F]/50">
              <Check className="w-4 h-4" strokeWidth={2} />
              <span className="text-sm">Listo</span>
            </div>
          )}
          {p1 === true && (
            <div className="space-y-3 pl-0 border-l-2 border-[#2F4F4F]/10 pl-3">
              {cart
                .filter(i => IDS_ANTICOAG.includes(i.product.id as typeof IDS_ANTICOAG[number]))
                .map(item => (
                  <p key={item.product.id} className="text-xs text-[#2F4F4F]/75">
                    {anticoagWarningForId(item.product.id)}
                  </p>
                ))}
              {!cart.some(i => i.product.id === 'ashwagandha-extract') && (
                <button
                  type="button"
                  onClick={applySwapAllAnticoagToAshwagandha}
                  className="text-sm rounded-full py-2 px-3 bg-white border border-[#2F4F4F]/20 w-full"
                >
                  Reemplazar por Ashwagandha
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {cartHasAnyId(cart, IDS_SURGERY) && (
        <div className="space-y-3">
          <p className="text-sm text-[#2F4F4F]/90 leading-snug">¿Tenés una cirugía programada en los próximos 15 días?</p>
          {p2 === null && (
            <div className="flex gap-2">
              <button type="button" onClick={() => setP2(true)} className="flex-1 rounded-full py-2.5 bg-[#2F4F4F] text-white text-sm">Sí</button>
              <button type="button" onClick={() => setP2(false)} className="flex-1 rounded-full py-2.5 border border-[#2F4F4F]/25 text-sm">No</button>
            </div>
          )}
          {p2 === false && (
            <div className="flex items-center gap-2 text-[#2F4F4F]/50">
              <Check className="w-4 h-4" /><span className="text-sm">Listo</span>
            </div>
          )}
          {p2 === true && (
            <p className="text-xs text-[#2F4F4F]/75 leading-relaxed">
              Se recomienda suspender {cart.filter(i => IDS_SURGERY.includes(i.product.id as typeof IDS_SURGERY[number])).map(i => i.product.name).join(', ')} al menos 14 días antes de una cirugía por riesgo de sangrado. Consultá con tu médico.
            </p>
          )}
        </div>
      )}

      {cartHasAnyId(cart, IDS_DIABETES) && (
        <div className="space-y-3">
          <p className="text-sm text-[#2F4F4F]/90 leading-snug">¿Estás tomando medicación para la diabetes? (Metformina, insulina u otros)</p>
          {p3 === null && (
            <div className="flex gap-2">
              <button type="button" onClick={() => setP3(true)} className="flex-1 rounded-full py-2.5 bg-[#2F4F4F] text-white text-sm">Sí</button>
              <button type="button" onClick={() => setP3(false)} className="flex-1 rounded-full py-2.5 border border-[#2F4F4F]/25 text-sm">No</button>
            </div>
          )}
          {p3 === false && (
            <div className="flex items-center gap-2 text-[#2F4F4F]/50">
              <Check className="w-4 h-4" /><span className="text-sm">Listo</span>
            </div>
          )}
          {p3 === true && (
            <p className="text-xs text-[#2F4F4F]/75 leading-relaxed">
              {(() => {
                const names = cart
                  .filter(i => IDS_DIABETES.includes(i.product.id as typeof IDS_DIABETES[number]))
                  .map(i => i.product.name);
                if (names.length === 1) {
                  return `El ${names[0]} puede potenciar el efecto hipoglucemiante. Monitorear glucosa las primeras semanas y consultar con tu médico.`;
                }
                if (names.length === 2) {
                  return `Los productos ${names[0]} y ${names[1]} pueden potenciar el efecto hipoglucemiante. Monitorear glucosa las primeras semanas y consultar con tu médico.`;
                }
                const joined = `${names.slice(0, -1).join(', ')} y ${names[names.length - 1]}`;
                return `Los productos ${joined} pueden potenciar el efecto hipoglucemiante. Monitorear glucosa las primeras semanas y consultar con tu médico.`;
              })()}
            </p>
          )}
        </div>
      )}

      {cartHasAnyId(cart, ['ashwagandha-extract']) && (
        <div className="space-y-3">
          <p className="text-sm text-[#2F4F4F]/90 leading-snug">¿Tenés hipertiroidismo o estás tomando medicación tiroidea? (Levotiroxina u otros)</p>
          {p4 === null && (
            <div className="flex gap-2">
              <button type="button" onClick={() => setP4(true)} className="flex-1 rounded-full py-2.5 bg-[#2F4F4F] text-white text-sm">Sí</button>
              <button type="button" onClick={() => setP4(false)} className="flex-1 rounded-full py-2.5 border border-[#2F4F4F]/25 text-sm">No</button>
            </div>
          )}
          {p4 === false && (
            <div className="flex items-center gap-2 text-[#2F4F4F]/50">
              <Check className="w-4 h-4" /><span className="text-sm">Listo</span>
            </div>
          )}
          {p4 === true && (
            <div className="space-y-2">
              <p className="text-xs text-[#2F4F4F]/75">La Ashwagandha puede alterar los niveles de TSH y potenciar la medicación tiroidea.</p>
              <button type="button" onClick={() => applySwap('ashwagandha-extract', 'reishi-extract')} className="text-sm rounded-full py-2 px-3 bg-white border border-[#2F4F4F]/20 w-full">
                Reemplazar por Reishi
              </button>
            </div>
          )}
        </div>
      )}

      {cartHasAnyId(cart, ['chlorella-extract']) && (
        <div className="space-y-3">
          <p className="text-sm text-[#2F4F4F]/90 leading-snug">¿Tenés Hashimoto, hipertiroidismo de Graves, o tomás Levotiroxina?</p>
          {p5 === null && (
            <div className="grid grid-cols-2 gap-2">
              {(['hashimoto', 'graves', 'levo', 'no'] as const).map(opt => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setP5(opt)}
                  className="rounded-full py-2 text-xs border border-[#2F4F4F]/25"
                >
                  {opt === 'hashimoto' ? 'Hashimoto' : opt === 'graves' ? 'Graves' : opt === 'levo' ? 'Levotiroxina' : 'No'}
                </button>
              ))}
            </div>
          )}
          {p5 === 'no' && (
            <div className="flex items-center gap-2 text-[#2F4F4F]/50">
              <Check className="w-4 h-4" /><span className="text-sm">Listo</span>
            </div>
          )}
          {(p5 === 'hashimoto' || p5 === 'graves') && (
            <div className="space-y-2 text-xs text-[#2F4F4F]/75 leading-relaxed">
              <p>La Chlorella contiene yodo concentrado y puede exacerbar el ataque autoinmune a la tiroides. No se recomienda en estos casos.</p>
              <p>Como alternativa suave de reset: batidos de vegetales de hoja verde.</p>
            </div>
          )}
          {p5 === 'levo' && (
            <p className="text-xs text-[#2F4F4F]/75 leading-relaxed">
              Separá la Chlorella al menos 4 horas de tu medicación para no interferir con su absorción.
            </p>
          )}
        </div>
      )}

      {(cartHasAnyId(cart, ['ashwagandha-extract']) || cartHasAnyId(cart, ['reishi-extract'])) && (
        <div className="space-y-3">
          <p className="text-sm text-[#2F4F4F]/90 leading-snug">¿Tenés enfermedad hepática preexistente o tomás paracetamol frecuentemente?</p>
          {p6 === null && (
            <div className="flex gap-2">
              <button type="button" onClick={() => setP6(true)} className="flex-1 rounded-full py-2.5 bg-[#2F4F4F] text-white text-sm">Sí</button>
              <button type="button" onClick={() => setP6(false)} className="flex-1 rounded-full py-2.5 border border-[#2F4F4F]/25 text-sm">No</button>
            </div>
          )}
          {p6 === false && (
            <div className="flex items-center gap-2 text-[#2F4F4F]/50">
              <Check className="w-4 h-4" /><span className="text-sm">Listo</span>
            </div>
          )}
          {p6 === true && (
            <div className="space-y-3">
              {cartHasAnyId(cart, ['ashwagandha-extract']) && (
                <div className="space-y-2">
                  <p className="text-xs text-[#2F4F4F]/75">
                    La Ashwagandha puede afectar las enzimas hepáticas en combinación con paracetamol o alcohol.
                  </p>
                  <button type="button" onClick={() => applySwap('ashwagandha-extract', 'melena-extract')} className="text-sm rounded-full py-2 px-3 bg-white border border-[#2F4F4F]/20 w-full">
                    Reemplazar por Melena de León
                  </button>
                </div>
              )}
              {cartHasAnyId(cart, ['reishi-extract']) && (
                <p className="text-xs text-[#2F4F4F]/75">El Reishi inhibe enzimas hepáticas (CYP450). Evitar con paracetamol o alcohol.</p>
              )}
            </div>
          )}
        </div>
      )}

      {cartHasAnyId(cart, ['reishi-extract']) && (
        <div className="space-y-3">
          <p className="text-sm text-[#2F4F4F]/90 leading-snug">
            ¿Estás tomando estatinas o antihipertensivos? (Rosuvastatina, Atorvastatina, Enalapril, Losartán u otros)
          </p>
          {p6b === null && (
            <div className="flex gap-2">
              <button type="button" onClick={() => setP6b(true)} className="flex-1 rounded-full py-2.5 bg-[#2F4F4F] text-white text-sm">
                Sí
              </button>
              <button type="button" onClick={() => setP6b(false)} className="flex-1 rounded-full py-2.5 border border-[#2F4F4F]/25 text-sm">
                No
              </button>
            </div>
          )}
          {p6b === false && (
            <div className="flex items-center gap-2 text-[#2F4F4F]/50">
              <Check className="w-4 h-4" />
              <span className="text-sm">Listo</span>
            </div>
          )}
          {p6b === true && (
            <p className="text-xs text-[#2F4F4F]/75 leading-relaxed">
              El Reishi puede elevar los niveles de estatinas y antihipertensivos en sangre al inhibir la enzima CYP3A4. Consultá con tu médico.
            </p>
          )}
        </div>
      )}

      <div className="space-y-3">
        <p className="text-sm text-[#2F4F4F]/90 leading-snug">¿Estás embarazada o en período de lactancia?</p>
        {p7 === null && (
          <div className="flex gap-2">
            <button type="button" onClick={() => setP7(true)} className="flex-1 rounded-full py-2.5 bg-[#2F4F4F] text-white text-sm">Sí</button>
            <button type="button" onClick={() => setP7(false)} className="flex-1 rounded-full py-2.5 border border-[#2F4F4F]/25 text-sm">No</button>
          </div>
        )}
        {p7 === false && (
          <div className="flex items-center gap-2 text-[#2F4F4F]/50">
            <Check className="w-4 h-4" /><span className="text-sm">Listo</span>
          </div>
        )}
        {p7 === true && (
          <p className="text-xs text-[#2F4F4F]/75 leading-relaxed">
            No contamos con datos clínicos suficientes sobre el uso de adaptógenos durante el embarazo o la lactancia. Consultá con tu médico antes de continuar.
          </p>
        )}
      </div>

      {cart.some(i => i.product.kind === 'mushroom') && (
        <div className="space-y-3">
          <p className="text-sm text-[#2F4F4F]/90 leading-snug">¿Tenés una enfermedad autoinmune activa? (Lupus, Artritis Reumatoide, Esclerosis Múltiple u otras)</p>
          {p8 === null && (
            <div className="flex gap-2">
              <button type="button" onClick={() => setP8(true)} className="flex-1 rounded-full py-2.5 bg-[#2F4F4F] text-white text-sm">Sí</button>
              <button type="button" onClick={() => setP8(false)} className="flex-1 rounded-full py-2.5 border border-[#2F4F4F]/25 text-sm">No</button>
            </div>
          )}
          {p8 === false && (
            <div className="flex items-center gap-2 text-[#2F4F4F]/50">
              <Check className="w-4 h-4" /><span className="text-sm">Listo</span>
            </div>
          )}
          {p8 === true && (
            <p className="text-xs text-[#2F4F4F]/75 leading-relaxed">
              Los hongos medicinales contienen β-glucanos que pueden estimular la actividad de los macrófagos y linfocitos T, lo que podría exacerbar síntomas en condiciones autoinmunes activas. Consultá con tu médico.
            </p>
          )}
        </div>
      )}

      {cart.some(i => i.product.kind === 'mushroom') && (
        <div className="space-y-3">
          <p className="text-sm text-[#2F4F4F]/90 leading-snug">¿Tenés alergia conocida a los hongos?</p>
          {p9 === null && (
            <div className="flex gap-2">
              <button type="button" onClick={() => setP9(true)} className="flex-1 rounded-full py-2.5 bg-[#2F4F4F] text-white text-sm">Sí</button>
              <button type="button" onClick={() => setP9(false)} className="flex-1 rounded-full py-2.5 border border-[#2F4F4F]/25 text-sm">No</button>
            </div>
          )}
          {p9 === false && (
            <div className="flex items-center gap-2 text-[#2F4F4F]/50">
              <Check className="w-4 h-4" /><span className="text-sm">Listo</span>
            </div>
          )}
          {p9 === true && (
            <p className="text-xs text-[#2F4F4F]/75 leading-relaxed">Los hongos en tu pedido pueden generar reacción alérgica.</p>
          )}
        </div>
      )}

      {swapUndos.length > 0 && (
        <div className="space-y-2 border-t border-[#2F4F4F]/10 pt-4">
          {swapUndos.map(u => (
            <div key={u.id} className="flex justify-between items-center gap-2 text-xs">
              <span className="text-[#2F4F4F]/55">{u.label}</span>
              <button type="button" className="text-[#2F4F4F]/45 underline shrink-0" onClick={u.undo}>
                Deshacer
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-3 mt-4">
        <button
          type="button"
          onClick={goFromSecurity}
          className="w-full rounded-full py-3.5 bg-[#2F4F4F] text-white text-sm font-medium"
        >
          Continuar
        </button>
        <button type="button" onClick={goBackOne} className="w-full rounded-full py-3.5 border border-[#2F4F4F]/25 text-sm">
          Volver
        </button>
      </div>
    </div>
  );

  const renderMelenaFirst = () => {
    const hasExtract = cart.some(i => i.product.id === 'melena-extract');

    if (p10First === null) {
      if (!hasExtract) {
        return (
          <div className="space-y-4 text-left">
            <button
              type="button"
              onClick={goConfirm}
              className="w-full rounded-full py-3.5 bg-[#2F4F4F] text-white text-sm font-medium"
            >
              Continuar al resumen
            </button>
            <button type="button" onClick={goBackOne} className="w-full rounded-full py-3.5 border border-[#2F4F4F]/25 text-sm">
              Volver
            </button>
          </div>
        );
      }
      return (
        <div className="space-y-4 text-left">
          <p className="text-sm text-[#2F4F4F]/90 leading-relaxed">
            ¿Es la primera vez que consumís Melena de León?
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setP10First(true)}
              className="flex-1 rounded-full py-2.5 bg-[#2F4F4F] text-white text-sm"
            >
              Sí
            </button>
            <button type="button" onClick={goConfirm} className="flex-1 rounded-full py-2.5 border border-[#2F4F4F]/25 text-sm">
              No
            </button>
          </div>
          <button type="button" onClick={goBackOne} className="w-full rounded-full py-3.5 border border-[#2F4F4F]/25 text-sm">
            Volver
          </button>
        </div>
      );
    }

    if (!hasExtract) {
      return (
        <div className="space-y-4 text-left">
          <button
            type="button"
            onClick={goConfirm}
            className="w-full rounded-full py-3.5 bg-[#2F4F4F] text-white text-sm font-medium"
          >
            Continuar al resumen
          </button>
          <button type="button" onClick={goBackOne} className="w-full rounded-full py-3.5 border border-[#2F4F4F]/25 text-sm">
            Volver
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-4 text-left">
        <p className="text-sm text-[#2F4F4F]/80 leading-relaxed">
          El extracto 10:1 es de alta potencia — cada cápsula equivale a 5g de hongo crudo. Para una adaptación gradual de la microbiota, la Melena Clásica (hongo entero) ofrece una liberación más progresiva y mejor tolerancia digestiva.
        </p>
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => {
              applySwap('melena-extract', 'melena-classic');
              queueMicrotask(() => goConfirm());
            }}
            className="w-full rounded-full py-3 bg-[#AB5541] text-white text-sm font-medium"
          >
            Cambiar por Melena Clásica
          </button>
          <button type="button" onClick={goConfirm} className="w-full rounded-full py-3 border border-[#2F4F4F]/25 text-sm">
            Mantener 10:1
          </button>
          <button type="button" onClick={goBackOne} className="w-full rounded-full py-3.5 border border-[#2F4F4F]/25 text-sm">
            Volver
          </button>
        </div>
      </div>
    );
  };

  const confirmLineLabelShort = (p: Product) => {
    if (p.id === 'melena-extract') return 'Melena 10:1';
    if (p.id === 'melena-classic') return 'Melena clásica';
    return p.name;
  };

  const renderConfirm = () => (
    <div className="space-y-4 text-left">
      <p className="text-sm font-medium text-[#2F4F4F]">Tu pedido</p>
      <ul className="space-y-1.5 text-sm text-[#2F4F4F]/85">
        {cart.map(item => {
          const line = item.product.price * item.quantity;
          return (
            <li key={item.product.id} className="flex justify-between gap-3 items-baseline">
              <span className="min-w-0 leading-snug">{confirmLineLabelShort(item.product)}</span>
              <span className="shrink-0 tabular-nums text-[#2F4F4F]/75">
                {`${item.quantity > 1 ? `×${item.quantity} · ` : ''}$${line.toLocaleString('es-AR')}`}
              </span>
            </li>
          );
        })}
      </ul>
      <div className="flex justify-between gap-4 items-end border-t border-[#2F4F4F]/10 pt-4 text-[#2F4F4F]">
        <div className="min-w-0">
          <p className="text-[0.65rem] sm:text-xs font-medium tracking-[0.12em] text-[#2F4F4F]/45 uppercase mb-1">
            Total estimado
          </p>
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0">
            <span className="text-2xl font-semibold tabular-nums leading-none">
              ${confirmPricing.total.toLocaleString('es-AR')}
            </span>
            {confirmPricing.rate > 0 && (
              <span className="text-sm text-[#2F4F4F]/35 line-through tabular-nums">
                ${confirmPricing.subtotal.toLocaleString('es-AR')}
              </span>
            )}
          </div>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-sm text-[#2F4F4F]/80 leading-tight">
            {confirmPricing.bottles === 1 ? '1 frasco' : `${confirmPricing.bottles} frascos`}
          </p>
          {confirmPricing.rate > 0 && (
            <p className="text-xs text-[#AB5541] mt-1 leading-tight">−{confirmPricing.rate * 100}% aplicado</p>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-2 pt-1">
        <button
          type="button"
          onClick={onConfirm}
          className="w-full rounded-full py-3.5 bg-[#2F4F4F] text-white text-sm font-medium"
        >
          Confirmar pedido
        </button>
        <button type="button" onClick={goBackOne} className="w-full rounded-full py-3.5 border border-[#2F4F4F]/25 text-sm">
          Volver
        </button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#1a1a1a]/40">
      <div className="relative w-full max-w-md max-h-[85vh] overflow-y-auto rounded-[32px] bg-[#F0E6D2] p-6 shadow-xl">
        <button
          type="button"
          onClick={abortToShopping}
          className="absolute top-4 right-4 z-20 p-2 hover:bg-[#2F4F4F]/10 rounded-full"
        >
          <X className="w-5 h-5" />
        </button>
        {phase !== 'intro' && phase !== 'confirm' && (
          <p
            className={`text-xs text-[#2F4F4F]/40 ${showPedidoHeading ? 'mb-1' : 'mb-4'}`}
          >
            {stepLabel} de {totalSteps}
          </p>
        )}
        {showPedidoHeading && (
          <h2 className="text-base font-medium text-[#2F4F4F] mb-4 pr-8">Antes de enviar el pedido</h2>
        )}
        {phase === 'intro' && renderIntro()}
        {phase === 'chlorella' && showChlorellaStep && renderChlorella()}
        {phase === 'security' && renderSecurity()}
        {phase === 'melenaFirst' && renderMelenaFirst()}
        {phase === 'confirm' && renderConfirm()}
      </div>
    </div>
  );
}

export default function App() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showSafetyCheck, setShowSafetyCheck] = useState(false);
  const [pendingWhatsApp, setPendingWhatsApp] = useState<{ toSeller: boolean; isCustom?: boolean } | null>(null);
  const [isSecretMarketOpen, setIsSecretMarketOpen] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showProtocolInfo, setShowProtocolInfo] = useState(false);
  const [showNiacinaModal, setShowNiacinaModal] = useState(false);
  const [password, setPassword] = useState('');
  const [customMix, setCustomMix] = useState<CustomMix>(DEFAULT_CUSTOM_MIX);
  const [customMixCart, setCustomMixCart] = useState<CustomMixCartItem[]>([]);

  // --- Logic ---

  useEffect(() => {
    // Precarga de carrito desde URL (sin router): ?a=melena-extract,reishi-extract o ?a=Melena%20de%20Le%C3%B3n
    // También soporta cantidad opcional: melena-extract:2
    const params = new URLSearchParams(window.location.search);
    const raw = params.get('a') || params.get('adaptogens');
    if (!raw) return;

    const byId = new Map(PRODUCTS.map(p => [p.id, p]));
    const byNameKey = new Map(PRODUCTS.map(p => [normalizeKey(p.name), p]));

    const items = raw
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    setCart(prev => {
      let next = [...prev];

      for (const token of items) {
        const [left, qtyRaw] = token.split(':');
        const qty = Math.max(1, Number.parseInt(qtyRaw ?? '1', 10) || 1);
        const key = left.trim();
        if (!key) continue;

        const direct = byId.get(key);
        const normalized = normalizeKey(key);
        const aliasedId = ADAPTOGEN_ALIASES[normalized];
        const fromAlias = aliasedId ? byId.get(aliasedId) : undefined;
        const fromName = byNameKey.get(normalized);
        const product = direct || fromAlias || fromName;
        if (!product) continue;

        const existing = next.find(i => i.product.id === product.id);
        if (existing) {
          next = next.map(i =>
            i.product.id === product.id ? { ...i, quantity: i.quantity + qty } : i
          );
        } else {
          next = [...next, { product, quantity: qty }];
        }
      }

      return next;
    });
  }, []);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === productId);
      if (existing && existing.quantity > 0) {
        if (existing.quantity === 1) {
          return prev.filter(item => item.product.id !== productId);
        }
        return prev.map(item => 
          item.product.id === productId ? { ...item, quantity: item.quantity - 1 } : item
        );
      }
      return prev;
    });
  };

  const totalBottles = cart.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
  
  const discount = useMemo(() => {
    if (totalBottles >= 4) return 0.20;
    if (totalBottles >= 2) return 0.10;
    return 0;
  }, [totalBottles]);

  const total = subtotal * (1 - discount);

  // --- Secret Market Logic ---

  const customMixTotalMg = useMemo(
    () => customMixActiveMg(customMixRecipeFromBuilder(customMix)),
    [customMix]
  );

  const customMixCartJars = useMemo(() => customMixCartTotalJars(customMixCart), [customMixCart]);
  const customMixMaxJarsToAdd = Math.max(0, CUSTOM_MIX_MAX_JARS - customMixCartJars);
  const customMixCartPricing = useMemo(() => computeCustomCartPricing(customMixCart), [customMixCart]);

  useEffect(() => {
    if (customMixMaxJarsToAdd > 0 && customMix.jars > customMixMaxJarsToAdd) {
      setCustomMix(p => ({ ...p, jars: customMixMaxJarsToAdd }));
    }
  }, [customMixMaxJarsToAdd, customMix.jars]);

  const addCustomMixToCart = () => {
    if (customMixTotalMg > 350 || customMixMaxJarsToAdd < 1) return;
    const qty = Math.min(customMix.jars, customMixMaxJarsToAdd);
    const recipe = customMixRecipeFromBuilder(customMix);
    setCustomMixCart(prev => {
      const idx = prev.findIndex(item => customMixRecipesEqual(item.recipe, recipe));
      if (idx >= 0) {
        return prev.map((item, i) =>
          i === idx ? { ...item, quantity: item.quantity + qty } : item
        );
      }
      return [...prev, { recipe, quantity: qty }];
    });
    setCustomMix(p => ({ ...p, jars: 1 }));
  };

  const adjustCustomMixCartQty = (index: number, delta: number) => {
    setCustomMixCart(prev => {
      const item = prev[index];
      if (!item) return prev;
      const nextQty = item.quantity + delta;
      const otherJars = customMixCartTotalJars(prev) - item.quantity;
      if (delta > 0 && otherJars + nextQty > CUSTOM_MIX_MAX_JARS) return prev;
      if (nextQty <= 0) return prev.filter((_, i) => i !== index);
      return prev.map((line, i) => (i === index ? { ...line, quantity: nextQty } : line));
    });
  };

  const closeSecretMarket = () => {
    setIsSecretMarketOpen(false);
  };

  const handleWhatsApp = (toSeller: boolean, isCustom: boolean = false) => {
    // Market (main cart): "Hola Charlie" (Secret Market mantiene "Hola" sin nombre)
    let message = `¡Hola Charlie! Quisiera consultar este pedido:\n\n`;

    if (isCustom) {
      message = toSeller
        ? `¡Hola Charlie! Quisiera consultar este pedido:\n\n`
        : `¡Hola! Quisiera consultar este pedido:\n\n`;
      message += `Cápsulas a medida (${customMixCartPricing.totalJars} frascos · ${customMixCartPricing.totalJars * 16} cápsulas)\n\n`;

      customMixCart.forEach(item => {
        message += `${item.quantity}× mezcla (${item.quantity * 16} cápsulas)\n`;
        formatCustomMixIngredients(item.recipe).forEach(line => {
          message += `• ${line}\n`;
        });
        message += `\n`;
      });

      const roundedDiscount = Math.max(
        0,
        customMixCartPricing.totalSinDescuento - customMixCartPricing.totalFinal
      );

      if (customMixCartPricing.descuentoAplicado) {
        message += `Subtotal: $${customMixCartPricing.totalSinDescuento.toLocaleString()}\n`;
        message += `Descuento ${customMixCartPricing.discountRate * 100}%: -$${roundedDiscount.toLocaleString()}\n`;
        message += `*Total productos: $${customMixCartPricing.totalFinal.toLocaleString()}*\n`;
      } else {
        message += `*Total:* $${customMixCartPricing.totalFinal.toLocaleString()}\n`;
      }
    } else {
      message += `Productos:\n`;
      cart.forEach(item => {
        let productName = item.product.name;
        let suffix = "";
        if (item.product.category === 'extract' && item.product.id !== 'chlorella-extract') {
          suffix = " (10:1)";
        } else if (item.product.category === 'classic') {
          productName = productName.replace(' · Clásica', '');
          suffix = " clásica";
        }
        message += `• ${item.quantity}x *${productName}*${suffix}\n`;
      });
      message += `\n`;
      // "Subtotal" solo tiene sentido cuando hay oferta (2 o más frascos).
      if (totalBottles >= 2) {
        message += `Subtotal: $${subtotal.toLocaleString()}\n`;
        if (discount > 0) {
          message += `Descuento ${discount * 100}%: -$${(subtotal * discount).toLocaleString()}\n`;
        }
      }
      message += `*Total productos: $${total.toLocaleString()}*\n`;
    }

    message += `\nEntrega:\n`;
    message += `• Retiro por Tribunales (sin costo)\n`;
    message += `• Envío por Uber Moto _(costo extra ≈ $3.000–$8.000)_\n\n`;
    message += `→ Pago único (productos + envío si aplica) por transferencia una vez que confirme stock y costo exacto de envío.\n`;
    message += `Alias: *unmundomejor.gracias*\n\n`;
    message += `¿Tenés stock disponible? ¿Para cuándo podrías tenerlo listo?\n`;
    message += `Gracias!`;

    const encodedMessage = encodeURIComponent(message);
    const url = toSeller 
      ? `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`
      : `https://wa.me/?text=${encodedMessage}`;
    
    window.open(url, '_blank');
  };

  const openSafetyCheck = (toSeller: boolean, isCustom = false) => {
    if (isCustom) {
      if (customMixCart.length === 0) return;
      handleWhatsApp(toSeller, true);
      return;
    }
    setPendingWhatsApp({ toSeller });
    setShowSafetyCheck(true);
  };

  const closeSafetyCheck = () => {
    setShowSafetyCheck(false);
    setPendingWhatsApp(null);
  };

  const confirmSafetyAndWhatsApp = () => {
    if (!pendingWhatsApp) return;
    handleWhatsApp(pendingWhatsApp.toSeller, pendingWhatsApp.isCustom ?? false);
    closeSafetyCheck();
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/secret-market', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json().catch(() => ({}));
      if (data.success) {
        setIsSecretMarketOpen(true);
        setShowPasswordModal(false);
        setPassword('');
      } else {
        alert('Contraseña incorrecta');
      }
    } catch {
      alert('Error de conexión');
    }
  };

  return (
    <div className="min-h-screen bg-[#F0E6D2] text-[#2F4F4F] font-serif selection:bg-[#AB5541] selection:text-white">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#F0E6D2] border-b border-[#2F4F4F]/15 px-6 py-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h1 className="text-base font-medium tracking-tight serif uppercase letter-spacing-wider">Tienda de adaptógenos</h1>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setShowPasswordModal(true)}
            className="w-11 h-11 hover:bg-[#2F4F4F]/10 rounded-full transition-colors flex items-center justify-center"
          >
            <span className="text-xl opacity-60">🍄</span>
          </button>
          <div className="relative">
            <ShoppingBag className="w-6 h-6" />
            {totalBottles > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#AB5541] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-sans">
                {totalBottles}
              </span>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 pt-6 pb-12">
        <section className="mb-10">
          <h2 className="text-xl font-light mb-3 italic">Hongos y plantas medicinales · Extractos 10:1</h2>
          <div className="text-base text-[#1a1a1a]/80 leading-relaxed mb-6 space-y-2">
            <p>Extractos estandarizados, mucho más potentes que el hongo molido.</p>
            <p className="text-[#1a1a1a]/80">Frascos de <span className="font-bold text-[#1a1a1a]">30 cápsulas · 500 mg c/u.</span></p>
            <p className="italic">Seleccioná tus adaptógenos y envianos la lista por WhatsApp para confirmar stock y entrega.</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {PRODUCTS.map(product => {
              const item = cart.find(i => i.product.id === product.id);
              return (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  quantity={item ? item.quantity : 0}
                  onAdd={() => addToCart(product)}
                  onRemove={() => removeFromCart(product.id)}
                />
              );
            })}
          </div>
        </section>

        <section className="bg-white rounded-[32px] p-8 shadow-sm border border-[#2F4F4F]/15">
          <div className="flex items-center gap-3 mb-6">
            <Info className="w-5 h-5 text-[#2F4F4F]" />
            <h3 className="font-medium">Promociones por cantidad</h3>
          </div>
          <ul className="space-y-3 text-sm text-[#2F4F4F]/70">
            <li className="flex justify-between">
              <span>2 frascos o más</span>
              <span className="font-bold text-[#AB5541]">10% OFF</span>
            </li>
            <li className="flex justify-between">
              <span>4 frascos o más</span>
              <span className="font-bold text-[#AB5541]">20% OFF</span>
            </li>
          </ul>
        </section>

        <section className="mt-8 space-y-6">
          <a 
            href="https://unmundomejor.notion.site/Preguntas-Frecuentes-Adapt-genos-b9d4a197923840ecb7f0913a87aca348?pvs=143" 
            target="_blank" 
            rel="noopener noreferrer"
            className="block p-6 bg-white rounded-[24px] border border-[#2F4F4F]/15 hover:border-[#AB5541]/30 transition-colors group"
          >
            <p className="text-sm font-medium text-[#2F4F4F]/80 group-hover:text-[#AB5541] transition-colors">
              👉 Preguntas frecuentes sobre adaptógenos
            </p>
          </a>

          <div className="p-6 bg-white rounded-[24px] border border-[#2F4F4F]/15">
            <h3 className="text-base font-medium mb-2">La Consulta Adaptogénica</h3>
            <div className="text-base text-[#2F4F4F]/80 leading-relaxed mb-4 space-y-1">
              <p>Un breve chat privado para observar cómo estás y orientar la elección de adaptógenos.</p>
              <p>Lleva <span className="font-bold text-[#2F4F4F]">5 minutos</span>.</p>
            </div>
            <a 
              href="https://laconsulta.vercel.app" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-block text-sm font-medium text-[#2F4F4F] hover:underline underline-offset-4"
            >
              👉 https://laconsulta.vercel.app
            </a>
          </div>

          <p className="mt-8 text-center text-sm text-[#2F4F4F]/70 italic px-6 pb-4 leading-relaxed">
            Antes de consumir, evalúe su situación personal con un profesional de la salud.
          </p>
        </section>
      </main>

      {/* Cart Summary Bar */}
      <AnimatePresence>
        {totalBottles > 0 && (
          <motion.div 
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-[#F0E6D2] border-t border-[#2F4F4F]/15 p-6 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]"
          >
            <div className="max-w-2xl mx-auto flex flex-col gap-4">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-xs uppercase tracking-widest text-[#2F4F4F]/70 mb-1">Total Estimado</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-light">${total.toLocaleString()}</span>
                    {discount > 0 && (
                      <span className="text-sm line-through text-[#2F4F4F]/60">${subtotal.toLocaleString()}</span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-[#2F4F4F]">{totalBottles} frascos</p>
                  {discount > 0 && (
                    <p className="text-xs text-[#AB5541] font-bold">-{discount * 100}% aplicado</p>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => openSafetyCheck(true)}
                  className="flex items-center justify-center gap-2 bg-[#2F4F4F] text-white rounded-full py-4 px-6 hover:bg-[#244040] transition-colors font-sans text-sm font-medium"
                >
                  <MessageCircle className="w-4 h-4" />
                  Consultar Stock
                </button>
                <button 
                  onClick={() => openSafetyCheck(false)}
                  className="flex items-center justify-center gap-2 border border-[#2F4F4F]/20 rounded-full py-4 px-6 hover:bg-[#2F4F4F]/10 transition-colors font-sans text-sm font-medium"
                >
                  Guardar en WhatsApp
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {showSafetyCheck && pendingWhatsApp && (
        <SafetyCheckModal
          cart={cart}
          products={PRODUCTS}
          setCart={setCart}
          onConfirm={confirmSafetyAndWhatsApp}
          onClose={closeSafetyCheck}
        />
      )}

      {/* Secret Market Modal */}
      <AnimatePresence>
        {isSecretMarketOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-[#F0E6D2] flex flex-col"
          >
            <div
              className={cn(
                'flex-1 overflow-y-auto',
                customMixCart.length > 0 && 'pb-44'
              )}
            >
            <div className="max-w-2xl mx-auto px-6 pt-8 pb-12">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <FlaskConical className="w-6 h-6 text-[#2F4F4F]" />
                  <h2 className="text-2xl serif italic text-[#2F4F4F]">Cápsulas a Medida</h2>
                </div>
                <button 
                  onClick={closeSecretMarket}
                  className="w-11 h-11 hover:bg-[#2F4F4F]/10 rounded-full flex items-center justify-center"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <p className="text-base text-[#1a1a1a]/80 mb-6 leading-relaxed">
                Armá cada mezcla, agregala al pedido y repetí con otra combinación si querés (hasta 4 frascos en total).
                Cada frasco tiene 16 cápsulas y máximo 350 mg por cápsula.
              </p>
              <p className="text-sm text-[#2F4F4F]/70 mb-6">
                2 frascos: 10% OFF · 4 frascos: 20% OFF (en todo el pedido, como en la tienda principal).
              </p>

              {/* Presets */}
              <div className="grid grid-cols-2 gap-3 mb-10">
                {PRESETS.map(preset => (
                  <button
                    key={preset.id}
                    onClick={() => setCustomMix(prev => ({
                      ...prev,
                      ingredients: { ...preset.ingredients },
                      isNiacinaEnabled: preset.niacinaEnabled,
                      isAshwagandhaActive: preset.ashwagandhaActive
                    }))}
                    className="p-4 bg-white rounded-2xl border border-[#2F4F4F]/15 hover:border-[#AB5541]/30 transition-all text-left group"
                  >
                    <p className="text-xs font-bold text-[#2F4F4F] mb-1 uppercase tracking-wider">{preset.name}</p>
                    <p className="text-sm text-[#1a1a1a]/80 leading-snug">{preset.description}</p>
                  </button>
                ))}
                <button
                  onClick={() => setShowProtocolInfo(!showProtocolInfo)}
                  className="p-4 bg-[#AB5541]/10 rounded-2xl border border-[#2F4F4F]/15 hover:bg-[#AB5541]/15 transition-all text-center flex flex-col items-center justify-center gap-1"
                >
                  <Info className="w-4 h-4 text-[#2F4F4F]" />
                  <span className="text-xs font-bold text-[#2F4F4F] uppercase tracking-wider">Información sobre protocolos</span>
                </button>
              </div>

              {showProtocolInfo && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  className="mb-10 p-6 bg-white rounded-3xl border border-[#2F4F4F]/15 overflow-hidden"
                >
                  <div className="space-y-6 text-base text-[#1a1a1a]/80 leading-relaxed">
                    <div>
                      <p className="font-bold text-[#1a1a1a] mb-1">Protocolo Fadiman:</p>
                      <p>Consiste en un día de dosificación seguido de dos días sin consumo (esquema 1:2). Se fundamenta en el aprovechamiento del "efecto del segundo día" o <span className="italic">afterglow</span> para mantener los beneficios residuales sin generar tolerancia farmacológica.</p>
                    </div>
                    <div>
                      <p className="font-bold text-[#1a1a1a] mb-1">Stamets Stack:</p>
                      <p>Establece cuatro días de ingesta consecutivos seguidos de tres días de descanso. Combina psilocibina con hongo Melena de León (estimulante del factor de crecimiento neuronal) y Niacina, que actúa como vasodilatador para favorecer la distribución periférica de los compuestos.</p>
                    </div>
                    <div>
                      <p className="font-bold text-[#1a1a1a] mb-1">Nightcap:</p>
                      <p>La microdosis se ingiere inmediatamente antes de dormir, manteniendo la frecuencia de días de toma y descanso de cualquiera de los protocolos anteriores. Está indicado para personas que experimentan fatiga o ansiedad diurna, y se asocia a una intensificación de la actividad onírica.</p>
                    </div>
                  </div>
                </motion.div>
              )}

              <div className="space-y-6 mb-12">
                {/* 1. La Fuerza */}
                <div className="flex flex-col gap-4 bg-white p-6 rounded-3xl border border-[#2F4F4F]/15">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#AB5541]/12 flex items-center justify-center text-xl">⚡</div>
                      <span className="font-medium text-[#2F4F4F]">La Fuerza</span>
                    </div>
                    <motion.span 
                      key={customMix.ingredients.cositas}
                      initial={{ scale: 1.2, color: '#2F4F4F' }}
                      animate={{ scale: 1, color: '#2F4F4F' }}
                      className="font-mono font-bold"
                    >
                      {customMix.ingredients.cositas} mg
                    </motion.span>
                  </div>
                  <input 
                    type="range"
                    min={0}
                    max={LA_FUERZA_SLIDER_STEPS.length - 1}
                    step={1}
                    value={laFuerzaSliderIndexFromMg(customMix.ingredients.cositas)}
                    onChange={(e) => {
                      const idx = parseInt(e.target.value, 10);
                      const otherTotal = customMixTotalMg - customMix.ingredients.cositas;
                      const maxCos = Math.max(0, 350 - otherTotal);
                      const val = laFuerzaMgFromSliderIndex(idx, maxCos);
                      setCustomMix(prev => ({
                        ...prev,
                        ingredients: { ...prev.ingredients, cositas: val }
                      }));
                    }}
                    className="w-full h-2 rounded-full appearance-none cursor-pointer accent-[#2F4F4F] bg-[#F0E6D2]/60"
                  />
                  <div className="grid grid-cols-8 gap-0.5 text-[10px] sm:text-xs text-[#2F4F4F]/70 font-mono leading-tight text-center">
                    <span className="min-w-0" aria-hidden />
                    <span className="min-w-0">50</span>
                    <span className="min-w-0">100</span>
                    <span className="min-w-0">150</span>
                    <span className="min-w-0">200</span>
                    <span className="min-w-0">250</span>
                    <span className="min-w-0">300</span>
                    <span className="min-w-0">350</span>
                  </div>
                </div>

                {/* 2. Melena de León */}
                <div className="flex flex-col gap-4 bg-white p-6 rounded-3xl border border-[#2F4F4F]/15">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#F0E6D2]/70 flex items-center justify-center text-xl">🍄</div>
                      <span className="font-medium text-[#2F4F4F]">Melena de León</span>
                    </div>
                    <motion.span 
                      key={customMix.ingredients.melena}
                      initial={{ scale: 1.2, color: '#8B7D6B' }}
                      animate={{ scale: 1, color: '#8B7D6B' }}
                      className="font-mono font-bold"
                    >
                      {customMix.ingredients.melena} mg
                    </motion.span>
                  </div>
                  <input 
                    type="range"
                    min="0"
                    max={350}
                    step="10"
                    value={customMix.ingredients.melena}
                    onChange={(e) => {
                      const raw = parseInt(e.target.value);
                      const otherTotal = customMixTotalMg - customMix.ingredients.melena;
                      const allowed = Math.max(0, 350 - otherTotal);
                      const val = Math.min(raw, allowed);
                      setCustomMix(prev => ({
                        ...prev,
                        ingredients: { ...prev.ingredients, melena: val }
                      }));
                    }}
                    className="w-full h-2 rounded-full appearance-none cursor-pointer accent-[#8B7D6B] bg-[#F0E6D2]/60"
                  />
                </div>

                {/* 3. Reishi / Ashwagandha */}
                <div className={cn(
                  "flex flex-col gap-4 bg-white p-6 rounded-3xl border transition-all",
                  customMix.isNiacinaEnabled ? "opacity-30 grayscale pointer-events-none border-[#2F4F4F]/15" : "border-[#2F4F4F]/15"
                )}>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 bg-[#F0E6D2]/60 p-1 rounded-xl">
                      <button 
                        onClick={() => setCustomMix(prev => ({ ...prev, isAshwagandhaActive: false }))}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                          !customMix.isAshwagandhaActive ? "bg-[#F0E6D2] shadow-sm text-[#7D2D2D]" : "text-[#2F4F4F]/70"
                        )}
                      >
                        Reishi
                      </button>
                      <button 
                        onClick={() => setCustomMix(prev => ({ ...prev, isAshwagandhaActive: true }))}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                          customMix.isAshwagandhaActive ? "bg-[#F0E6D2] shadow-sm text-[#D4B483]" : "text-[#2F4F4F]/70"
                        )}
                      >
                        Ashwagandha
                      </button>
                    </div>
                    <motion.span 
                      key={customMix.ingredients[customMix.isAshwagandhaActive ? 'ashwagandha' : 'reishi']}
                      initial={{ scale: 1.2 }}
                      animate={{ scale: 1 }}
                      className="font-mono font-bold" 
                      style={{ color: customMix.isAshwagandhaActive ? '#D4B483' : '#7D2D2D' }}
                    >
                      {customMix.ingredients[customMix.isAshwagandhaActive ? 'ashwagandha' : 'reishi']} mg
                    </motion.span>
                  </div>
                  <input 
                    type="range"
                    min="0"
                    max={350}
                    step="10"
                    value={customMix.ingredients[customMix.isAshwagandhaActive ? 'ashwagandha' : 'reishi']}
                    onChange={(e) => {
                      const raw = parseInt(e.target.value);
                      const key = customMix.isAshwagandhaActive ? 'ashwagandha' : 'reishi';
                      const currentVal = customMix.ingredients[key] || 0;
                      const otherTotal = customMixTotalMg - currentVal;
                      const allowed = Math.max(0, 350 - otherTotal);
                      const val = Math.min(raw, allowed);
                      setCustomMix(prev => ({
                        ...prev,
                        ingredients: { ...prev.ingredients, [key]: val }
                      }));
                    }}
                    className="w-full h-2 rounded-full appearance-none cursor-pointer bg-[#F0E6D2]/60"
                    style={{ accentColor: customMix.isAshwagandhaActive ? '#D4B483' : '#7D2D2D' }}
                  />
                </div>

                {/* 4. Niacina (B3) */}
                <div className={cn(
                  "flex flex-col gap-4 bg-white p-6 rounded-3xl border transition-all relative overflow-hidden",
                  !customMix.isNiacinaEnabled ? "border-[#2F4F4F]/15" : "border-[#F27D26]/30 shadow-sm shadow-[#F27D26]/5"
                )}>
                  <div className="flex justify-between items-center cursor-pointer" onClick={() => {
                    setCustomMix(prev => ({ ...prev, isNiacinaEnabled: !prev.isNiacinaEnabled }));
                  }}>
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center text-xl transition-all",
                        customMix.isNiacinaEnabled ? "bg-[#F27D26]/20" : "bg-[#2F4F4F]/10 grayscale"
                      )}>
                        💊
                      </div>
                      <div className="flex flex-col">
                        <span className={cn("font-medium transition-all", !customMix.isNiacinaEnabled && "opacity-40")}>Niacina (B3)</span>
                        {!customMix.isNiacinaEnabled ? (
                          <span className="text-xs text-[#F27D26] font-bold uppercase tracking-wider">Toca para habilitar</span>
                        ) : (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowNiacinaModal(true);
                            }}
                            className="text-xs text-red-600 font-bold hover:underline text-left mt-0.5"
                          >
                            Ver contraindicaciones
                          </button>
                        )}
                      </div>
                    </div>
                    {customMix.isNiacinaEnabled && (
                      <div className="flex items-center gap-3">
                        <motion.span 
                          key={customMix.ingredients.niacina}
                          initial={{ scale: 1.2, color: '#F27D26' }}
                          animate={{ scale: 1, color: '#F27D26' }}
                          className="font-mono font-bold"
                        >
                          {customMix.ingredients.niacina} mg
                        </motion.span>
                        <div className="p-1.5 bg-red-50 rounded-full text-red-400">
                          <X className="w-4 h-4" />
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {customMix.isNiacinaEnabled && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                      <div className="grid grid-cols-4 gap-2">
                        {[25, 50, 75, 100].map(mg => {
                          const otherTotal = customMixTotalMg - customMix.ingredients.niacina;
                          const isDisabled = otherTotal + mg > 350;
                          return (
                            <button
                              key={mg}
                              disabled={isDisabled}
                              onClick={(e) => {
                                e.stopPropagation();
                                setCustomMix(prev => ({ ...prev, ingredients: { ...prev.ingredients, niacina: mg } }));
                              }}
                              className={cn(
                                "py-2 rounded-xl text-xs font-bold transition-all border",
                                customMix.ingredients.niacina === mg 
                                  ? "bg-[#F27D26] text-white border-[#F27D26]" 
                                  : "bg-[#f5f5f0] text-[#1a1a1a]/70 border-transparent hover:border-[#F27D26]/20",
                                isDisabled && "opacity-20 cursor-not-allowed"
                              )}
                            >
                              {mg}mg
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-[32px] p-8 border border-[#1a1a1a]/5 mb-12">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm uppercase tracking-widest opacity-40">Total por Cápsula</span>
                  <span className={cn(
                    "font-mono font-bold",
                    customMixTotalMg > 350 ? "text-red-500" : "text-[#5A5A40]"
                  )}>
                    {customMixTotalMg} / 350 mg
                  </span>
                </div>
                <div className="w-full bg-[#2F4F4F]/15 h-2 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, (customMixTotalMg / 350) * 100)}%` }}
                    className="h-full bg-[#AB5541]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-medium">Frascos de esta mezcla</p>
                  <p className="text-xs text-[#1a1a1a]/70">
                    {customMixCartJars > 0
                      ? `${customMixCartJars}/${CUSTOM_MIX_MAX_JARS} en el pedido`
                      : `Hasta ${CUSTOM_MIX_MAX_JARS} frascos en total`}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <button 
                    type="button"
                    onClick={() => setCustomMix(p => ({ ...p, jars: Math.max(1, p.jars - 1) }))}
                    disabled={customMix.jars <= 1}
                    className="w-11 h-11 rounded-full border border-[#1a1a1a]/10 flex items-center justify-center disabled:opacity-30"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-xl font-medium w-8 text-center">{customMix.jars}</span>
                  <button 
                    type="button"
                    onClick={() => setCustomMix(p => ({ ...p, jars: Math.min(customMixMaxJarsToAdd, p.jars + 1) }))}
                    disabled={customMix.jars >= customMixMaxJarsToAdd}
                    className="w-11 h-11 rounded-full border border-[#1a1a1a]/10 flex items-center justify-center disabled:opacity-30"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={addCustomMixToCart}
                disabled={customMixTotalMg > 350 || customMixMaxJarsToAdd < 1}
                className="w-full mb-10 flex items-center justify-center gap-2 bg-[#2F4F4F] text-white rounded-full py-4 px-6 hover:bg-[#244040] transition-colors font-sans text-sm font-medium disabled:opacity-40 disabled:pointer-events-none"
              >
                <Plus className="w-4 h-4" />
                Agregar al pedido
              </button>

              {customMixCart.length > 0 && (
                <div className="mb-10 space-y-3">
                  <p className="text-sm font-medium text-[#2F4F4F]">Tu pedido</p>
                  {customMixCart.map((item, index) => (
                    <div
                      key={index}
                      className="p-4 bg-white rounded-2xl border border-[#2F4F4F]/15 flex gap-3"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-[#2F4F4F] mb-1">
                          {item.quantity}× mezcla · {item.quantity * 16} cápsulas
                        </p>
                        <ul className="text-xs text-[#1a1a1a]/70 space-y-0.5">
                          {formatCustomMixIngredients(item.recipe).map(line => (
                            <li key={line}>{line}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="flex flex-col items-center justify-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => adjustCustomMixCartQty(index, 1)}
                          disabled={customMixCartJars >= CUSTOM_MIX_MAX_JARS}
                          className="w-9 h-9 rounded-full border border-[#1a1a1a]/10 flex items-center justify-center disabled:opacity-30"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => adjustCustomMixCartQty(index, -1)}
                          className="w-9 h-9 rounded-full border border-[#1a1a1a]/10 flex items-center justify-center"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {customMixCart.length === 0 && (
                <p className="text-sm text-[#1a1a1a]/60 italic pt-6 border-t border-[#1a1a1a]/5">
                  Agregá al menos una mezcla al pedido para consultar stock o enviar por WhatsApp.
                </p>
              )}
            </div>
            </div>

            <AnimatePresence>
              {customMixCart.length > 0 && (
                <motion.div
                  initial={{ y: 100 }}
                  animate={{ y: 0 }}
                  exit={{ y: 100 }}
                  className="shrink-0 border-t border-[#2F4F4F]/15 bg-[#F0E6D2] p-6 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]"
                >
                  <div className="max-w-2xl mx-auto flex flex-col gap-4">
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-xs uppercase tracking-widest text-[#2F4F4F]/70 mb-1">Total Estimado</p>
                        <div className="flex items-baseline gap-2">
                          <span className="text-3xl font-light">
                            ${customMixCartPricing.totalFinal.toLocaleString()}
                          </span>
                          {customMixCartPricing.descuentoAplicado && (
                            <span className="text-sm line-through text-[#2F4F4F]/60">
                              ${customMixCartPricing.totalSinDescuento.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-[#2F4F4F]">
                          {customMixCartPricing.totalJars} frascos
                        </p>
                        {customMixCartPricing.descuentoAplicado && (
                          <p className="text-xs text-[#AB5541] font-bold">
                            -{customMixCartPricing.discountRate * 100}% aplicado
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => openSafetyCheck(true, true)}
                        className="flex items-center justify-center gap-2 bg-[#2F4F4F] text-white rounded-full py-4 px-6 hover:bg-[#244040] transition-colors font-sans text-sm font-medium"
                      >
                        <MessageCircle className="w-4 h-4" />
                        Consultar Stock
                      </button>
                      <button
                        type="button"
                        onClick={() => openSafetyCheck(false, true)}
                        className="flex items-center justify-center gap-2 border border-[#2F4F4F]/20 rounded-full py-4 px-6 hover:bg-[#2F4F4F]/10 transition-colors font-sans text-sm font-medium"
                      >
                        Guardar en WhatsApp
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Niacina Contraindications Modal */}
      <AnimatePresence>
        {showNiacinaModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] bg-[#1a1a1a]/40 backdrop-blur-sm flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-[32px] p-8 w-full max-w-sm shadow-2xl relative"
            >
              <button 
                onClick={() => setShowNiacinaModal(false)}
                className="absolute top-6 right-6 p-2 hover:bg-[#1a1a1a]/5 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-xl serif italic mb-4 text-red-600">Contraindicaciones</h3>
              <div className="text-sm text-[#1a1a1a]/70 leading-relaxed space-y-4">
                <p>
                  Stamets incluye niacina para mejorar la distribución de los compuestos en el sistema nervioso mediante vasodilatación.
                </p>
                <p>
                  El rojecimiento (flush) es inofensivo pero exige precaución ante antecedentes cardíacos o hipertensión.
                </p>
                <p>
                  Iniciá con 50 mg un día sin compromisos para testear tu sensibilidad.
                </p>
              </div>
              <button 
                onClick={() => setShowNiacinaModal(false)}
                className="w-full mt-8 bg-[#1a1a1a] text-white rounded-full py-4 font-medium hover:bg-[#333] transition-colors"
              >
                Entendido
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Password Modal */}
      <AnimatePresence>
        {showPasswordModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-[#1a1a1a]/40 backdrop-blur-sm flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-[32px] p-8 w-full max-w-sm shadow-2xl"
            >
            <div className="flex justify-end items-center mb-6">
                <button onClick={() => setShowPasswordModal(false)}>
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <input 
                  autoFocus
                  type="password"
                  placeholder="Contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#f5f5f0] rounded-2xl px-6 py-4 outline-none focus:ring-2 ring-[#5A5A40]/20 transition-all"
                />
                <button 
                  type="submit"
                  className="w-full bg-[#1a1a1a] text-white rounded-full py-4 font-medium hover:bg-[#333] transition-colors"
                >
                  Entrar
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
