import Banner from "./Baanner";
import IntruductionSection from "./IntruductionSection";
import ProductionSection from "./ProductionSection";
import NewsSection from "./NewsSection";

export default function MainPage() {
  return (
    <div>
      <Banner />
      <IntruductionSection />
      <ProductionSection />
      <NewsSection />
    </div>
  );
}
