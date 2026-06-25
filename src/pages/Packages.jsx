import { useEffect, useState } from "react";
import Breadcrumb from "../components/Breadcrumb";
import PageLoader from "../components/PageLoader";
import ProductCard from "../components/ProductCard";
import NoImage from "/assets/images/pp-noimage.jpg";
import { get } from "../utils/axios";

const Packages = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [packages, setPackages] = useState([]);

  useEffect(() => {
    getPackages();
  }, []);

  const getPackages = async () => {
    setIsLoading(true);
    try {
      const res = await get("/package/list");
      if (res.data.status) {
        const packagesList = res.data.result;
        setPackages(packagesList);
      }
    } catch (err) {
      console.error("Error fetching service details:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <Breadcrumb pageName="Packages" pageTitle="Packages" />
      {isLoading ? (
        <PageLoader />
      ) : (
        <div className="shop-page pt-120 mb-120">
          <div className="container">
            <div className="row g-4">
              {packages.map((pkg) => (
                <div className="col-lg-4 col-md-4 col-sm-6" key={pkg.id}>
                  <ProductCard
                    id={pkg.id}
                    img={pkg.image_url || NoImage}
                    name={pkg.name}
                    price={pkg.price}
                    description={pkg.description}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Packages;
