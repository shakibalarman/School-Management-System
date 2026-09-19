import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  GraduationCap,
  Menu,
  X,
  ChevronRight,
  Phone,
  Mail,
  MapPin,
  Eye,
  EyeOff,
  ArrowRight,
  Star,
  Trophy,
  Heart,
} from "lucide-react";

/* ── Schemas ── */
const loginSchema = z.object({
  email: z.string().min(1, "Email is required"),
  password: z.string().min(1, "Password is required"),
});
type LoginForm = z.infer<typeof loginSchema>;

const admissionSchema = z.object({
  studentName: z.string().min(2, "Student name is required"),
  parentName: z.string().min(2, "Parent name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().min(10, "Phone number is required"),
  classApplying: z.string().min(1, "Please select a class"),
  message: z.string().optional(),
});
type AdmissionForm = z.infer<typeof admissionSchema>;

const STATS = [
  { value: "500+", label: "Students" },
  { value: "50+", label: "Teachers" },
  { value: "30+", label: "Classes" },
  { value: "15+", label: "Years Excellence" },
];

/* ── Club data ── */
const CLUBS = [
  {
    title: "Innovation & Entrepreneurship",
    desc: "Turn ideas into real solutions",
    image: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=600&h=400&fit=crop",
  },
  {
    title: "Robotics & Automation",
    desc: "Build and program smart robots",
    image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600&h=400&fit=crop",
  },
  {
    title: "Science & Research",
    desc: "Explore, experiment, and discover",
    image: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=600&h=400&fit=crop",
  },
  {
    title: "Coding & Technology",
    desc: "Learn programming and digital skills",
    image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&h=400&fit=crop",
  },
  {
    title: "AI & Future Technology",
    desc: "Explore AI and emerging technologies",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&h=400&fit=crop",
  },
  {
    title: "STEM Education",
    desc: "Learn through practical projects",
    image: "https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=600&h=400&fit=crop",
  },
  {
    title: "Creative Arts & Design",
    desc: "Create, design, and express",
    image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&h=400&fit=crop",
  },
  {
    title: "Debate & Public Speaking",
    desc: "Speak confidently and lead",
    image: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=600&h=400&fit=crop",
  },
  {
    title: "Sports & Fitness",
    desc: "Play, compete, and stay healthy",
    image: "https://images.unsplash.com/photo-1461896836934-bd45ba7ea6f0?w=600&h=400&fit=crop",
  },
  {
    title: "Environment & Sustainability",
    desc: "Build a greener future",
    image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&h=400&fit=crop",
  },
];

const TESTIMONIALS = [
  { name: "Mrs. Priya Sharma", role: "Parent", text: "Greenwood International School has made tracking my child's progress so much easier. The attendance notifications are a great feature!" },
  { name: "Mr. Rajesh Kumar", role: "Teacher", text: "Managing classes and homework assignments has become so streamlined. I highly recommend this system to all schools." },
  { name: "Anita Desai", role: "Student", text: "I love how I can check my schedule, homework, and exam results all in one place. It's very user-friendly!" },
];

export function LandingPage() {
  const [showAbout, setShowAbout] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showAdmission, setShowAdmission] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [admissionSuccess, setAdmissionSuccess] = useState(false);
  const nav = useNavigate();

  /* ── Login form ── */
  const { register: regLogin, handleSubmit: submitLogin, formState: loginState } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  async function onLoginSubmit(_values: LoginForm) {
    nav("/login", { replace: true });
  }

  /* ── Admission form ── */
  const { register: regAdmission, handleSubmit: submitAdmission, formState: admissionState, reset: resetAdmission } = useForm<AdmissionForm>({
    resolver: zodResolver(admissionSchema),
  });

  function onAdmissionSubmit(_values: AdmissionForm) {
    setAdmissionSuccess(true);
    resetAdmission();
    setTimeout(() => setAdmissionSuccess(false), 5000);
  }

  return (
    <div className="min-h-screen bg-white">
      {/* ════════════════ NAVBAR ════════════════ */}
      <nav className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-md z-50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <img src="/logo.svg" alt="Logo" className="w-10 h-10" />
              <span className="font-bold text-lg text-slate-800 hidden sm:block">Greenwood International School</span>
              <span className="font-bold text-lg text-slate-800 sm:hidden">GIS</span>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-2">
              <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition-all hover:scale-105 active:scale-95">
                Home
              </button>
              <button onClick={() => setShowAbout(true)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition-all hover:scale-105 active:scale-95">
                About Us
              </button>
              <button onClick={() => setShowAdmission(true)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition-all hover:scale-105 active:scale-95">
                Admission
              </button>
              <button onClick={() => setShowLogin(true)} className="ml-2 px-5 py-2 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg hover:scale-105 active:scale-95">
                Login
              </button>
            </div>

            {/* Mobile menu button */}
            <button onClick={() => setMobileMenu(!mobileMenu)} className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg">
              {mobileMenu ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileMenu && (
          <div className="md:hidden border-t border-slate-100 bg-white px-4 py-3 space-y-1">
            <button onClick={() => { window.scrollTo({ top: 0, behavior: "smooth" }); setMobileMenu(false); }} className="block w-full text-left px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-indigo-50 rounded-lg">
              Home
            </button>
            <button onClick={() => { setShowAbout(true); setMobileMenu(false); }} className="block w-full text-left px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-indigo-50 rounded-lg">
              About Us
            </button>
            <button onClick={() => { setShowAdmission(true); setMobileMenu(false); }} className="block w-full text-left px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-indigo-50 rounded-lg">
              Admission
            </button>
            <button onClick={() => { setShowLogin(true); setMobileMenu(false); }} className="block w-full text-left px-4 py-2.5 text-sm font-semibold text-indigo-600 hover:bg-indigo-50 rounded-lg">
              Login
            </button>
          </div>
        )}
      </nav>

      {/* ════════════════ HERO SECTION ════════════════ */}
      <section className="pt-24 pb-16 lg:pt-32 lg:pb-24 bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium mb-6">
                <Star size={16} />
                Trusted by 500+ Families
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-tight mb-6">
                Empowering{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                  Future Leaders
                </span>{" "}
                Through Technology
              </h1>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                A comprehensive school management system that connects administrators, teachers, students, and parents on one powerful platform.
              </p>
              <div className="flex flex-wrap gap-4">
                <button onClick={() => setShowAdmission(true)} className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl flex items-center gap-2 hover:scale-105 active:scale-95">
                  Get Started <ArrowRight size={18} />
                </button>
                <button onClick={() => setShowAbout(true)} className="px-6 py-3 border-2 border-slate-200 text-slate-700 font-semibold rounded-xl hover:border-indigo-300 hover:bg-indigo-50 transition-all hover:scale-105 active:scale-95">
                  Learn More
                </button>
              </div>
            </div>
            <div className="hidden lg:flex justify-center">
              <div className="relative">
                <div className="w-80 h-80 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl rotate-6 opacity-20 absolute -inset-4"></div>
                <div className="w-80 h-80 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl flex items-center justify-center relative">
                  <img src="/logo.svg" alt="School Logo" className="w-48 h-48" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════ STATS ════════════════ */}
      <section className="py-12 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                  {s.value}
                </div>
                <div className="text-sm text-slate-500 mt-1 font-medium">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ FEATURES (Clubs & Activities) ════════════════ */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium mb-4">
              <Trophy size={16} />
              Beyond Academics
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4">Our Features</h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">Discover your passion and develop new skills through our diverse range of clubs and activities.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-5">
            {CLUBS.map((club) => (
              <div key={club.title} className="group relative rounded-2xl overflow-hidden cursor-pointer aspect-[4/5] bg-slate-200 hover:scale-105 hover:shadow-2xl transition-all duration-300">
                <img
                  src={club.image}
                  alt={club.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                <div className="absolute inset-0 flex flex-col justify-end p-5 text-white">
                  <h3 className="font-bold text-lg leading-tight mb-1">{club.title}</h3>
                  <p className="text-sm text-white/80">{club.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ TESTIMONIALS ════════════════ */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4">What People Say</h2>
            <p className="text-lg text-slate-500">Hear from our community of parents, teachers, and students.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="bg-slate-50 rounded-2xl p-8 border border-slate-100">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={18} className="fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-slate-600 mb-6 leading-relaxed">"{t.text}"</p>
                <div>
                  <div className="font-semibold text-slate-800">{t.name}</div>
                  <div className="text-sm text-slate-500">{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ CTA ════════════════ */}
      <section className="py-20 bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-6">Ready to Transform Your School?</h2>
          <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">Join hundreds of schools already using Greenwood International School to streamline their operations.</p>
          <button onClick={() => setShowAdmission(true)} className="px-8 py-4 bg-white text-indigo-600 font-bold rounded-xl hover:bg-slate-50 transition-all shadow-lg text-lg hover:scale-105 active:scale-95">
            Start Admission Now
          </button>
        </div>
      </section>

      {/* ════════════════ FOOTER ════════════════ */}
      <footer className="bg-slate-900 text-slate-400 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <img src="/logo.svg" alt="Logo" className="w-10 h-10" />
                <span className="font-bold text-white text-lg">Greenwood International School</span>
              </div>
              <p className="text-sm leading-relaxed">Empowering education through technology. A complete solution for modern schools.</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="hover:text-white transition-colors">Home</button></li>
                <li><button onClick={() => setShowAbout(true)} className="hover:text-white transition-colors">About Us</button></li>
                <li><button onClick={() => setShowAdmission(true)} className="hover:text-white transition-colors">Admission</button></li>
                <li><button onClick={() => setShowLogin(true)} className="hover:text-white transition-colors">Login</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Programs</h4>
              <ul className="space-y-2 text-sm">
                <li>Primary School (I-V)</li>
                <li>Middle School (VI-VIII)</li>
                <li>High School (IX-X)</li>
                <li>Higher Secondary (XI-XII)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Contact Us</h4>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center gap-2"><MapPin size={16} /> 123 Education Lane, City</li>
                <li className="flex items-center gap-2"><Phone size={16} /> +91 98765 43210</li>
                <li className="flex items-center gap-2"><Mail size={16} /> info@schoolms.edu</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-12 pt-8 text-center text-sm">
            <p>© 2026 Greenwood International School. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* ════════════════ ABOUT MODAL ════════════════ */}
      {showAbout && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={() => setShowAbout(false)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowAbout(false)} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
              <X size={20} />
            </button>
            <div className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <img src="/logo.svg" alt="Logo" className="w-12 h-12" />
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">About Us</h2>
                  <p className="text-sm text-slate-500">Greenwood International School</p>
                </div>
              </div>

              <div className="space-y-5 text-slate-600 leading-relaxed">
                <p>
                  <strong className="text-slate-800">Greenwood International School</strong> is a state-of-the-art platform designed to revolutionize how schools manage their daily operations. We believe that technology can transform education and make learning more accessible.
                </p>
                <div className="bg-indigo-50 rounded-xl p-5">
                  <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                    <Heart size={18} className="text-red-500" /> Our Mission
                  </h3>
                  <p>To empower schools with digital tools that simplify administration, enhance teaching quality, and improve student outcomes.</p>
                </div>
                <div className="bg-purple-50 rounded-xl p-5">
                  <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                    <Trophy size={18} className="text-yellow-500" /> Our Vision
                  </h3>
                  <p>To become the leading school management platform trusted by educational institutions worldwide for excellence in administration and learning management.</p>
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 mb-3">Why Choose Us?</h3>
                  <ul className="space-y-2">
                    {["Trusted by 500+ families", "Easy-to-use interface", "24/7 customer support", "Regular updates and improvements", "Secure data management"].map((item) => (
                      <li key={item} className="flex items-center gap-2">
                        <ChevronRight size={16} className="text-indigo-500 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════ LOGIN MODAL ════════════════ */}
      {showLogin && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={() => setShowLogin(false)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowLogin(false)} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors z-10">
              <X size={20} />
            </button>
            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-t-2xl p-8 text-center">
              <img src="/logo.svg" alt="Logo" className="w-16 h-16 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white">Welcome Back</h2>
              <p className="text-white/80 text-sm mt-1">Sign in to your dashboard</p>
            </div>
            <form onSubmit={submitLogin(onLoginSubmit)} className="p-8 space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                <input
                  {...regLogin("email")}
                  type="email"
                  placeholder="admin@school.com"
                  className="w-full px-4 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                {loginState.errors.email && <p className="text-red-500 text-xs mt-1">{loginState.errors.email.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
                <div className="relative">
                  <input
                    {...regLogin("password")}
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className="w-full px-4 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent pr-10"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {loginState.errors.password && <p className="text-red-500 text-xs mt-1">{loginState.errors.password.message}</p>}
              </div>
              {loginError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-600">{loginError}</p>
                </div>
              )}
              <button type="submit" className="w-full py-2.5 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-medium rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md hover:scale-105 active:scale-95">
                Sign In
              </button>
              <p className="text-xs text-slate-500 text-center">
                Demo: <span className="font-medium text-slate-700">admin@school.com</span> / <span className="font-medium text-slate-700">Admin123!</span>
              </p>
            </form>
          </div>
        </div>
      )}

      {/* ════════════════ ADMISSION MODAL ════════════════ */}
      {showAdmission && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={() => setShowAdmission(false)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowAdmission(false)} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors z-10">
              <X size={20} />
            </button>
            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-t-2xl p-8 text-center">
              <GraduationCap size={40} className="text-white mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white">Admission Enquiry</h2>
              <p className="text-white/80 text-sm mt-1">Fill the form and we'll get back to you</p>
            </div>

            {admissionSuccess ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <GraduationCap size={32} className="text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Application Received!</h3>
                <p className="text-slate-500">Thank you for your interest. Our admissions team will contact you within 2-3 business days.</p>
                <button onClick={() => setShowAdmission(false)} className="mt-6 px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors hover:scale-105 active:scale-95">
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={submitAdmission(onAdmissionSubmit)} className="p-8 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Student Name *</label>
                  <input {...regAdmission("studentName")} placeholder="Enter student's full name" className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                  {admissionState.errors.studentName && <p className="text-red-500 text-xs mt-1">{admissionState.errors.studentName.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Parent/Guardian Name *</label>
                  <input {...regAdmission("parentName")} placeholder="Enter parent's name" className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                  {admissionState.errors.parentName && <p className="text-red-500 text-xs mt-1">{admissionState.errors.parentName.message}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Email *</label>
                    <input {...regAdmission("email")} type="email" placeholder="email@example.com" className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                    {admissionState.errors.email && <p className="text-red-500 text-xs mt-1">{admissionState.errors.email.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone *</label>
                    <input {...regAdmission("phone")} placeholder="+91 98765 43210" className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                    {admissionState.errors.phone && <p className="text-red-500 text-xs mt-1">{admissionState.errors.phone.message}</p>}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Class Applying For *</label>
                  <select {...regAdmission("classApplying")} className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white">
                    <option value="">Select Class</option>
                    <option value="1">Class I</option>
                    <option value="2">Class II</option>
                    <option value="3">Class III</option>
                    <option value="4">Class IV</option>
                    <option value="5">Class V</option>
                    <option value="6">Class VI</option>
                    <option value="7">Class VII</option>
                    <option value="8">Class VIII</option>
                    <option value="9">Class IX</option>
                    <option value="10">Class X</option>
                    <option value="11">Class XI</option>
                    <option value="12">Class XII</option>
                  </select>
                  {admissionState.errors.classApplying && <p className="text-red-500 text-xs mt-1">{admissionState.errors.classApplying.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Additional Message</label>
                  <textarea {...regAdmission("message")} rows={3} placeholder="Any specific requirements or questions..." className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none" />
                </div>
                <button type="submit" className="w-full py-2.5 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-medium rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md hover:scale-105 active:scale-95">
                  Submit Application
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
