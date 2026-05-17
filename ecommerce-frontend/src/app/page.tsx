import ProductCatalog from '@/components/ProductCatalog';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Hero Section */}
      <div className="relative bg-indigo-900 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1600&q=80"
            alt="Hero background"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-900 to-transparent mix-blend-multiply"></div>
        </div>
        <div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8 flex flex-col items-start">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl text-left">
            Next-Gen Tech.<br/> Delivered Tomorrow.
          </h1>
          <p className="mt-6 text-xl text-indigo-100 max-w-3xl text-left">
            Discover the latest in premium electronics, gaming gear, and smart home devices. Curated for enthusiasts.
          </p>
          <div className="mt-10">
            <a href="#catalog" className="inline-block bg-white text-indigo-600 px-8 py-3 rounded-full font-semibold hover:bg-indigo-50 transition-colors shadow-lg">
              Shop Now
            </a>
          </div>
        </div>
      </div>

      <div id="catalog">
        <ProductCatalog />
      </div>
    </main>
  );
}
