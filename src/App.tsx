import React, { useState, useMemo, useEffect } from 'react';
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
  FlaskConical
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
  color: string;
  imagePrompt: string;
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
    color: '#8B7D6B', // More saturated mushroom brown
    imagePrompt: 'Minimalist watercolor botanical illustration of Lion\'s Mane mushroom (Hericium erinaceus), white cascading icicle-like teeth, soft cream background, elegant artistic style, soft edges'
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
    color: '#7D2D2D', // Deep reddish brown
    imagePrompt: 'Minimalist watercolor botanical illustration of Reishi mushroom (Ganoderma lucidum), shiny reddish-brown kidney-shaped cap, woody texture, soft beige background, artistic wash'
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
    color: '#F27D26', // Vibrant orange
    imagePrompt: 'Minimalist watercolor botanical illustration of Cordyceps sinensis, slender orange club-shaped fungi, elegant line art with soft orange washes, warm background'
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
    color: '#D4B483', // Earthy yellow/beige
    imagePrompt: 'Minimalist watercolor botanical illustration of Ashwagandha plant (Withania somnifera), small green leaves and red berries, delicate roots, soft earthy background, artistic style'
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
    color: '#5E9E98', // Darker teal for legibility
    imagePrompt: 'Minimalist watercolor botanical illustration of Tremella mushroom (Snow fungus), translucent white frilly ruffles, jelly-like texture, soft cool background, delicate washes'
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
    color: '#9E8B85', // Darker muted brown for legibility
    imagePrompt: 'Minimalist watercolor illustration of ground mushroom powder in a wooden spoon, Melena de León texture, soft neutral background, artistic style'
  },
  {
    id: 'chlorella-extract',
    name: 'Chlorella',
    description: 'Detox de metales pesados · Sistema inmune · Oxigenación celular',
    price: 29000,
    capsules: 30,
    mg: 500,
    icon: '🌿',
    category: 'extract',
    color: '#2D6A4F',
    imagePrompt: 'Scientific illustration of Chlorella microalgae cells, vibrant green, clean style, soft cream background'
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
  { id: 'fadiman', name: 'Fadiman Clásico', description: '200 mg La Fuerza', ingredients: { cositas: 200, melena: 0, reishi: 0, ashwagandha: 0, niacina: 0 }, niacinaEnabled: false, ashwagandhaActive: false },
  { id: 'stamets', name: 'Stamets Stack', description: '200 mg La Fuerza, 100 mg Melena, 50 mg Niacina', ingredients: { cositas: 200, melena: 100, reishi: 0, ashwagandha: 0, niacina: 50 }, niacinaEnabled: true, ashwagandhaActive: false },
  { id: 'nocturno', name: 'Nocturno', description: '200 mg La Fuerza, 100 mg Reishi, 50 mg Melena', ingredients: { cositas: 200, melena: 50, reishi: 100, ashwagandha: 0, niacina: 0 }, niacinaEnabled: false, ashwagandhaActive: false }
];

const WHATSAPP_NUMBER = '5493515915643';
const PRODUCER_NAME = 'Charlie';

