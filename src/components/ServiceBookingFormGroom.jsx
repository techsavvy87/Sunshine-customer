import { useEffect, useRef, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { post } from "../utils/axios";
import toast from "react-hot-toast";
import Select from "react-select";
import { get } from "../utils/axios";

const ServiceBookingFormGroom = (props) => {
  const {
    name,
    price,
    price_small,
    price_medium,
    price_large,
    price_xlarge,
    services,
    pets,
    timeSlots,
    serviceId,
  } = props;

  const [selectedPet, setSelectedPet] = useState("");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("");
  const [selectedServices, setSelectedServices] = useState([]);
  const [bookingDate, setBookingDate] = useState(new Date());
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [loadingAdditionalServices, setLoadingAdditionalServices] = useState(false);
  const [slots, setSlots] = useState(timeSlots);
  const [loading, setLoading] = useState(false);
  const [chauffeurPrice, setChauffeurPrice] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const wasChauffeurSelectedRef = useRef(false);

  useEffect(() => {
    setSlots(timeSlots);
  }, [timeSlots]);

  const formatTime = (timeStr) => {
    const [hour, minute, second] = timeStr.split(":");
    const date = new Date();
    date.setHours(hour, minute, second);
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (dateObj) => {
    if (!dateObj) return "";
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const day = String(dateObj.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const formatDaycareDuration = (duration) => {
    if (!duration) return "";
    return duration
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const getPriceByPetSize = (petSize) => {
    let selectedPrice;
    switch (petSize) {
      case "small":
        selectedPrice = Number(price_small) || Number(price);
        break;
      case "medium":
        selectedPrice = Number(price_medium) || Number(price);
        break;
      case "large":
        selectedPrice = Number(price_large) || Number(price);
        break;
      case "xlarge":
        selectedPrice = Number(price_xlarge) || Number(price);
        break;
      default:
        selectedPrice = Number(price);
    }
    return selectedPrice || 0;
  };

  const calculateTotalPrice = async (_petId, _selectedServices) => {
    if (!_petId) return 0;
    
    const chosenPet = pets.find((pet) => pet.id == _petId);
    if (!chosenPet) return 0;
    
    const chosenPetSize = chosenPet.size;
    const petCoatDoubleCoatedValue = chosenPet?.coat_type?.is_double_coated ;
    const isPetDoubleCoated = petCoatDoubleCoatedValue; 
    const getCoatTypePrice = (serviceData) => {
      if (!isPetDoubleCoated) return 0;
      const serviceRequiresCoatPricing = serviceData?.is_double_coated;

      if (!serviceRequiresCoatPricing) return 0;
      return Number(serviceData?.coat_type_price) || 0;
    };
    
    // Get base service price
    const basePrice = getPriceByPetSize(chosenPetSize) + getCoatTypePrice(props);
    
    // Calculate additional services total
    let additionalServicesTotal = 0;
    _selectedServices.forEach((option) => {
      const service = services.find((svc) => svc.id === option.value);
      if (service) {
        if (chosenPetSize === "small") {
          additionalServicesTotal += parseFloat(
            service.price_small || service.price || 0
          );
        } else if (chosenPetSize === "medium") {
          additionalServicesTotal += parseFloat(
            service.price_medium || service.price || 0
          );
        } else if (chosenPetSize === "large") {
          additionalServicesTotal += parseFloat(
            service.price_large || service.price || 0
          );
        } else if (chosenPetSize === "xlarge") {
          additionalServicesTotal += parseFloat(
            service.price_xlarge || service.price || 0
          );
        } else {
          additionalServicesTotal += parseFloat(service.price || 0);
        }

        additionalServicesTotal += getCoatTypePrice(service);
      }
    });

    return basePrice + additionalServicesTotal;
  };

  const fetchAvailableSlots = async (_date, _petId, _selectedServiceIds) => {
    if (!_date || !_petId) {
      setSlots([]);
      setSelectedTimeSlot("");
      return;
    }

    let petSize = "";
    if (_petId) {
      const selectedPetData = pets.find((p) => String(p.id) === String(_petId));
      if (selectedPetData) {
        petSize = selectedPetData.size;
      }
    }

    setLoadingSlots(true);
    try {
      let data = {
        date: formatDate(_date),
        service_id: serviceId,
        pet_size: petSize,
      };

      // Include additional service IDs if any are selected
      if (_selectedServiceIds && _selectedServiceIds.length > 0) {
        data.additional_service_ids = _selectedServiceIds;
      }

      const res = await post("/service/timeslots", data);
      if (res.data.status) {
        const slotsData = res.data.result;
        setSlots(slotsData || []);
        setSelectedTimeSlot("");
      } else {
        setSlots([]);
        setSelectedTimeSlot("");
      }
    } catch (err) {
      console.error("Error fetching service details:", err);
      setSlots([]);
      setSelectedTimeSlot("");
    } finally {
      setLoadingSlots(false);
    }
  };

  const onChangePet = async (pet) => {
    setSelectedPet(pet);

    // Calculate total price with the new pet and current selected services
    const newTotalPrice = await calculateTotalPrice(pet, selectedServices);
    setTotalPrice(newTotalPrice + (wasChauffeurSelectedRef.current ? chauffeurPrice : 0));

    fetchAvailableSlots(
      bookingDate,
      pet,
      selectedServices.map((s) => s.value)
    );
  };

  const onChangeDate = async (date) => {
    setBookingDate(date);

    fetchAvailableSlots(
      date,
      selectedPet,
      selectedServices.map((s) => s.value)
    );
  };

  const confirmBooking = async () => {
    if (!selectedPet || !selectedTimeSlot) {
      toast.error("Please select a pet and a time slot.");
      return;
    }

    let data = {
      pet_id: selectedPet,
      timeslot_id: selectedTimeSlot,
      date: formatDate(bookingDate),
      service_id: serviceId,
    };

    if (selectedServices.length > 0) {
      data.additional_service_ids = selectedServices.map((s) => s.value);
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

  const onChangeServices = async (selectedOptions) => {
    const nextSelectedOptions = selectedOptions || [];
    setSelectedServices(nextSelectedOptions);

    const baseTotal = await calculateTotalPrice(selectedPet, nextSelectedOptions);

    const chauffeurServiceSelected = nextSelectedOptions.some((option) => {
      const optionLabel = String(option?.label || "").toLowerCase();
      if (optionLabel.includes("chauffeur")) {
        return true;
      }

      const service = services.find((svc) => String(svc.id) === String(option.value));
      return String(service?.name || "").toLowerCase().includes("chauffeur");
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

    const selectedChauffeurOption = nextSelectedOptions.find((option) => {
      const optionLabel = String(option?.label || "").toLowerCase();
      if (optionLabel.includes("chauffeur")) {
        return true;
      }

      const service = services.find((svc) => String(svc.id) === String(option.value));
      return String(service?.name || "").toLowerCase().includes("chauffeur");
    });

    const chauffeurServiceId = selectedChauffeurOption?.value;

    let userId = null;
    try {
      const storedUser = localStorage.getItem("user");
      userId = storedUser ? JSON.parse(storedUser)?.id : null;
    } catch (error) {
      userId = null;
    }

    if (chauffeurServiceId == null || userId == null) {
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

  const resetForm = () => {
    setSelectedPet("");
    setSelectedTimeSlot("");
    setBookingDate(new Date());
    setSelectedServices([]);
    wasChauffeurSelectedRef.current = false;
    setLoadingAdditionalServices(false);
    setChauffeurPrice(0);
    setTotalPrice(0);
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
          <div className="col-lg-12">
            <div className="row">
              <div className="col-lg-6">
                <div className="form-inner date">
                  <label>Date</label>
                  <DatePicker
                    selected={bookingDate}
                    onChange={onChangeDate}
                    placeholderText="Check In"
                    className="calendar service-date"
                  />
                </div>
              </div>
              <div className="col-lg-6">
                <div className="form-inner">
                  <label>Time Slot</label>
                  {loadingSlots ? (
                    <div
                      className="clearfix"
                      style={{
                        border: "1px solid #e8e8e8",
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
                  ) : (
                    <select
                      style={{
                        width: "100%",
                        padding: "10px",
                        fontSize: "14px",
                      }}
                      value={selectedTimeSlot}
                      onChange={(e) => setSelectedTimeSlot(e.target.value)}
                    >
                      <option value="" hidden></option>
                      {slots.map((slot) => (
                        <option
                          key={slot.id}
                          value={slot.id}
                          disabled={slot.status !== "available"}
                        >
                          {formatTime(slot.start_time)} -{" "}
                          {formatTime(slot.end_time)}
                          {slot.daycare_duration &&
                            ` (${formatDaycareDuration(
                              slot.daycare_duration
                            )})`}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="col-lg-12">
            <div className="form-inner">
              <label>Additional Services</label>
              <Select
                className="basic-multi-select"
                options={services.map((service) => ({
                  value: service.id,
                  label: service.name,
                }))}
                placeholder="Choose services"
                isMulti
                value={selectedServices}
                onChange={onChangeServices}
                styles={{
                  control: (baseStyles) => ({
                    ...baseStyles,
                    borderColor: "#e8e8e8",
                    minHeight: "42px", // Reduce height here
                    fontFamily: "Cabin",
                    fontSize: "0.875rem",
                    boxShadow: "none",
                    outline: "none",
                    "&:hover": {
                      borderColor: "#e8e8e8", // Prevent blue border on hover
                    },
                  }),
                  option: (base, state) => ({
                    ...base,
                    backgroundColor: state.isFocused ? "#1967d2" : "white", // Set your desired hover color
                    color: state.isFocused ? "white" : "black", // Optional: set text color
                    paddingTop: 2,
                    paddingBottom: 2,
                    fontFamily: "Cabin",
                  }),
                  menu: (base) => ({
                    ...base,
                    borderRadius: "0px", // Rounded corners
                    zIndex: 100, // Ensure it appears above other elements
                    marginTop: 0,
                  }),
                  menuList: (base) => ({
                    ...base,
                    maxHeight: "180px",
                    overflowY: "auto",
                  }),
                  multiValueLabel: (base) => ({
                    ...base,
                    fontWeight: 600, // Semi-bold for multi-select values
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
  );
};

export default ServiceBookingFormGroom;
