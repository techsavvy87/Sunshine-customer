import { useState, useEffect, useRef } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { get, post } from "../utils/axios";
import toast from "react-hot-toast";
import Select from "react-select";

const ServiceBookingFormBoarding = (props) => {
  const {
    name,
    price,
    duration,
    servicesGrooming,
    servicesTraining,
    services,
    pets,
    serviceId,
  } = props;

  const [selectedPet, setSelectedPet] = useState("");
  const [selectedServicesGrooming, setSelectedServicesGrooming] = useState([]);
  const [selectedServicesTraining, setSelectedServicesTraining] = useState([]);
  const [dropOffDateTime, setDropOffDateTime] = useState(null);
  const [pickUpDateTime, setPickUpDateTime] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingAdditionalServices, setLoadingAdditionalServices] = useState(false);
  const [chauffeurPrice, setChauffeurPrice] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [groomingOptions, setGroomingOptions] = useState(servicesGrooming || []);
  const wasChauffeurSelectedRef = useRef(false);
  
  useEffect(() => {
    const baseServices = Array.isArray(servicesGrooming) ? servicesGrooming : [];
    const chauffeurService = (services || []).find(
      (svc) => svc?.name?.toLowerCase() === "chauffeur"
    );
    const hasChauffeur = baseServices.some(
      (svc) => String(svc?.name || "").toLowerCase() === "chauffeur"
    );

    if (chauffeurService && !hasChauffeur) {
      servicesGrooming.push(chauffeurService);
      setGroomingOptions([...servicesGrooming]);
      return;
    }

    setGroomingOptions(baseServices);
  }, [services, servicesGrooming]);

  const formatDate = (dateObj) => {
    if (!dateObj) return "";
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const day = String(dateObj.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const formatTime = (dateObj) => {
    if (!dateObj) return "";
    const hours = String(dateObj.getHours()).padStart(2, "0");
    const minutes = String(dateObj.getMinutes()).padStart(2, "0");
    const seconds = String(dateObj.getSeconds()).padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
  };

  const onChangePet = (petId) => {
    setSelectedPet(petId);
    setTotalPrice(
      calculateTotalPrice(
        dropOffDateTime,
        pickUpDateTime,
        petId,
        selectedServicesGrooming,
        selectedServicesTraining
      ) + chauffeurPrice
    );
  };

  const onChangeDropOffDateTime = async (date) => {
    setDropOffDateTime(date);
    setTotalPrice(
      calculateTotalPrice(
        date,
        pickUpDateTime,
        selectedPet,
        selectedServicesGrooming,
        selectedServicesTraining
      ) + chauffeurPrice
    );
  };

  const onChangePickUpDateTime = async (date) => {
    setPickUpDateTime(date);
    setTotalPrice(
      calculateTotalPrice(
        dropOffDateTime,
        date,
        selectedPet,
        selectedServicesGrooming,
        selectedServicesTraining
      ) + chauffeurPrice
    );
  };

  const onChangeServicesGrooming = async (selectedOptions) => {
    const nextSelectedOptions = selectedOptions || [];
    setSelectedServicesGrooming(nextSelectedOptions);

    const baseTotal = calculateTotalPrice(
      dropOffDateTime,
      pickUpDateTime,
      selectedPet,
      nextSelectedOptions,
      selectedServicesTraining
    );

    const chauffeurServiceSelected = nextSelectedOptions.some((option) => {
      const service = groomingOptions.find((svc) => String(svc.id) === String(option.value));
      return service && service.name.toLowerCase().includes("chauffeur");
    });

    const chauffeurSelectionChanged =
      chauffeurServiceSelected !== wasChauffeurSelectedRef.current;
    wasChauffeurSelectedRef.current = chauffeurServiceSelected;

    if (!chauffeurSelectionChanged) {
      setLoadingAdditionalServices(false);
      setTotalPrice(baseTotal + (chauffeurServiceSelected ? chauffeurPrice : 0));
      return;
    }

    if (!chauffeurServiceSelected) {
      setChauffeurPrice(0);
      setLoadingAdditionalServices(false);
      setTotalPrice(baseTotal);
      return;
    }

    const chauffeurServiceId = nextSelectedOptions.find((option) => {
      const service = groomingOptions.find((svc) => String(svc.id) === String(option.value));
      return service && service.name.toLowerCase().includes("chauffeur");
    })?.value;

    let userId = null;
    try {
      const storedUser = localStorage.getItem("user");
      userId = storedUser ? JSON.parse(storedUser)?.id : null;
    } catch (error) {
      userId = null;
    }

    if (!chauffeurServiceId || !userId) {
      setChauffeurPrice(0);
      setLoadingAdditionalServices(false);
      setTotalPrice(baseTotal);
      return;
    }

    try {
      setLoadingAdditionalServices(true);
      const res = await get(
        `/service/calculate-distance/service_id=${chauffeurServiceId}?user_id=${userId}`
      );

      const result = res?.data?.result || {};
      const rootErrors = Array.isArray(res?.data?.errors)
        ? res.data.errors
        : [];
      const resultErrors = Array.isArray(result?.errors)
        ? result.errors
        : [];

      const hasValidationFlags =
        result?.owner_location_valid === false ||
        result?.facility_location_valid === false;
      const combinedErrors = [...rootErrors, ...resultErrors];

      if (combinedErrors.length > 0) {
        toast.error(combinedErrors[0]);
        setChauffeurPrice(0);
        setTotalPrice(baseTotal);
      } else if (hasValidationFlags) {
        toast.error(res?.data?.message || "Address validation failed");
        setChauffeurPrice(0);
        setTotalPrice(baseTotal);
      } else {
        const mileagePrice = Number(result?.price) || 0;
        setChauffeurPrice(mileagePrice);
        setTotalPrice(baseTotal + mileagePrice);
      }
    } catch (error) {
      toast.error("Failed to calculate chauffeur mileage price.");
      setChauffeurPrice(0);
      setTotalPrice(baseTotal);
    } finally {
      setLoadingAdditionalServices(false);
    }
  };

  const onChangeServicesTraining = (selectedOptions) => {
    setSelectedServicesTraining(selectedOptions);
    setTotalPrice(
      calculateTotalPrice(
        dropOffDateTime,
        pickUpDateTime,
        selectedPet,
        selectedServicesGrooming,
        selectedOptions
      ) + chauffeurPrice
    );
  };

  const calculateTotalPrice = (
    _dropOff,
    _pickUp,
    _petId,
    _groomingServices,
    _trainingServices
  ) => {
    if (!price || !duration || !_dropOff || !_pickUp) {
      return 0;
    }

    const toNumber = (value) => {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : 0;
    };

    // Calculate price per hour
    const basePrice = toNumber(price);
    const durationHours = toNumber(duration);
    if (durationHours <= 0) return 0;
    const pricePerHour = basePrice / durationHours;

    // Calculate total hours between dropOff and pickUp
    const dropOff = new Date(_dropOff);
    const pickUp = new Date(_pickUp);
    const diffMs = pickUp - dropOff;
    const totalHours = diffMs / (1000 * 60 * 60); // Convert milliseconds to hours

    // Calculate boarding total price
    const boardingTotal = toNumber(pricePerHour * totalHours);

    const chosedPet = pets.find((pet) => pet.id == _petId);
    if (!chosedPet) return boardingTotal;
    const chosedPetSize = chosedPet.size;
    const petCoatDoubleCoatedValue = chosedPet?.coat_type?.is_double_coated;
    const isPetDoubleCoated = petCoatDoubleCoatedValue;

    const getCoatTypePrice = (serviceData) => {
      if (!isPetDoubleCoated) return 0;
      const serviceRequiresCoatPricing = serviceData?.is_double_coated;
      if (!serviceRequiresCoatPricing) return 0;
      return toNumber(serviceData?.coat_type_price);
    };

    let additionalServicesTotal = 0;
    _groomingServices.forEach((option) => {
      const service = servicesGrooming.find((svc) => svc.id === option.value);
      if (service) {
        if (chosedPetSize === "small") {
          additionalServicesTotal +=
            toNumber(service.price_small) || toNumber(service.price);
        } else if (chosedPetSize === "medium") {
          additionalServicesTotal +=
            toNumber(service.price_medium) || toNumber(service.price);
        } else if (chosedPetSize === "large") {
          additionalServicesTotal +=
            toNumber(service.price_large) || toNumber(service.price);
        } else if (chosedPetSize === "xlarge") {
          additionalServicesTotal +=
            toNumber(service.price_xlarge) || toNumber(service.price);
        } else {
          additionalServicesTotal += toNumber(service.price);
        }

        additionalServicesTotal += getCoatTypePrice(service);
      }
    });
    _trainingServices.forEach((option) => {
      const service = servicesTraining.find((svc) => svc.id === option.value);
      if (service) {
        additionalServicesTotal += toNumber(service.price_medium);
        additionalServicesTotal += getCoatTypePrice(service);
      }
    });
    return boardingTotal + additionalServicesTotal;
  };

  const confirmBooking = async () => {
    if (!selectedPet || !dropOffDateTime || !pickUpDateTime) {
      toast.error("Please select a pet and a drop-off and pick-up date/time.");
      return;
    }

    let data = {
      pet_id: selectedPet,
      timeslot_id: null,
      date: formatDate(dropOffDateTime),
      start_time: formatTime(dropOffDateTime),
      end_date: formatDate(pickUpDateTime),
      end_time: formatTime(pickUpDateTime),
      service_id: serviceId,
      estimated_price: totalPrice,
    };

    if (
      selectedServicesGrooming.length > 0 ||
      selectedServicesTraining.length > 0
    ) {
      data.additional_service_ids = [
        ...selectedServicesGrooming,
        ...selectedServicesTraining,
      ].map((s) => s.value);
    }

    setLoading(true);
    try {
      const res = await post("/appointment/create", data);
      if (res.data.status) {
        toast.success("Appointment has been submitted!");
        resetForm();
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      console.error("Error booking service:", err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedPet("");
    setDropOffDateTime(null);
    setPickUpDateTime(null);
    setLoadingAdditionalServices(false);
    setChauffeurPrice(0);
    setTotalPrice(0);
    setSelectedServicesGrooming([]);
    setSelectedServicesTraining([]);
  };

  const LoadingSpiner = () => (
    <div
      className="clearfix"
      style={{
        padding: "7px",
        borderRadius: "5px",
        height: "40px",
      }}
    >
      <div
        className="spinner-border spinner-border-sm float-end"
        role="status"
      >
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );

  return (
    <div className="services-datails-content py-4">
      <div className="banner-title pt-2 d-flex align-items-center justify-content-between">
        <h2>{name}</h2>
        <div className="currency" style={{ position: "relative", minWidth: "110px", minHeight: "40px" }}>
          <h5
            className="mb-0"
            style={{
              filter: loadingAdditionalServices ? "blur(2px)" : "none",
              transition: "filter 0.2s ease",
              lineHeight: "40px",
              textAlign: "right",
            }}
          >
            {totalPrice === 0 ? "---" : `$${totalPrice.toFixed(2)}`}
          </h5>
          {loadingAdditionalServices && (
            <div style={{ position: "absolute", inset: 0 }}>
              <LoadingSpiner />
            </div>
          )}
        </div>
      </div>
      <div className="service-area">
        <div className="row">
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
                onChange={(e) => onChangePet(e.target.value)}
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
        </div>
        <div className="row">
          <div className="col-lg-6 mt-3">
            <div className="form-inner date">
              <label>Drop Off</label>
              <DatePicker
                showTimeSelect
                selected={dropOffDateTime}
                onChange={onChangeDropOffDateTime}
                dateFormat="MM/dd/yyyy HH:mm"
                className="calendar service-date"
                placeholderText="Date/Time"
              />
            </div>
          </div>
          <div className="col-lg-6 mt-3">
            <div className="form-inner date">
              <label>Pick Up</label>
              <DatePicker
                showTimeSelect
                selected={pickUpDateTime}
                onChange={onChangePickUpDateTime}
                dateFormat="MM/dd/yyyy HH:mm"
                className="calendar service-date"
                placeholderText="Date/Time"
              />
            </div>
          </div>
        </div>
        <div className="form-inner mt-3">
          <label>Additional Services</label>
          <Select
            className="basic-multi-select"
            options={groomingOptions.map((service) => ({
              value: service.id,
              label: service.name,
            }))}
            placeholder="Choose Grooming Services"
            isMulti
            value={selectedServicesGrooming}
            onChange={onChangeServicesGrooming}
            styles={{
              control: (baseStyles) => ({
                ...baseStyles,
                borderColor: "#e8e8e8",
                minHeight: "42px",
                fontFamily: "Cabin",
                fontSize: "0.875rem",
                boxShadow: "none",
                outline: "none",
                "&:hover": {
                  borderColor: "#e8e8e8",
                },
              }),
              option: (base, state) => ({
                ...base,
                backgroundColor: state.isFocused ? "#1967d2" : "white",
                color: state.isFocused ? "white" : "black",
                paddingTop: 2,
                paddingBottom: 2,
                fontFamily: "Cabin",
              }),
              menu: (base) => ({
                ...base,
                borderRadius: "0px",
                zIndex: 100,
                marginTop: 0,
              }),
              menuList: (base) => ({
                ...base,
                maxHeight: "180px",
                overflowY: "auto",
              }),
              multiValueLabel: (base) => ({
                ...base,
                fontWeight: 600,
                fontFamily: "Cabin",
              }),
              valueContainer: (base) => ({
                ...base,
                paddingTop: 1,
                paddingBottom: 1,
              }),
              input: (base) => ({
                ...base,
                marginTop: -50,
              }),
            }}
          />
          <Select
            className="basic-multi-select"
            options={servicesTraining.map((service) => ({
              value: service.id,
              label: service.name,
            }))}
            placeholder="Choose Training Services"
            isMulti
            value={selectedServicesTraining}
            onChange={onChangeServicesTraining}
            styles={{
              control: (baseStyles) => ({
                ...baseStyles,
                marginTop: 12,
                borderColor: "#e8e8e8",
                minHeight: "42px",
                fontFamily: "Cabin",
                fontSize: "0.875rem",
                boxShadow: "none",
                outline: "none",
                "&:hover": {
                  borderColor: "#e8e8e8",
                },
              }),
              option: (base, state) => ({
                ...base,
                backgroundColor: state.isFocused ? "#1967d2" : "white",
                color: state.isFocused ? "white" : "black",
                paddingTop: 2,
                paddingBottom: 2,
                fontFamily: "Cabin",
              }),
              menu: (base) => ({
                ...base,
                borderRadius: "0px",
                zIndex: 100,
                marginTop: 0,
              }),
              menuList: (base) => ({
                ...base,
                maxHeight: "180px",
                overflowY: "auto",
              }),
              multiValueLabel: (base) => ({
                ...base,
                fontWeight: 600,
                fontFamily: "Cabin",
              }),
              valueContainer: (base) => ({
                ...base,
                paddingTop: 1,
                paddingBottom: 1,
              }),
              input: (base) => ({
                ...base,
                marginTop: -50,
              }),
            }}
          />
        </div>
        <div className="shop-quantity d-flex flex-wrap align-items-center justify-content-start mb-20 pt-4">
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
  );
};

export default ServiceBookingFormBoarding;
