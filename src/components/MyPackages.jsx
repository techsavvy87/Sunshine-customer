import { useEffect, useState, Fragment } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { get } from "../utils/axios";
import NoImage from "/assets/images/pp-noimage.jpg";
import PageLoader from "./PageLoader";

const MyPackages = () => {
  const navigate = useNavigate();

  const [myPackages, setMyPackages] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getMyPackages();
  }, []);

  const getMyPackages = async () => {
    setLoading(true);
    try {
      const res = await get("/packages/customer");
      if (res.data.status) {
        const resultData = res.data.result;
        console.log(resultData);
        setMyPackages(resultData);
      }
    } catch (err) {
      console.error("Error fetching service details:", err);
    } finally {
      setLoading(false);
    }
  };

  const bookPackage = (pkg) => {
    if (pkg.remaining_days > 0) {
      navigate(`/package/booking/${pkg.id}/${pkg.package_id}`);
    } else {
      toast.error("No remaining days for this package.");
    }
  };

  return (
    <Fragment>
      {loading ? (
        <PageLoader />
      ) : (
        <div className="h1-pricing-plan-area two pt-2">
          <div className="row justify-content-center g-1">
            {myPackages.map((myPkg) => (
              <div
                className="col-lg-4 col-md-6 col-sm-10 px-5 py-4"
                key={myPkg.id}
                // style={{ padding: "30px 60px" }}
              >
                <div className="pricing-card px-0 pt-0 pb-4">
                  <img
                    src={myPkg?.package?.image_url || NoImage}
                    alt=""
                    style={{
                      width: "100%",
                      height: 150,
                      objectFit: "cover",
                      borderTopLeftRadius: 8,
                      borderTopRightRadius: 8,
                    }}
                  />
                  <div className="title pt-3 mb-1">
                    <h4>{myPkg?.package?.name}</h4>
                    <h6 className="pt-1">
                      <span className="currency text-danger">
                        ${myPkg?.package?.price}
                      </span>
                    </h6>
                  </div>
                  <ul className="px-4">
                    <li style={{ padding: "8px 0", fontSize: 14 }}>
                      <span>
                        Package Days:
                        <span className="ps-2 fw-bold">
                          {myPkg?.package?.days}
                        </span>
                      </span>
                      <i
                        className="bi bi-calendar-minus me-1 text-primary fs-6"
                        aria-hidden="true"
                      ></i>
                    </li>
                    <li style={{ padding: "8px 0", fontSize: 14 }}>
                      <span>
                        Remaining Days:
                        <span className="ps-2 fw-bold">
                          {myPkg.remaining_days}
                        </span>
                      </span>
                      <i
                        className="bi bi-calendar-check me-1 text-primary fs-6"
                        aria-hidden="true"
                      ></i>
                    </li>
                    <li style={{ padding: "8px 0", fontSize: 14 }}>
                      <span>
                        Services:
                        {myPkg?.package?.services?.map((service) => (
                          <span
                            className="badge rounded-pill bg-secondary ms-2"
                            key={service.id}
                          >
                            {service.name}
                          </span>
                        ))}
                      </span>
                    </li>
                  </ul>
                  <div className="book-now-btn pt-4">
                    <button
                      onClick={() => bookPackage(myPkg)}
                      className="my-package-card-btn"
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Fragment>
  );
};

export default MyPackages;
