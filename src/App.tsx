import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet marker icons for Vite
// @ts-ignore
import icon from 'leaflet/dist/images/marker-icon.png';
// @ts-ignore
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// @ts-ignore
window.L = L;
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import { 
  Droplets, 
  MapPin, 
  Phone, 
  Calculator, 
  ShieldCheck, 
  Clock, 
  Zap, 
  Navigation, 
  Menu, 
  X, 
  ChevronRight, 
  Fuel, 
  AlertTriangle, 
  Settings, 
  LayoutDashboard, 
  History, 
  CreditCard, 
  User, 
  ArrowUpRight,
  Gauge,
  Wind,
  Droplet,
  Waves,
  Wrench,
  Truck,
  QrCode,
  Award,
  Bell,
  Sun,
  Moon,
  TrendingUp,
  MoreVertical,
  CheckCircle2,
  Share2,
  RefreshCw,
  LogOut,
  Star
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  BarChart, 
  Bar, 
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { cn } from './lib/utils';

// --- Types ---
type VehicleType = 'Bike' | 'Car' | 'Auto' | 'Bus' | 'Truck' | 'Custom';
type FuelType = 'Petrol' | 'Diesel';
type StockStatus = 'Normal' | 'Low' | 'Critical';

interface StockData {
  type: FuelType;
  available: number;
  capacity: number;
  price: number;
  lastUpdated: string;
}

interface Service {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

// --- Mock Data ---
const INITIAL_STOCK: StockData[] = [
  { type: 'Petrol', available: 12500, capacity: 15000, price: 102.45, lastUpdated: '10 mins ago' },
  { type: 'Diesel', available: 4200, capacity: 15000, price: 94.12, lastUpdated: '15 mins ago' },
];

const SERVICES: Service[] = [
  { id: 'petrol', title: 'Premium Petrol', description: 'High-octane fuel for peak engine performance.', icon: <Fuel className="w-6 h-6" /> },
  { id: 'diesel', title: 'Ultra Diesel', description: 'Clean-burning diesel for heavy-duty efficiency.', icon: <Droplets className="w-6 h-6" /> },
  { id: 'air', title: 'Nitrogen Air', description: 'Free tire pressure checks and nitrogen filling.', icon: <Wind className="w-6 h-6" /> },
  { id: 'oil', title: 'Engine Oil', description: 'Top-tier lubricants for all vehicle types.', icon: <Droplet className="w-6 h-6" /> },
  { id: 'wash', title: 'Eco Wash', description: 'Water-efficient high-pressure cleaning.', icon: <Waves className="w-6 h-6" /> },
  { id: 'puncture', title: 'Puncture Support', description: 'Quick on-site puncture repairs.', icon: <Wrench className="w-6 h-6" /> },
  { id: 'emergency', title: 'Fuel Delivery', description: 'Emergency fuel delivered to your location.', icon: <Truck className="w-6 h-6" /> },
  { id: 'support', title: '24/7 Assistance', description: 'Round-the-clock help for all customers.', icon: <ShieldCheck className="w-6 h-6" /> },
];

const USAGE_DATA = [
  { month: 'Jan', usage: 4500 },
  { month: 'Feb', usage: 5200 },
  { month: 'Mar', usage: 4800 },
  { month: 'Apr', usage: 6100 },
  { month: 'May', usage: 5900 },
  { month: 'Jun', usage: 7200 },
];

// --- Map Helper Components ---
function LocationPicker({ onLocationSelect, position }: { onLocationSelect: (lat: number, lng: number) => void, position: [number, number] | null }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });

  return position ? <Marker position={position} /> : null;
}

function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  map.setView(center, map.getZoom());
  return null;
}

// --- Routing Machine Component ---
// @ts-ignore
const RoutingMachine = ({ start, end }: { start: [number, number], end: [number, number] }) => {
  const map = useMap();

  useEffect(() => {
    if (!map || !start || !end) return;

    // @ts-ignore
    if (!L.Routing || !L.Routing.control) {
      console.error("Leaflet Routing Machine not loaded correctly");
      return;
    }

    // @ts-ignore
    const routingControl = L.Routing.control({
      waypoints: [
        L.latLng(start[0], start[1]),
        L.latLng(end[0], end[1])
      ],
      routeWhileDragging: false,
      addWaypoints: false,
      fitSelectedRoutes: true,
      showAlternatives: false,
      lineOptions: {
        styles: [{ color: '#f59e0b', weight: 6 }],
        extendToWaypoints: true,
        missingRouteTolerance: 10
      },
      // @ts-ignore
      createMarker: function(i, wp) {
        return L.marker(wp.latLng, {
          draggable: false,
          icon: L.icon({
            iconUrl: i === 0 
              ? 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png' 
              : 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
          })
        }).bindPopup(i === 0 ? "Admin Location" : "Customer Location");
      }
    }).addTo(map);

    return () => {
      if (map && routingControl) {
        try {
          // Check if the control is still on the map before removing
          // @ts-ignore
          if (map.hasLayer && typeof map.removeControl === 'function') {
            map.removeControl(routingControl);
          }
        } catch (e) {
          // Silently fail if already removed or map is gone
        }
      }
    };
  }, [map, start, end]);

  return null;
};

// --- Components ---

const SectionTitle = ({ title, subtitle, light = false }: { title: string; subtitle?: string; light?: boolean }) => (
  <div className="mb-12 text-center">
    <motion.h2 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={cn("text-3xl md:text-4xl font-bold mb-4", light ? "text-white" : "text-slate-900")}
    >
      {title}
    </motion.h2>
    {subtitle && (
      <motion.p 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1 }}
        className={cn("max-w-2xl mx-auto text-lg", light ? "text-slate-300" : "text-slate-600")}
      >
        {subtitle}
      </motion.p>
    )}
  </div>
);

const Card = ({ children, className, ...props }: { children: React.ReactNode; className?: string } & React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden", className)} {...props}>
    {children}
  </div>
);

