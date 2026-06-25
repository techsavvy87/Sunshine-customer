import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { get, post } from "../utils/axios";
import NoImage from "/assets/images/pp-noimage.jpg";
import PageLoader from "../components/PageLoader";
import Breadcrumb from "../components/Breadcrumb";
import toast from "react-hot-toast";

const PackageBooking = () => {
  const { id, packageId } = useParams();

  const [pets, setPets] = useState([]);
  const [services, setServices] = useState([]);
  const [image, setImage] = useState(NoImage);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [days, setDays] = useState(0);
  const [selectedPet, setSelectedPet] = useState("");
  const [bookingDate, setBookingDate] = useState(new Date());
  const [serviceId, setServiceId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getPackage();
  }, [id, packageId]);

  const getPackage = async () => {
    setIsLoading(true);
    try {
      const res = await get(`/package/detail/${packageId}`);
      if (res.data.status) {
        const packageData = res.data.result;
        console.log("Package Data:", packageData);
        setServiceId(packageData.service_id);
        setPets(packageData.pets || []);
        setImage(packageData.image_url || NoImage);
        setName(packageData.name || "");
        setPrice(packageData.price || "");
        setDescription(packageData.description || "");
        setDays(packageData.days || 0);
        setServices(packageData.services || []);
      }
    } catch (err) {
      console.error("Error fetching package details:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const confirmBooking = async () => {
    if (!selectedPet) {
      toast.error("Please select a pet.");
      return;
    }

    const data = {
      package_id: packageId,
      customer_package_id: id,
      pet_id: selectedPet,
      date: formatDate(bookingDate),
      service_id: serviceId,
    };

    setLoading(true);
    try {
      const res = await post("/appointment/create", data);
      if (res.data.status) {
        toast.success("Appointment has been submitted!");
        // resetForm();
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      console.error("Error booking service:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateObj) => {
    if (!dateObj) return "";
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const day = String(dateObj.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
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
                <div className="services-datails-content py-4">
                  <div className="banner-title pt-2">
                    <h3 className="text-dark fw-bolder">{name}</h3>
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
                    <div className="row g-3">
                      <div className="col-lg-12">
                        <div className="form-inner">
                          <label>Your Pet</label>
                          <select
                            style={{
                              width: "100%",
                              padding: "10px",
                              fontSize: "14px",
                            }}
                            value={selectedPet}
                            onChange={(e) => setSelectedPet(e.target.value)}
                          >
                            <option value="" hidden>
                              Choose your pet
                            </option>
                            {pets.map((pet) => (
                              <option key={pet.id} value={pet.id}>
                                {pet.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="col-lg-12">
                        <div className="form-inner date">
                          <label>Start Date</label>
                          <DatePicker
                            selected={bookingDate}
                            onChange={setBookingDate}
                            placeholderText="Booking Date"
                            className="calendar service-date"
                          />
                        </div>
                      </div>
                      <div className="shop-quantity d-flex flex-wrap align-items-center justify-content-start mb-20 pt-3">
                        <button
                          className="primary-btn2 px-4 pt-2 pb-1"
                          onClick={confirmBooking}
                          disabled={loading}
                        >
                          {loading && (
                            <span
                              className="spinner-border spinner-border-sm me-2"
                              role="status"
                              aria-hidden="true"
                              style={{ marginBottom: 2 }}
                            ></span>
                          )}
                          {loading ? "Loading..." : "Book"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="description px-4">
              <h4 className="mb-3 text-dark fw-bold">Description</h4>
              <p className="mb-5">{description}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PackageBooking;
