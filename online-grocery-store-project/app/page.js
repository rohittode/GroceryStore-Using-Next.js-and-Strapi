import { Button } from "@/components/ui/button";
import Image from "next/image";
import Slider from "./_components/Slider";
import CategoryList from "./_components/CategoryList";
import ProductList from "./_components/ProductList";
import GlobalApi from "./_utils/GlobalApi";
import Footer from "./_components/Footer";

export default async function Home() {

  const sliderList=await GlobalApi.getSliders();

  const categoryList=await GlobalApi.getCategoryList();

  const productList=await GlobalApi.getAllProducts();

  return (
    <div className="p-5 md:p-10 px-16">
      {/* Sliders */}
      <Slider sliderList={sliderList}/>
      {/* Category List */}
      <CategoryList categoryList={categoryList}/>
       {/* Product List */}
       <ProductList productList={productList}/>
      {/* Banner */}
      <Image src='/banner.png' width={1000} height={300} alt="banner" 
      className="w-full h-[400] object-contain"/>
      {/* Footer */}
      <Footer/>
    </div>
  );
}