export default function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [user, setUser] = useState<any | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [stock, setStock] = useState<StockData[]>(INITIAL_STOCK);
  const [emergencyRequests, setEmergencyRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStock = async () => {
      try {
        const res = await fetch('/api/stock');
        if (res.ok) {
          const data = await res.json();
          setStock(data);
        }
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching stock", error);
        setIsLoading(false);
      }
    };
    fetchStock();
    const interval = setInterval(fetchStock, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!isAdminMode) return;
    const fetchRequests = async () => {
      try {
        const res = await fetch('/api/requests');
        if (res.ok) {
          const data = await res.json();
          setEmergencyRequests(data);
        }
      } catch (error) {
        console.error("Error fetching requests", error);
      }
    };
    fetchRequests();
    const interval = setInterval(fetchRequests, 5000);
    return () => clearInterval(interval);
  }, [isAdminMode]);
  
  // Calculator State
  const [calcVehicle, setCalcVehicle] = useState<VehicleType>('Car');
  const [calcDistance, setCalcDistance] = useState<number>(50);
  const [calcMileage, setCalcMileage] = useState<number>(15);
  const [calcFuelType, setCalcFuelType] = useState<FuelType>('Petrol');

  // Emergency Form State
  const [emergencyForm, setEmergencyForm] = useState({
    name: '',
    mobile: '',
    location: '',
    fuelType: 'Petrol' as FuelType,
    quantity: 5,
    vehicle: 'Car' as VehicleType
  });
  const [mapPosition, setMapPosition] = useState<[number, number] | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([20.5937, 78.9629]); // Default center (India)
  const [adminLocation, setAdminLocation] = useState<[number, number] | null>(null);
  const [selectedRequestForNav, setSelectedRequestForNav] = useState<any | null>(null);
  const [showNavModal, setShowNavModal] = useState(false);

  useEffect(() => {
    if (isAdminMode && !adminLocation) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setAdminLocation([position.coords.latitude, position.coords.longitude]);
          },
          (error) => console.error("Admin location error:", error)
        );
      }
    }
  }, [isAdminMode, adminLocation]);

  const getStockStatus = (available: number, capacity: number): StockStatus => {
    const percentage = (available / capacity) * 100;
    if (percentage < 15) return 'Critical';
    if (percentage < 30) return 'Low';
    return 'Normal';
  };

  const calcResult = useMemo(() => {
    const liters = calcDistance / calcMileage;
    const price = stock.find(s => s.type === calcFuelType)?.price || 0;
    const cost = liters * price;
    return { liters: liters.toFixed(2), cost: cost.toFixed(2) };
  }, [calcDistance, calcMileage, calcFuelType, stock]);

  const updateStockBackend = async (type: FuelType, available?: number, price?: number) => {
    try {
      await fetch('/api/stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, available, price })
      });
    } catch (error) {
      console.error("Error updating stock", error);
    }
  };

  const updateRequestStatus = async (id: string, status: string) => {
    try {
      await fetch(`/api/requests/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
    } catch (error) {
      console.error("Error updating request", error);
    }
  };

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  const handleLogin = async (e: React.MouseEvent | React.FormEvent) => {
    if (e) e.preventDefault();
    setLoginError('');
    
    if (adminPassword === "admin123") {
      setIsAdminMode(true);
      setUser({ email: 'preciousbobby00@gmail.com' } as any);
      setShowLoginModal(false);
      setAdminPassword('');
    } else {
      setLoginError("Access denied. Incorrect password.");
    }
  };

  const handleAdminClick = () => {
    if (user) {
      setIsAdminMode(!isAdminMode);
    } else {
      setShowLoginModal(true);
    }
  };

  const handleLogout = async () => {
    setUser(null);
    setIsAdminMode(false);
  };

  const handleNavigate = (req: any) => {
    // Parse location if it's coordinates
    const coords = req.location.split(',').map((c: string) => parseFloat(c.trim()));
    if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
      setSelectedRequestForNav({ ...req, coords });
      setShowNavModal(true);
    } else {
      // Fallback to Google Maps search if not coordinates
      const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(req.location)}`;
      window.open(url, '_blank');
    }
  };

  const detectLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setMapPosition([latitude, longitude]);
          setMapCenter([latitude, longitude]);
          setEmergencyForm(prev => ({ ...prev, location: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}` }));
        },
        (error) => {
          console.error("Error detecting location:", error);
          alert("Could not detect location. Please select manually on the map.");
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  return (
    <div className={cn(
      "min-h-screen font-sans transition-colors duration-300",
      isDarkMode ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"
    )}>
      {/* --- Navigation --- */}
      <nav className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b",
        isDarkMode ? "bg-slate-950/80 border-slate-800" : "bg-white/80 border-slate-200",
        "backdrop-blur-md"
      )}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20">
                <Fuel className="text-white w-6 h-6" />
              </div>
              <span className="text-2xl font-bold tracking-tight">Fuel<span className="text-amber-500">Lux</span></span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-8">
              {['Home', 'Stock', 'Calculator', 'Emergency', 'Services'].map((item) => (
                <a 
                  key={item} 
                  href={`#${item.toLowerCase()}`} 
                  className="text-sm font-medium hover:text-amber-500 transition-colors"
                >
                  {item}
                </a>
              ))}
              <button 
                onClick={toggleDarkMode}
                className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button 
                onClick={handleAdminClick}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all",
                  isAdminMode 
                    ? "bg-amber-500 text-white shadow-lg shadow-amber-500/20" 
                    : "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                )}
              >
                <Settings className="w-4 h-4" />
                {isAdminMode ? 'Admin Mode' : 'Admin'}
              </button>
              {!!user && (
                <button 
                  onClick={handleLogout}
                  className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors text-red-500"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Mobile Toggle */}
            <div className="md:hidden flex items-center gap-4">
              <button onClick={toggleDarkMode}>
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
                {isMenuOpen ? <X /> : <Menu />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white dark:bg-slate-900 border-t dark:border-slate-800"
            >
              <div className="px-4 py-6 space-y-4">
                {['Home', 'Stock', 'Calculator', 'Emergency', 'Services'].map((item) => (
                  <a 
                    key={item} 
                    href={`#${item.toLowerCase()}`} 
                    className="block text-lg font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item}
                  </a>
                ))}
                <button 
                  onClick={() => { 
                    handleAdminClick();
                    setIsMenuOpen(false); 
                  }}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-xl"
                >
                  <Settings className="w-4 h-4" />
                  {isAdminMode ? 'Exit Admin' : (!!user ? 'Admin Mode' : 'Admin Access')}
                </button>
                {!!user && (
                  <button 
                    onClick={() => { handleLogout(); setIsMenuOpen(false); }}
                    className="w-full py-3 text-red-500 font-bold"
                  >
                    Logout
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* --- Hero Section --- */}
      <section id="home" className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500/10 blur-[120px] rounded-full" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-500/10 blur-[120px] rounded-full" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-full text-sm font-bold mb-6">
                <ShieldCheck className="w-4 h-4" />
                Trusted Fuel Partner Since 1998
              </div>
              <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-6">
                Fueling Your <br />
                <span className="text-amber-500">Premium Journey</span>
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-400 mb-10 max-w-lg leading-relaxed">
                Experience the future of fuel management. Real-time stock updates, smart consumption tracking, and elite emergency assistance at your fingertips.
              </p>
              <div className="flex flex-wrap gap-4">
                <a href="#stock" className="px-8 py-4 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-2xl font-bold shadow-xl hover:scale-105 transition-transform flex items-center gap-2">
                  Check Stock <ChevronRight className="w-4 h-4" />
                </a>
                <a href="#emergency" className="px-8 py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2">
                  Emergency Help <Phone className="w-4 h-4" />
                </a>
              </div>
              
              <div className="mt-12 flex items-center gap-8">
                <div className="flex -space-x-3">
                  {[1,2,3,4].map(i => (
                    <img 
                      key={i}
                      src={`https://picsum.photos/seed/user${i}/100/100`} 
                      alt="User" 
                      className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-900"
                      referrerPolicy="no-referrer"
                    />
                  ))}
                </div>
                <div className="text-sm">
                  <p className="font-bold">10k+ Happy Customers</p>
                  <p className="text-slate-500">Rated 4.9/5 stars</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl shadow-amber-500/20">
                <img 
                  src="https://picsum.photos/seed/fuelstation/1000/600" 
                  alt="Modern Fuel Station" 
                  className="w-full h-[500px] object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
                <div className="absolute bottom-8 left-8 right-8">
                  <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-white font-bold">Live Prices</span>
                      <span className="text-xs text-slate-300">Updated: Today, 6:00 AM</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      {stock.map(s => (
                        <div key={s.type} className="flex flex-col">
                          <span className="text-slate-300 text-xs uppercase tracking-wider">{s.type}</span>
                          <span className="text-white text-2xl font-bold">₹{s.price}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating Widgets */}
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute -top-6 -right-6 bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 z-20"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500/10 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="text-green-500 w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Stock Status</p>
                    <p className="font-bold text-sm">Full Availability</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* --- Live Stock Monitoring --- */}
      <section id="stock" className="py-24 bg-white dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle 
            title="Live Fuel Inventory" 
            subtitle="Real-time monitoring of our fuel reserves to ensure you're never left stranded."
          />

          <div className="grid md:grid-cols-2 gap-8">
            {stock.map((s) => {
              const status = getStockStatus(s.available, s.capacity);
              const percentage = (s.available / s.capacity) * 100;
              
              return (
                <Card key={s.type} className="p-8 group hover:border-amber-500/30 transition-all duration-500 dark:bg-slate-800 dark:border-slate-700">
                  <div className="flex justify-between items-start mb-8">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-14 h-14 rounded-2xl flex items-center justify-center",
                        s.type === 'Petrol' ? "bg-amber-500/10 text-amber-500" : "bg-indigo-500/10 text-indigo-500"
                      )}>
                        {s.type === 'Petrol' ? <Fuel className="w-8 h-8" /> : <Droplets className="w-8 h-8" />}
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold">{s.type}</h3>
                        <p className="text-sm text-slate-500">Last updated {s.lastUpdated}</p>
                      </div>
                    </div>
                    <div className={cn(
                      "px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider",
                      status === 'Normal' ? "bg-green-500/10 text-green-600" :
                      status === 'Low' ? "bg-amber-500/10 text-amber-600" :
                      "bg-red-500/10 text-red-600"
                    )}>
                      {status} Status
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex justify-between items-end">
                      <div>
                        <span className="text-4xl font-bold">{s.available.toLocaleString()}</span>
                        <span className="text-slate-500 ml-2">Liters Available</span>
                      </div>
                      <span className="text-xl font-bold text-slate-400">/ {s.capacity.toLocaleString()} L</span>
                    </div>

                    <div className="relative h-4 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        whileInView={{ width: `${percentage}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className={cn(
                          "absolute top-0 left-0 h-full rounded-full",
                          s.type === 'Petrol' ? "bg-amber-500" : "bg-indigo-500"
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4 pt-4">
                      <div className="text-center p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                        <p className="text-xs text-slate-500 mb-1 uppercase">Price</p>
                        <p className="font-bold">₹{s.price}</p>
                      </div>
                      <div className="text-center p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                        <p className="text-xs text-slate-500 mb-1 uppercase">Capacity</p>
                        <p className="font-bold">{Math.round(percentage)}%</p>
                      </div>
                      <div className="text-center p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                        <p className="text-xs text-slate-500 mb-1 uppercase">Quality</p>
                        <p className="font-bold">99.9%</p>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* --- Fuel Consumption Calculator --- */}
      <section id="calculator" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle 
            title="Smart Fuel Calculator" 
            subtitle="Plan your journey with precision. Estimate fuel requirements and costs instantly."
          />

          <div className="grid lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-2 p-8 dark:bg-slate-800 dark:border-slate-700">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold mb-3 uppercase tracking-wider text-slate-500">Vehicle Type</label>
                    <div className="grid grid-cols-3 gap-3">
                      {(['Bike', 'Car', 'Auto', 'Bus', 'Truck', 'Custom'] as VehicleType[]).map(v => (
                        <button
                          key={v}
                          onClick={() => setCalcVehicle(v)}
                          className={cn(
                            "py-3 rounded-xl text-sm font-bold border transition-all",
                            calcVehicle === v 
                              ? "bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900" 
                              : "bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 hover:border-amber-500"
                          )}
                        >
                          {v}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold mb-3 uppercase tracking-wider text-slate-500">Fuel Type</label>
                    <div className="flex gap-4">
                      {(['Petrol', 'Diesel'] as FuelType[]).map(f => (
                        <button
                          key={f}
                          onClick={() => setCalcFuelType(f)}
                          className={cn(
                            "flex-1 py-4 rounded-xl font-bold border flex items-center justify-center gap-2 transition-all",
                            calcFuelType === f 
                              ? "bg-amber-500 text-white border-amber-500" 
                              : "bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 hover:border-amber-500"
                          )}
                        >
                          {f === 'Petrol' ? <Fuel className="w-5 h-5" /> : <Droplets className="w-5 h-5" />}
                          {f}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold mb-3 uppercase tracking-wider text-slate-500">Distance (km)</label>
                    <div className="relative">
                      <Navigation className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                      <input 
                        type="number" 
                        value={calcDistance}
                        onChange={(e) => setCalcDistance(Number(e.target.value))}
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-700 rounded-xl border-none focus:ring-2 focus:ring-amber-500 font-bold"
                        placeholder="Enter distance..."
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold mb-3 uppercase tracking-wider text-slate-500">Mileage (km/L)</label>
                    <div className="relative">
                      <Gauge className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                      <input 
                        type="number" 
                        value={calcMileage}
                        onChange={(e) => setCalcMileage(Number(e.target.value))}
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-700 rounded-xl border-none focus:ring-2 focus:ring-amber-500 font-bold"
                        placeholder="Enter mileage..."
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-8 bg-slate-900 text-white dark:bg-amber-500 dark:text-white">
              <h3 className="text-xl font-bold mb-8 flex items-center gap-2">
                <Calculator className="w-6 h-6" />
                Estimation Result
              </h3>
              
              <div className="space-y-8">
                <div>
                  <p className="text-slate-400 dark:text-amber-100 text-sm uppercase tracking-widest mb-1">Fuel Required</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold">{calcResult.liters}</span>
                    <span className="text-xl opacity-60">Liters</span>
                  </div>
                </div>

                <div>
                  <p className="text-slate-400 dark:text-amber-100 text-sm uppercase tracking-widest mb-1">Estimated Cost</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold">₹{calcResult.cost}</span>
                  </div>
                </div>

                <div className="pt-8 border-t border-white/10">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm opacity-70">Carbon Footprint</span>
                    <span className="text-sm font-bold">~{(Number(calcResult.liters) * 2.3).toFixed(1)} kg CO2</span>
                  </div>
                  <button className="w-full py-4 bg-white text-slate-900 dark:bg-slate-900 dark:text-white rounded-xl font-bold hover:scale-105 transition-transform">
                    Book Fuel Now
                  </button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* --- Emergency Fuel Assistance --- */}
      <section id="emergency" className="py-24 bg-slate-900 text-white overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500 rounded-full blur-[100px]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-red-500 rounded-full blur-[100px]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-sm font-bold mb-6">
                <AlertTriangle className="w-4 h-4" />
                24/7 Emergency Support
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Ran Out of Fuel? <br />
                <span className="text-amber-500">We've Got You Covered.</span>
              </h2>
              <p className="text-slate-400 text-lg mb-10 leading-relaxed">
                Our rapid response team delivers fuel directly to your location within 30 minutes. Stay safe, we're on our way.
              </p>

              <div className="grid sm:grid-cols-2 gap-6 mb-10">
                <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
                  <Phone className="text-amber-500 w-8 h-8 mb-4" />
                  <h4 className="font-bold mb-2">Direct Call</h4>
                  <p className="text-sm text-slate-400 mb-4">Immediate connection to our rescue team.</p>
                  <a href="tel:+917204451674" className="text-amber-500 font-bold flex items-center gap-1 hover:underline">
                    +91 72044 51674 <ArrowUpRight className="w-4 h-4" />
                  </a>
                </div>
                <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
                  <Share2 className="text-green-500 w-8 h-8 mb-4" />
                  <h4 className="font-bold mb-2">WhatsApp Help</h4>
                  <p className="text-sm text-slate-400 mb-4">Share your live location for faster delivery.</p>
                  <a href="https://wa.me/919876543210" target="_blank" className="text-green-500 font-bold flex items-center gap-1 hover:underline">
                    Chat on WhatsApp <ArrowUpRight className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>

            <Card className="p-8 bg-white text-slate-900 border-none shadow-2xl">
              <h3 className="text-2xl font-bold mb-6">Request Emergency Delivery</h3>
              <form className="space-y-4" onSubmit={async (e) => {
                e.preventDefault();
                try {
                  await fetch('/api/requests', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      name: emergencyForm.name,
                      phone: emergencyForm.mobile,
                      location: emergencyForm.location,
                      fuelType: emergencyForm.fuelType,
                      quantity: emergencyForm.quantity,
                      coords: mapPosition
                    })
                  });
                  alert("Emergency request submitted successfully! Our team will contact you shortly.");
                  setEmergencyForm({ ...emergencyForm, name: '', mobile: '', location: '' });
                } catch (error) {
                  console.error("Error submitting request", error);
                  alert("Failed to submit request. Please try again or call us directly.");
                }
              }}>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-slate-500">Name</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-3 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-amber-500" 
                      placeholder="John Doe"
                      value={emergencyForm.name}
                      onChange={(e) => setEmergencyForm({...emergencyForm, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-slate-500">Mobile</label>
                    <input 
                      type="tel" 
                      className="w-full px-4 py-3 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-amber-500" 
                      placeholder="+91 00000 00000"
                      value={emergencyForm.mobile}
                      onChange={(e) => setEmergencyForm({...emergencyForm, mobile: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-slate-500 flex justify-between items-center">
                    Current Location
                    <button 
                      type="button"
                      onClick={detectLocation}
                      className="text-[10px] text-amber-500 hover:underline flex items-center gap-1"
                    >
                      <Navigation className="w-3 h-3" /> Detect Me
                    </button>
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 z-10" />
                    <input 
                      type="text" 
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-amber-500 mb-2" 
                      placeholder="Street, Landmark or Coordinates..."
                      value={emergencyForm.location}
                      onChange={(e) => setEmergencyForm({...emergencyForm, location: e.target.value})}
                    />
                  </div>
                  <div className="h-48 w-full rounded-xl overflow-hidden border border-slate-100 z-0">
                    <MapContainer center={mapCenter} zoom={5} style={{ height: '100%', width: '100%' }}>
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      />
                      <ChangeView center={mapCenter} />
                      <LocationPicker 
                        position={mapPosition} 
                        onLocationSelect={(lat, lng) => {
                          setMapPosition([lat, lng]);
                          setEmergencyForm(prev => ({ ...prev, location: `${lat.toFixed(6)}, ${lng.toFixed(6)}` }));
                        }} 
                      />
                    </MapContainer>
                  </div>
                  <p className="text-[10px] text-slate-400 italic">Click on the map to pin your exact location.</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-slate-500">Fuel Type</label>
                    <select 
                      className="w-full px-4 py-3 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-amber-500"
                      value={emergencyForm.fuelType}
                      onChange={(e) => setEmergencyForm({...emergencyForm, fuelType: e.target.value as FuelType})}
                    >
                      <option>Petrol</option>
                      <option>Diesel</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-slate-500">Quantity (L)</label>
                    <input 
                      type="number" 
                      className="w-full px-4 py-3 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-amber-500" 
                      value={emergencyForm.quantity}
                      onChange={(e) => setEmergencyForm({...emergencyForm, quantity: Number(e.target.value)})}
                    />
                  </div>
                </div>
                <button className="w-full py-4 bg-red-600 text-white rounded-xl font-bold shadow-lg shadow-red-600/20 hover:bg-red-700 transition-colors mt-4">
                  Send Emergency Request
                </button>
                <p className="text-center text-xs text-slate-400 mt-4">
                  By clicking, you agree to our emergency service terms and conditions.
                </p>
              </form>
            </Card>
          </div>
        </div>
      </section>

      {/* --- Services Section --- */}
      <section id="services" className="py-24 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle 
            title="Premium Services" 
            subtitle="Beyond just fuel. We provide a comprehensive suite of automotive care services."
          />

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {SERVICES.map((service, idx) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="p-6 h-full hover:shadow-xl hover:-translate-y-1 transition-all group dark:bg-slate-800 dark:border-slate-700">
                  <div className="w-12 h-12 bg-slate-50 dark:bg-slate-700 rounded-xl flex items-center justify-center text-slate-900 dark:text-white mb-6 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                    {service.icon}
                  </div>
                  <h4 className="text-xl font-bold mb-3">{service.title}</h4>
                  <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                    {service.description}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- Customer Dashboard / Smart Features --- */}
      <section className="py-24 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Analytics Card */}
            <Card className="lg:col-span-2 p-8 dark:bg-slate-800 dark:border-slate-700">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-2xl font-bold">Fuel Analytics</h3>
                  <p className="text-sm text-slate-500">Your monthly consumption overview</p>
                </div>
                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-slate-100 dark:bg-slate-700 rounded-lg text-xs font-bold">Month</button>
                  <button className="px-4 py-2 text-xs font-bold text-slate-500">Year</button>
                </div>
              </div>
              
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={USAGE_DATA}>
                    <defs>
                      <linearGradient id="colorUsage" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                    <Area type="monotone" dataKey="usage" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#colorUsage)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Smart Features Sidebar */}
            <div className="space-y-6">
              <Card className="p-6 bg-gradient-to-br from-indigo-600 to-indigo-800 text-white border-none">
                <div className="flex justify-between items-start mb-6">
                  <Award className="w-10 h-10 text-indigo-200" />
                  <div className="text-right">
                    <p className="text-xs text-indigo-200 uppercase tracking-widest">Loyalty Points</p>
                    <p className="text-3xl font-bold">2,450</p>
                  </div>
                </div>
                <p className="text-sm text-indigo-100 mb-6">You're only 550 points away from a free full tank!</p>
                <div className="h-2 bg-white/20 rounded-full overflow-hidden mb-6">
                  <div className="h-full bg-white w-[80%]" />
                </div>
                <button className="w-full py-3 bg-white text-indigo-600 rounded-xl font-bold text-sm">Redeem Rewards</button>
              </Card>

              <Card className="p-6 dark:bg-slate-800 dark:border-slate-700">
                <h4 className="font-bold mb-4 flex items-center gap-2">
                  <Bell className="w-4 h-4 text-amber-500" />
                  Smart Alerts
                </h4>
                <div className="space-y-4">
                  <div className="flex gap-3 p-3 bg-slate-50 dark:bg-slate-700 rounded-xl">
                    <div className="w-2 h-2 bg-amber-500 rounded-full mt-1.5 shrink-0" />
                    <p className="text-xs leading-relaxed">Petrol price expected to drop by ₹0.50 tomorrow morning.</p>
                  </div>
                  <div className="flex gap-3 p-3 bg-slate-50 dark:bg-slate-700 rounded-xl">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full mt-1.5 shrink-0" />
                    <p className="text-xs leading-relaxed">Your vehicle service is due in 15 days. Book now for a 10% discount.</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 dark:bg-slate-800 dark:border-slate-700">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-bold">Quick Pay</h4>
                  <QrCode className="w-5 h-5 text-slate-400" />
                </div>
                <div className="aspect-square bg-slate-100 dark:bg-slate-700 rounded-2xl flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-600">
                  <div className="text-center p-4">
                    <QrCode className="w-12 h-12 mx-auto text-slate-300 mb-2" />
                    <p className="text-[10px] text-slate-500 uppercase font-bold">Scan to Pay Instantly</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* --- Map and Location --- */}
      <section className="py-24 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <div className="rounded-3xl overflow-hidden shadow-2xl border border-slate-100 dark:border-slate-800 h-[500px] relative">
                {/* Mock Map Background */}
                <div className="absolute inset-0 bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <MapPin className="w-16 h-16 text-amber-500 mx-auto animate-bounce" />
                    <p className="text-slate-500 font-medium">Interactive Map View</p>
                  </div>
                </div>
                {/* Map UI Overlays */}
                <div className="absolute top-6 left-6 right-6 flex justify-between">
                  <div className="bg-white dark:bg-slate-900 p-3 rounded-xl shadow-lg flex items-center gap-3">
                    <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center text-white">
                      <Navigation className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase font-bold">Distance</p>
                      <p className="text-sm font-bold">2.4 km away</p>
                    </div>
                  </div>
                  <button className="bg-white dark:bg-slate-900 p-3 rounded-xl shadow-lg">
                    <TrendingUp className="w-5 h-5 text-slate-400" />
                  </button>
                </div>
                <div className="absolute bottom-6 left-6 right-6">
                  <button className="w-full py-4 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-2xl font-bold shadow-xl flex items-center justify-center gap-2">
                    <Navigation className="w-5 h-5" />
                    Start Navigation
                  </button>
                </div>
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <SectionTitle 
                title="Find Us Easily" 
                subtitle="Located at the heart of the city for your convenience. Open 24/7 for all your fuel needs."
              />
              
              <div className="space-y-8">
                <div className="flex gap-6">
                  <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center shrink-0">
                    <MapPin className="text-amber-500 w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold mb-2">Main Branch Address</h4>
                    <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                      123 Luxury Avenue, Premium District,<br />
                      Silicon Valley, CA 94025
                    </p>
                    <p className="text-sm text-amber-500 font-bold mt-2">Landmark: Opposite Grand Plaza</p>
                  </div>
                </div>

                <div className="flex gap-6">
                  <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center shrink-0">
                    <Clock className="text-indigo-500 w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold mb-2">Operating Hours</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-slate-400 uppercase font-bold">Mon - Fri</p>
                        <p className="font-bold">Open 24 Hours</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 uppercase font-bold">Sat - Sun</p>
                        <p className="font-bold">Open 24 Hours</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-8 border-t border-slate-100 dark:border-slate-800 grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold">15+</p>
                    <p className="text-xs text-slate-500 uppercase">Branches</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">24/7</p>
                    <p className="text-xs text-slate-500 uppercase">Support</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">50k+</p>
                    <p className="text-xs text-slate-500 uppercase">Monthly Users</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- Admin Panel (Conditional) --- */}
      <AnimatePresence>
        {isAdminMode && (
          <motion.section 
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed inset-0 z-[60] bg-slate-950/95 backdrop-blur-xl overflow-y-auto p-4 md:p-8"
          >
            <div className="max-w-7xl mx-auto">
              <div className="flex justify-between items-center mb-12">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center">
                    <LayoutDashboard className="text-white w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="text-3xl font-bold text-white">Admin Dashboard</h2>
                      <span className="flex items-center gap-1.5 px-2 py-0.5 bg-green-500/20 text-green-400 text-[10px] font-bold uppercase rounded-full border border-green-500/30">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                        Live
                      </span>
                    </div>
                    <p className="text-slate-400">Manage your station operations in real-time</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => {
                      // Trigger the fetchStock and fetchRequests if they were exposed, 
                      // but since they are in useEffect, we can just toggle a dummy state or call them if we refactor.
                      // For now, let's just show a toast or simple feedback.
                      window.location.reload();
                    }}
                    className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white transition-all flex items-center gap-2 text-sm font-bold"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Refresh
                  </button>
                  <button 
                    onClick={() => setIsAdminMode(false)}
                    className="px-6 py-3 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-xl font-bold transition-all flex items-center gap-2 border border-red-500/20"
                  >
                    <LogOut className="w-4 h-4" />
                    Exit Dashboard
                  </button>
                </div>
              </div>

              <div className="grid lg:grid-cols-4 gap-8">
                {/* Quick Stats */}
                <Card className="p-6 bg-white/5 border-white/10 text-white hover:bg-white/10 transition-all group">
                  <div className="flex justify-between items-start mb-4">
                    <p className="text-xs text-slate-400 uppercase font-bold">Total Revenue (Today)</p>
                    <div className="p-2 bg-green-500/10 rounded-lg group-hover:bg-green-500/20 transition-colors">
                      <TrendingUp className="w-4 h-4 text-green-500" />
                    </div>
                  </div>
                  <p className="text-3xl font-bold">₹4,25,800</p>
                  <div className="flex items-center gap-1 text-green-500 text-xs mt-2">
                    <TrendingUp className="w-3 h-3" /> +12.5% from yesterday
                  </div>
                </Card>
                <Card className="p-6 bg-white/5 border-white/10 text-white hover:bg-white/10 transition-all group">
                  <div className="flex justify-between items-start mb-4">
                    <p className="text-xs text-slate-400 uppercase font-bold">Active Requests</p>
                    <div className="p-2 bg-amber-500/10 rounded-lg group-hover:bg-amber-500/20 transition-colors">
                      <Navigation className="w-4 h-4 text-amber-500" />
                    </div>
                  </div>
                  <p className="text-3xl font-bold">{emergencyRequests.length}</p>
                  <p className="text-xs text-amber-500 mt-2">
                    {emergencyRequests.filter(r => r.status === 'Pending').length} Pending deliveries
                  </p>
                </Card>
                <Card className="p-6 bg-white/5 border-white/10 text-white hover:bg-white/10 transition-all group">
                  <div className="flex justify-between items-start mb-4">
                    <p className="text-xs text-slate-400 uppercase font-bold">Fuel Stock Avg</p>
                    <div className="p-2 bg-indigo-500/10 rounded-lg group-hover:bg-indigo-500/20 transition-colors">
                      <Droplets className="w-4 h-4 text-indigo-500" />
                    </div>
                  </div>
                  <p className="text-3xl font-bold">68%</p>
                  <p className="text-xs text-slate-500 mt-2">Next refill in 2 days</p>
                </Card>
                <Card className="p-6 bg-white/5 border-white/10 text-white hover:bg-white/10 transition-all group">
                  <div className="flex justify-between items-start mb-4">
                    <p className="text-xs text-slate-400 uppercase font-bold">Customer Rating</p>
                    <div className="p-2 bg-amber-500/10 rounded-lg group-hover:bg-amber-500/20 transition-colors">
                      <Star className="w-4 h-4 text-amber-500" />
                    </div>
                  </div>
                  <p className="text-3xl font-bold">4.92</p>
                  <p className="text-xs text-indigo-400 mt-2">Based on 1,240 reviews</p>
                </Card>

                {/* Stock Management */}
                <Card className="lg:col-span-2 p-8 bg-white/5 border-white/10 text-white">
                  <h3 className="text-xl font-bold mb-8">Inventory Management</h3>
                  <div className="space-y-8">
                    {stock.map((s, idx) => (
                      <div key={s.type} className="space-y-4">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <span className="font-bold">{s.type} Stock</span>
                            {(s.available / s.capacity) < 0.3 && (
                              <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-[8px] font-bold uppercase rounded border border-red-500/30 animate-pulse">
                                Low Stock
                              </span>
                            )}
                          </div>
                          <span className="text-slate-400 text-sm">{s.available} / {s.capacity} L</span>
                        </div>
                        <input 
                          type="range" 
                          min="0" 
                          max={s.capacity} 
                          value={s.available}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setStock(prev => prev.map((item, i) => i === idx ? { ...item, available: val } : item));
                          }}
                          onMouseUp={(e) => {
                            updateStockBackend(s.type, Number((e.target as HTMLInputElement).value));
                          }}
                          onTouchEnd={(e) => {
                            updateStockBackend(s.type, Number((e.target as HTMLInputElement).value));
                          }}
                          className="w-full accent-amber-500"
                        />
                        <div className="flex gap-4">
                          <div className="flex-1">
                            <label className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Price (₹/L)</label>
                            <input 
                              type="number" 
                              value={s.price}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                setStock(prev => prev.map((item, i) => i === idx ? { ...item, price: val } : item));
                              }}
                              onBlur={(e) => {
                                updateStockBackend(s.type, undefined, Number(e.target.value));
                              }}
                              className="w-full bg-white/5 border-white/10 rounded-lg px-3 py-2 text-sm"
                            />
                          </div>
                          <div className="flex-1">
                            <label className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Manual Refill</label>
                            <button 
                              onClick={() => updateStockBackend(s.type, s.capacity)}
                              className="w-full bg-amber-500 text-white py-2 rounded-lg text-sm font-bold"
                            >
                              Refill Full
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Recent Emergency Requests */}
                <Card className="lg:col-span-2 p-8 bg-white/5 border-white/10 text-white">
                  <h3 className="text-xl font-bold mb-8">Emergency Requests</h3>
                  <div className="space-y-4">
                    {emergencyRequests.length === 0 ? (
                      <p className="text-slate-500 text-center py-8">No active emergency requests</p>
                    ) : (
                      emergencyRequests.map((req, i) => (
                        <motion.div 
                          key={req.id || i} 
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-all group"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center font-bold relative">
                              {req.name ? req.name[0] : '?'}
                              {req.status === 'Pending' && (
                                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-slate-900" />
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-bold">{req.name || 'Unknown'}</p>
                                {req.status === 'Pending' && (
                                  <span className="text-[8px] font-bold uppercase text-red-400 bg-red-400/10 px-1.5 py-0.5 rounded">New</span>
                                )}
                              </div>
                              <p className="text-xs text-slate-500">
                                {new Date(req.timestamp).toLocaleTimeString()} • {req.fuelType} ({req.quantity}L)
                              </p>
                              <p className="text-[10px] text-slate-400 mt-1">{req.location}</p>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <div className="flex gap-2">
                              <button 
                                onClick={() => handleNavigate(req)}
                                className="p-2 bg-amber-500/20 text-amber-400 rounded-lg hover:bg-amber-500/40 transition-colors"
                                title="Navigate to Customer"
                              >
                                <Navigation className="w-4 h-4" />
                              </button>
                              <select 
                                value={req.status}
                                onChange={(e) => updateRequestStatus(req.id, e.target.value)}
                                className="bg-slate-800 border-none text-[10px] font-bold uppercase rounded px-2 py-1"
                              >
                                <option value="Pending">Pending</option>
                                <option value="Dispatched">Dispatched</option>
                                <option value="Completed">Completed</option>
                              </select>
                            </div>
                            <span className={cn(
                              "px-3 py-1 rounded-full text-[10px] font-bold uppercase",
                              req.status === 'Pending' ? "bg-red-500/20 text-red-400" :
                              req.status === 'Dispatched' ? "bg-amber-500/20 text-amber-400" :
                              "bg-green-500/20 text-green-400"
                            )}>
                              {req.status}
                            </span>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>
                </Card>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* --- Footer --- */}
      <footer className="bg-slate-900 text-white pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center">
                  <Fuel className="text-white w-6 h-6" />
                </div>
                <span className="text-2xl font-bold tracking-tight">Fuel<span className="text-amber-500">Lux</span></span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                Setting the gold standard in fuel management and automotive services. Quality you can trust, technology you can rely on.
              </p>
              <div className="flex gap-4">
                {['facebook', 'twitter', 'instagram', 'linkedin'].map(social => (
                  <a key={social} href="#" className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-amber-500 transition-colors">
                    <div className="w-5 h-5 capitalize">{social[0]}</div>
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-lg font-bold mb-8">Quick Links</h4>
              <ul className="space-y-4 text-slate-400">
                {['Home', 'Live Stock', 'Fuel Calculator', 'Emergency Help', 'Our Services', 'Admin Login'].map(link => (
                  <li key={link}><a href="#" className="hover:text-amber-500 transition-colors">{link}</a></li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-bold mb-8">Contact Us</h4>
              <ul className="space-y-6 text-slate-400">
                <li className="flex gap-4">
                  <MapPin className="w-5 h-5 text-amber-500 shrink-0" />
                  <span>123 Luxury Avenue, Premium District, Silicon Valley, CA 94025</span>
                </li>
                <li className="flex gap-4">
                  <Phone className="w-5 h-5 text-amber-500 shrink-0" />
                  <span>+91 72044 51674</span>
                </li>
                <li className="flex gap-4">
                  <ShieldCheck className="w-5 h-5 text-amber-500 shrink-0" />
                  <span>support@fuellux.com</span>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-bold mb-8">Newsletter</h4>
              <p className="text-slate-400 mb-6 text-sm">Subscribe for daily fuel price updates and exclusive offers.</p>
              <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
                <input 
                  type="email" 
                  className="w-full px-4 py-3 bg-white/5 rounded-xl border border-white/10 focus:ring-2 focus:ring-amber-500 outline-none" 
                  placeholder="Your email address" 
                />
                <button className="w-full py-3 bg-amber-500 text-white rounded-xl font-bold hover:bg-amber-600 transition-colors">
                  Subscribe
                </button>
              </form>
            </div>
          </div>

          <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-slate-500 text-sm">
            <p>© 2026 FuelLux Management System. All rights reserved.</p>
            <div className="flex gap-8">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>

      {/* --- Navigation Modal --- */}
      <AnimatePresence>
        {showNavModal && selectedRequestForNav && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowNavModal(false)}
              className="absolute inset-0 bg-slate-900/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-white/10"
            >
              <div className="p-6 border-b border-white/10 flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold text-white">Route to {selectedRequestForNav.name}</h3>
                  <p className="text-xs text-slate-400">Shortest route calculated via OSRM</p>
                </div>
                <button 
                  onClick={() => setShowNavModal(false)}
                  className="p-2 rounded-full hover:bg-white/10 transition-colors text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="h-[500px] w-full relative">
                {!adminLocation && (
                  <div className="absolute inset-0 z-20 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center text-center p-8">
                    <div className="max-w-xs">
                      <Navigation className="w-12 h-12 text-amber-500 mx-auto mb-4 animate-pulse" />
                      <p className="text-white font-bold mb-2">Detecting your location...</p>
                      <p className="text-xs text-slate-400">Please allow location access to calculate the route from your position.</p>
                      <button 
                        onClick={() => {
                          if (navigator.geolocation) {
                            navigator.geolocation.getCurrentPosition(
                              (pos) => setAdminLocation([pos.coords.latitude, pos.coords.longitude]),
                              (err) => alert("Could not detect location. Please check browser permissions.")
                            );
                          }
                        }}
                        className="mt-6 px-6 py-2 bg-amber-500 text-white rounded-full text-sm font-bold"
                      >
                        Try Again
                      </button>
                    </div>
                  </div>
                )}
                
                <MapContainer 
                  center={adminLocation || selectedRequestForNav.coords} 
                  zoom={13} 
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  {adminLocation && selectedRequestForNav.coords && (
                    <RoutingMachine start={adminLocation} end={selectedRequestForNav.coords} />
                  )}
                </MapContainer>
              </div>

              <div className="p-6 bg-slate-800 flex justify-between items-center">
                <div className="flex gap-6">
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase font-bold">Destination</p>
                    <p className="text-sm text-white font-bold">{selectedRequestForNav.location}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase font-bold">Fuel Type</p>
                    <p className="text-sm text-white font-bold">{selectedRequestForNav.fuelType} ({selectedRequestForNav.quantity}L)</p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    const url = `https://www.google.com/maps/dir/?api=1&destination=${selectedRequestForNav.coords[0]},${selectedRequestForNav.coords[1]}`;
                    window.open(url, '_blank');
                  }}
                  className="px-6 py-3 bg-white text-slate-900 rounded-xl font-bold flex items-center gap-2 hover:bg-amber-500 hover:text-white transition-all"
                >
                  <Navigation className="w-4 h-4" />
                  Open in Google Maps
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- Login Modal --- */}
      <AnimatePresence>
        {showLoginModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLoginModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-800 rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-8">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-2xl font-bold dark:text-white">Admin Login</h3>
                  <button 
                    onClick={() => setShowLoginModal(false)}
                    className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors dark:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <input
                    type="password"
                    placeholder="Enter Admin Password (admin123)"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleLogin(e);
                    }}
                  />
                  <button 
                    onClick={handleLogin}
                    className="w-full py-4 bg-amber-500 text-white rounded-xl font-bold shadow-sm flex items-center justify-center gap-3 hover:bg-amber-600 transition-all"
                  >
                    <ShieldCheck className="w-5 h-5" />
                    Secure Admin Login
                  </button>

                  {loginError && (
                    <p className="text-sm text-red-500 font-medium text-center mt-4">{loginError}</p>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
