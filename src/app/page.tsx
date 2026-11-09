
import HeroSection from "@/components/home/HeroSection";
import CategorySection from "@/components/home/CategorySection";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import WhyChooseUs from "@/components/home/WhyChooseUs";
import PromoBanner from "@/components/home/PromoBanner";
import InstagramSection from "@/components/home/InstagramSection";
import ShippingReturnsFAQ from "@/components/home/ShippingReturnsFAQ";
import FashionFilmsSection from "@/components/home/FashionFilmsSection";

export default function HomePage() {
  return (
    <div className="flex flex-col">
      <HeroSection />
      <CategorySection />
      <FeaturedProducts />
      <WhyChooseUs />
      <PromoBanner />
      <InstagramSection />
      <FashionFilmsSection />
      <ShippingReturnsFAQ />
    </div>
  );
}