interface CustomMix {
  ingredients: { [key: string]: number }; // mushroomId: mg
  jars: number; // number of bottles (1, 2, 3)
  isAshwagandhaActive: boolean;
  isNiacinaEnabled: boolean;
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
            className="absolute inset-0 z-10 bg-[#F0E6D2] p-6 flex flex-col items-center justify-center text-center"
          >
            <button 
              onClick={() => setShowInfo(false)}
              className="absolute top-4 right-4 p-2 hover:bg-[#2F4F4F]/10 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
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
            <h4 className="font-medium mb-2">{product.name}</h4>
            <p className="text-xs text-[#2F4F4F]/70 leading-relaxed italic">
              {product.description}
            </p>
            <div className="mt-6 text-xs uppercase tracking-widest text-[#2F4F4F]/70 font-sans">
              {product.capsules} caps · {product.mg} mg
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

export default function App() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isSecretMarketOpen, setIsSecretMarketOpen] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showProtocolInfo, setShowProtocolInfo] = useState(false);
  const [showNiacinaModal, setShowNiacinaModal] = useState(false);
  const [password, setPassword] = useState('');
  const [customMix, setCustomMix] = useState<CustomMix>({
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
  });

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

  const customMixTotalMg = useMemo(() => 
    Object.entries(customMix.ingredients).reduce((acc, [id, mg]) => {
      if (id === 'niacina' && !customMix.isNiacinaEnabled) return acc;
      if (id === 'reishi' && customMix.isAshwagandhaActive) return acc;
      if (id === 'ashwagandha' && !customMix.isAshwagandhaActive) return acc;
      return acc + (mg as number);
    }, 0)
  , [customMix.ingredients, customMix.isNiacinaEnabled, customMix.isAshwagandhaActive]);

  const customMixPricing = useMemo(() => {
    const { ingredients, isAshwagandhaActive, isNiacinaEnabled, jars: Q } = customMix;
    
    const A_cos = ingredients.cositas || 0;
    const A_mel = ingredients.melena || 0;
    const A_adapt = isAshwagandhaActive 
      ? (ingredients.ashwagandha || 0) 
      : (ingredients.reishi || 0);
    const A_nia = isNiacinaEnabled ? (ingredients.niacina || 0) : 0;

    // Cost of ingredients per capsule
    const C_ing_cap = 
      (A_cos / 1000) * 10000 +
      (A_mel / 1000) * 760 +
      (A_adapt / 1000) * 760 +
      (A_nia / 1000) * 100;

    // Cost total per jar (16 capsules)
    // F = 700 + 250 + 2000 + 432 = 3382
    const C_jar = 16 * C_ing_cap + 3382;
    
    // Subtotal before discount
    const S = Q * C_jar;
    
    // Discount (10% off if Q >= 2)
    const S_disc = Q >= 2 ? S * 0.9 : S;
    
    // Final totals (Price to customer) with rounding to nearest 100
    const totalSinDescuento = Math.round((S + 5500) / 100) * 100;
    const T = Math.round((S_disc + 5500) / 100) * 100;

    return {
      costoPorCapsula: C_ing_cap,
      costoPorFrasco: C_jar,
      subtotal: S,
      subtotalConDescuento: S_disc,
      totalSinDescuento,
      totalFinal: T,
      descuentoAplicado: Q >= 2
    };
  }, [customMix]);

  const handleWhatsApp = (toSeller: boolean, isCustom: boolean = false) => {
    // Market (main cart): "Hola Charlie" (Secret Market mantiene "Hola" sin nombre)
    let message = `¡Hola Charlie! Quisiera consultar este pedido:\n\n`;

    if (isCustom) {
      message = `¡Hola! Quisiera consultar este pedido:\n\n`;
      message += `Mi mezcla personalizada – ${customMix.jars} frascos (${customMix.jars * 16} cápsulas)\n`;
      
      const activeIngredients = Object.entries(customMix.ingredients)
        .filter(([id, mg]) => {
          if (id === 'niacina' && !customMix.isNiacinaEnabled) return false;
          if (id === 'reishi' && customMix.isAshwagandhaActive) return false;
          if (id === 'ashwagandha' && !customMix.isAshwagandhaActive) return false;
          return (mg as number) > 0;
        });

      activeIngredients.forEach(([id, mg]) => {
        const name = MUSHROOM_INGREDIENTS.find(i => i.id === id)?.name;
        const suffix = id === 'niacina' ? ' (Stamets)' : '';
        message += `• ${name}: ${mg} mg/cap${suffix}\n`;
      });
      message += `\n`;

      const roundedTotalSinDescuento = Math.round(customMixPricing.totalSinDescuento / 100) * 100;
      const roundedDiscount = Math.max(0, roundedTotalSinDescuento - customMixPricing.totalFinal);

      if (customMixPricing.descuentoAplicado) {
        message += `Subtotal: $${roundedTotalSinDescuento.toLocaleString()}\n`;
        message += `Descuento 10%: -$${roundedDiscount.toLocaleString()}\n`;
        message += `*Total productos: $${customMixPricing.totalFinal.toLocaleString()}*\n`;
      } else {
        message += `*Total:* $${customMixPricing.totalFinal.toLocaleString()}\n`;
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
                  onClick={() => handleWhatsApp(true)}
                  className="flex items-center justify-center gap-2 bg-[#2F4F4F] text-white rounded-full py-4 px-6 hover:bg-[#244040] transition-colors font-sans text-sm font-medium"
                >
                  <MessageCircle className="w-4 h-4" />
                  Consultar Stock
                </button>
                <button 
                  onClick={() => handleWhatsApp(false)}
                  className="flex items-center justify-center gap-2 border border-[#2F4F4F]/20 rounded-full py-4 px-6 hover:bg-[#2F4F4F]/10 transition-colors font-sans text-sm font-medium"
                >
                  Guardar en WhatsApp
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Secret Market Modal */}
      <AnimatePresence>
        {isSecretMarketOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-[#F0E6D2] overflow-y-auto"
          >
            <div className="max-w-2xl mx-auto px-6 pt-8 pb-12">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <FlaskConical className="w-6 h-6 text-[#2F4F4F]" />
                  <h2 className="text-2xl serif italic text-[#2F4F4F]">Cápsulas a Medida</h2>
                </div>
                <button 
                  onClick={() => setIsSecretMarketOpen(false)}
                  className="w-11 h-11 hover:bg-[#2F4F4F]/10 rounded-full flex items-center justify-center"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <p className="text-base text-[#1a1a1a]/80 mb-6 leading-relaxed">
                Armá tu frasco personalizado. Cada frasco contiene 16 cápsulas. 
                Máximo 350 mg total por cápsula. Podés elegir un protocolo o ajustar los valores según tu necesidad.
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
                    min="100"
                    max={350}
                    step="50"
                    value={customMix.ingredients.cositas}
                    onChange={(e) => {
                      const raw = parseInt(e.target.value);
                      const otherTotal = customMixTotalMg - customMix.ingredients.cositas;
                      const allowed = Math.max(100, 350 - otherTotal);
                      const val = Math.min(raw, allowed);
                      setCustomMix(prev => ({
                        ...prev,
                        ingredients: { ...prev.ingredients, cositas: val }
                      }));
                    }}
                    className="w-full h-2 rounded-full appearance-none cursor-pointer accent-[#2F4F4F] bg-[#F0E6D2]/60"
                  />
                  <div className="flex justify-between text-xs text-[#2F4F4F]/70 font-mono">
                    <span>100mg</span>
                    <span>150mg</span>
                    <span>200mg</span>
                    <span>250mg</span>
                    <span>300mg</span>
                    <span>350mg</span>
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

              <div className="flex items-center justify-between mb-12">
                <div>
                  <p className="text-sm font-medium">Cantidad de frascos (16 caps)</p>
                  <p className="text-xs text-[#1a1a1a]/70">10% OFF llevando 2 o 3</p>
                </div>
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setCustomMix(p => ({ ...p, jars: Math.max(1, p.jars - 1) }))}
                    className="w-11 h-11 rounded-full border border-[#1a1a1a]/10 flex items-center justify-center"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-xl font-medium w-8 text-center">{customMix.jars}</span>
                  <button 
                    onClick={() => setCustomMix(p => ({ ...p, jars: Math.min(3, p.jars + 1) }))}
                    className="w-11 h-11 rounded-full border border-[#1a1a1a]/10 flex items-center justify-center"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-6 pt-6 border-t border-[#1a1a1a]/5">
                <div className="flex justify-between items-end">
                  <div className="w-full">
                    {customMixPricing.descuentoAplicado && (
                      <p className="text-sm text-[#888] line-through mb-4">
                        ${customMixPricing.totalSinDescuento.toLocaleString()}
                      </p>
                    )}
                    <p className="text-sm font-bold uppercase tracking-widest text-[#1a1a1a] mb-1">
                      TOTAL FINAL
                    </p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-mono font-bold text-[#5A5A40]">
                        ${customMixPricing.totalFinal.toLocaleString()}
                      </span>
                      <span className="text-sm opacity-40">ARS</span>
                    </div>
                    {customMixPricing.descuentoAplicado && (
                      <p className="text-sm text-[#2F7D32] font-bold mt-2">
                        (10% OFF aplicado)
                      </p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => handleWhatsApp(true, true)}
                    className="flex items-center justify-center gap-2 bg-[#1a1a1a] text-white rounded-full py-4 px-6 hover:bg-[#333] transition-colors font-sans text-sm font-medium"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Consultar Stock
                  </button>
                  <button 
                    onClick={() => handleWhatsApp(false, true)}
                    className="flex items-center justify-center gap-2 border border-[#1a1a1a]/20 rounded-full py-4 px-6 hover:bg-[#1a1a1a]/5 transition-colors font-sans text-sm font-medium"
                  >
                    Guardar en WhatsApp
                  </button>
                </div>
              </div>
            </div>
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
