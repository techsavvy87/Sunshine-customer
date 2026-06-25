import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Breadcrumb from "../components/Breadcrumb";
import NoImage from "/assets/images/pp-noimage.jpg";
import { get } from "../utils/axios";
import ServiceBookingFormGroom from "../components/ServiceBookingFormGroom";
import ServiceBookingFormDaycare from "../components/ServiceBookingFormDaycare";
import ServiceBookingFormBoarding from "../components/ServiceBookingFormBoarding";
import ServiceBookingFormPrivateTraining from "../components/ServiceBookingFormPrivateTraining";
import ServiceBookingFormGroupClasses from "../components/ServiceBookingFormGroupClasses";
import ServiceBookingFormAlaCarte from "../components/ServiceBookingFormAlaCarte";
import ServiceSummaryTab from "../components/ServiceSummaryTab";
import PageLoader from "../components/PageLoader";

const ServiceDetail = () => {
  const { id } = useParams();

  const [groupClasses, setGroupClasses] = useState([]);
  const [categoryName, setCategoryName] = useState("");
  const [avatar, setAvatar] = useState(NoImage);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [price_small, setPriceSmall] = useState("");
  const [price_medium, setPriceMedium] = useState("");
  const [price_large, setPriceLarge] = useState("");
  const [price_xlarge, setPriceXlarge] = useState("");
  const [duration, setDuration] = useState(0);
  const [services, setServices] = useState([]);
  const [servicesGrooming, setServicesGrooming] = useState([]);
  const [servicesTraining, setServicesTraining] = useState([]);
  const [pets, setPets] = useState([]);
  const [description, setDescription] = useState("");
  const [appointments, setAppointments] = useState([]);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getService();
  }, [id]);

  const getService = async () => {
    setIsLoading(true);
    try {
      const res = await get(`/service/detail/${id}`);
      if (res.data.status) {
        const serviceData = res.data.result;

        setAvatar(serviceData.avatar_img_url || NoImage);
        setName(serviceData.name || "");
        setPrice(serviceData.price || "");
        setPriceSmall(serviceData.price_small || "");
        setPriceMedium(serviceData.price_medium || "");
        setPriceLarge(serviceData.price_large || "");
        setPriceXlarge(serviceData.price_xlarge || "");
        setDuration(serviceData.duration || 0);
        setServices(serviceData.additional_services || []);
        setServicesGrooming(serviceData.additional_services_grooming || []);
        setServicesTraining(serviceData.additional_services_training || []);
        setPets(serviceData.pets || []);
        setDescription(serviceData.description || "");
        setAppointments(serviceData.appointments || []);
        setCategoryName(serviceData.category?.name || "");
        setGroupClasses(serviceData.group_classes || []);
      }
    } catch (err) {
      console.error("Error fetching service details:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <Breadcrumb pageName="Service Detail" pageTitle={name} />
      {isLoading ? (
        <PageLoader />
      ) : (
        <div className="services-details-area pt-120">
          <div className="container">
            <div className="row g-lg-4 gy-5 mb-80">
              <div className="col-lg-7">
                <div className="tab-content tab-content1 px-5">
                  <img
                    src={avatar}
                    alt="service avatar"
                    className="img-fluid"
                    style={{ width: "100%", height: "auto" }}
                  />
                </div>
              </div>
              <div className="col-lg-5">
                {categoryName.toLowerCase().includes("carte") && (
                  <ServiceBookingFormAlaCarte
                    name={name}
                    servicesGrooming={servicesGrooming}
                    pets={pets}
                    timeSlots={[]}
                    serviceId={id}
                    services={services}
                  />
                )}
                {categoryName.toLowerCase().includes("grooming") && (
                  <ServiceBookingFormGroom
                    name={name}
                    price={price}
                    price_small={price_small}
                    price_medium={price_medium}
                    price_large={price_large}
                    price_xlarge={price_xlarge}
                    services={services}
                    pets={pets}
                    timeSlots={[]}
                    serviceId={id}
                  />
                )}
                {categoryName.toLowerCase().includes("group") && (
                  <ServiceBookingFormGroupClasses
                    name={name}
                    pets={pets}
                    groupClasses={groupClasses}
                    serviceId={id}
                  />
                )}
                {categoryName.toLowerCase().includes("daycare") && (
                  <ServiceBookingFormDaycare
                    name={name}
                    priceHalf={price_small}
                    priceFull={price_medium}
                    servicesGrooming={servicesGrooming}
                    servicesTraining={servicesTraining}
                    pets={pets}
                    timeSlots={[]}
                    serviceId={id}
                  />
                )}
                {categoryName.toLowerCase().includes("boarding") && (
                  <ServiceBookingFormBoarding
                    name={name}
                    price={price}
                    duration={duration}
                    servicesGrooming={servicesGrooming}
                    servicesTraining={servicesTraining}
                    services={services}
                    pets={pets}
                    serviceId={id}
                  />
                )}
                {categoryName.toLowerCase().includes("training") && (
                  <ServiceBookingFormPrivateTraining
                    name={name}
                    servicesGrooming={servicesGrooming}
                    priceHalf={price_small}
                    priceOne={price_medium}
                    priceTravel={price_large}
                    pets={pets}
                    timeSlots={[]}
                    serviceId={id}
                  />
                )}
              </div>
            </div>
            <div className="row mb-70">
              <ServiceSummaryTab
                serviceId={id}
                description={description}
                appointments={appointments}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceDetail;
