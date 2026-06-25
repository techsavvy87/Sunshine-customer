import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "react-datepicker/dist/react-datepicker.css";
import { get } from "../utils/axios";
import NoImage from "/assets/images/pp-noimage.jpg";
import PageLoader from "../components/PageLoader";
import Breadcrumb from "../components/Breadcrumb";
import toast from "react-hot-toast";

const PackageDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [services, setServices] = useState([]);
  const [image, setImage] = useState(NoImage);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [days, setDays] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const descRef = useRef(null);
  const [showToggle, setShowToggle] = useState(false);

  useEffect(() => {
    getPackage();
  }, [id]);

  useEffect(() => {
    const measure = () => {
      const el = descRef.current;
      if (!el) return;

      // Create an offscreen clone to measure full height without line-clamp
      const clone = el.cloneNode(true);
      clone.style.position = "absolute";
      clone.style.visibility = "hidden";
      clone.style.height = "auto";
      clone.style.maxHeight = "none";
      clone.style.display = "block";
      clone.style.webkitLineClamp = "none";
      clone.style.overflow = "visible";
      // Keep same width so measurements match
      clone.style.width = `${el.clientWidth}px`;
      document.body.appendChild(clone);

      const computed = window.getComputedStyle(clone);
      const lineHeight =
        parseFloat(computed.lineHeight) ||
        parseFloat(computed.fontSize) * 1.2 ||
        16;
      const fullLines = Math.round(clone.clientHeight / lineHeight);
      setShowToggle(fullLines > 4);

      document.body.removeChild(clone);
    };

    // measure once and on resize
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [description]);

  const getPackage = async () => {
    setIsLoading(true);
    try {
      const res = await get(`/package/detail/${id}`);
      if (res.data.status) {
        const packageData = res.data.result;
        setImage(packageData.image_url || NoImage);
        setName(packageData.name || "");
        setPrice(packageData.price || "");
        setDescription(packageData.description || "");
        setDays(packageData.days || 0);
        setServices(packageData.services || []);
      }
    } catch (err) {
      toast.error("Error fetching package details.");
      console.error("Error fetching package details:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const buyPackage = () => {
    navigate(`/checkout/package/${id}`);
  };

  return (
    <div>
      <Breadcrumb pageName="Package Detail" pageTitle={name} />
      {isLoading ? (
        <PageLoader />
      ) : (
        <div className="services-details-area pt-120">
          <div className="container">
            <div className="row g-5 gy-5 mb-40">
              <div className="col-lg-7">
                <div
                  className="tab-content tab-content1 px-4"
                  style={{ background: "transparent" }}
                >
                  <img
                    src={image}
                    alt={name}
                    className="img-fluid"
                    style={{
                      width: "100%",
                      objectFit: "cover",
                      maxHeight: 460,
                    }}
                  />
                </div>
              </div>
              <div className="col-lg-5">
                <div
                  className="services-datails-content py-4"
                  style={{ background: "transparent", boxShadow: "none" }}
                >
                  <div className="banner-title pt-2">
                    <h2 className="text-dark fw-bolder">{name}</h2>
                    <div className="d-flex align-items-center gap-3">
                      <div className="currency pt-2">
                        <h5 className="mb-0">{`$${Number(price).toFixed(
                          2
                        )}`}</h5>
                      </div>
                      <div className="pt-3">
                        <span className="fw-bold">({days} days)</span>
                      </div>
                    </div>
                    <div className="py-3">
                      {services.map((service) => (
                        <span
                          className="badge rounded-pill bg-secondary me-2"
                          key={service.id}
                        >
                          {service.name}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="service-area">
                    <p
                      ref={descRef}
                      className="mb-0"
                      style={
                        !showFullDescription
                          ? {
                              display: "-webkit-box",
                              WebkitLineClamp: 4,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }
                          : undefined
                      }
                    >
                      {description}
                    </p>
                    {showToggle && (
                      <span
                        className="text-primary pe-3 fw-bolder"
                        aria-expanded={showFullDescription}
                        onClick={() => setShowFullDescription((s) => !s)}
                        style={{
                          textDecoration: "none",
                          float: "right",
                          cursor: "pointer",
                          fontSize: 14,
                        }}
                      >
                        {showFullDescription ? "Show less" : "Read more"}
                      </span>
                    )}
                    <div className="shop-quantity d-flex flex-wrap align-items-center justify-content-start mb-20 pt-4">
                      <button
                        className="primary-btn2 px-4 pt-2 pb-1"
                        onClick={buyPackage}
                      >
                        Buy Now
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PackageDetail;
