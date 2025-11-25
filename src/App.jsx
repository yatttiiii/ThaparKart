// src/App.jsx
import React, { Suspense, lazy, useState, useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";

const lazyNamed = (path, exportName) =>
  lazy(() =>
    import(/* @vite-ignore */ path).then((mod) => ({
      default: mod[exportName],
    }))
  );

// --- Lazy imports (map named exports -> default) ---
const About = lazyNamed("./pages/about.jsx", "About");
const AboutWithLogin = lazyNamed("./pages/aboutwithlogin.jsx", "AboutWithLogin");
const AdminPage = lazyNamed("./pages/admin page.jsx", "AdminPage");
const AllListing = lazyNamed("./pages/all_listing.jsx", "AllListing");
const AllListingLogin = lazyNamed("./pages/all_listings_login.jsx", "AllListingLogin");
const Article = lazyNamed("./pages/article.jsx", "Article");
const ArticleWithLogin = lazyNamed("./pages/article with login.jsx", "ArticleWithLogin");
const Chat = lazyNamed("./pages/chat.jsx", "Chat");
const CreateListing = lazyNamed("./pages/create_listing.jsx", "CreateListing");
const CreateListingWithLogin = lazyNamed(
  "./pages/create a listing with login.jsx",
  "CreateListingWithLogin"
);
const EditListings = lazyNamed("./pages/edit_listings.jsx", "EditListings");
const LandingPage = lazyNamed("./pages/Landing Page.jsx", "LandingPage");

const LandingPageWithLogin = lazyNamed(
  "./pages/LandingPagewithLogin.jsx",
  "LandingPageWithLogin"
);

const Login = lazyNamed("./pages/login.jsx", "Login");
const MyAccountListings = lazyNamed("./pages/my account listings.jsx", "MyAccountListings");
const MyAccountOrders = lazyNamed("./pages/my account orders.jsx", "MyAccountOrders");
const MyAccountSecurity = lazyNamed("./pages/my account security.jsx", "MyAccountSecurity");
const MyListing = lazyNamed("./pages/my_listing.jsx", "MyListing");
const ProductDetail = lazyNamed("./pages/product_detail.jsx", "ProductDetail");
const ProductDetailWithLogin = lazyNamed(
  "./pages/productdetailpagewithlogin.jsx",
  "ProductDetailWithLogin"
);
const Register = lazyNamed("./pages/register.jsx", "Register");
const Reservation = lazyNamed("./pages/reservation.jsx", "Reservation");
const Shop = lazyNamed("./pages/shop.jsx", "Shop");
const ShopLogin = lazyNamed("./pages/shop_login.jsx", "ShopLogin");

// Fallback loader while lazy components load
function Loader() {
  return (
    <div className="w-full h-screen flex items-center justify-center text-xl">
      Loading...
    </div>
  );
}

// ✅ Only these emails can access /admin
const ADMIN_EMAILS = [
  "ksingh2_be23@thapar.edu",
  "ybhansali_be23@thapar.edu",
];

// ✅ Wrapper that checks login + email before rendering AdminPage
function ProtectedAdminPage() {
  const [checking, setChecking] = useState(true);
  const [allowed, setAllowed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const verifyAdmin = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/profile", {
          credentials: "include",
        });

        if (res.status === 401) {
          // not logged in → go to login
          alert("Please log in to access the admin panel.");
          navigate("/login");
          return;
        }

        if (!res.ok) {
          throw new Error("Failed to fetch profile");
        }

        const data = await res.json();
        const email = data.email || "";

        if (ADMIN_EMAILS.includes(email)) {
          setAllowed(true);
        } else {
          alert("You are not authorised to view the admin page.");
          navigate("/landing-login");
        }
      } catch (err) {
        console.error("Error checking admin access:", err);
        alert("Could not verify access. Please try again later.");
        navigate("/landing-login");
      } finally {
        setChecking(false);
      }
    };

    verifyAdmin();
  }, [navigate]);

  if (checking) return <Loader />;

  if (!allowed) return null; // we already navigated away

  return <AdminPage />;
}

export default function App() {
  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        {/* Landing */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/landing-login" element={<LandingPageWithLogin />} />

        {/* About */}
        <Route path="/about" element={<About />} />
        <Route path="/about-login" element={<AboutWithLogin />} />

        {/* Admin – now protected */}
        <Route path="/admin" element={<ProtectedAdminPage />} />

        {/* Listings / Shop */}
        <Route path="/listings" element={<AllListing />} />
        <Route path="/listings-login" element={<AllListingLogin />} />
        <Route path="/create-listing" element={<CreateListing />} />
        <Route path="/create-listing-login" element={<CreateListingWithLogin />} />
        <Route path="/edit-listings/:id" element={<EditListings />} />

        <Route path="/shop" element={<Shop />} />
        <Route path="/shop-login" element={<ShopLogin />} />

        {/* Product detail */}
        <Route path="/product" element={<ProductDetail />} />
        <Route path="/product-login" element={<ProductDetailWithLogin />} />

        {/* Account */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/my-account/listings" element={<MyAccountListings />} />
        <Route path="/my-account/orders" element={<MyAccountOrders />} />
        <Route path="/my-account/security" element={<MyAccountSecurity />} />
        <Route path="/my-listing" element={<MyListing />} />

        {/* Misc */}
        <Route path="/article" element={<Article />} />
        <Route path="/article-login" element={<ArticleWithLogin />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/reservation" element={<Reservation />} />

        {/* 404 */}
        <Route
          path="*"
          element={<div className="p-10 text-center">404 Page Not Found</div>}
        />
      </Routes>
    </Suspense>
  );
}
