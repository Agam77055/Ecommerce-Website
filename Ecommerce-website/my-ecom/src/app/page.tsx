import Header from '@/components/Layout/Header'
import FirstSegment from '@/components/Layout/FirstSegment';
import Footer from '@/components/Layout/Footer';
import TrendingSegment from '@/components/Layout/TrendingSegment';

export default function Home() {
  return (
    <>
      <Header />
      <FirstSegment />
      <TrendingSegment tag="all" />
      <TrendingSegment tag="laptops" />
      <TrendingSegment tag="watches" />
      <TrendingSegment tag="beauty"/>
      <Footer />
    </>
  );
}
