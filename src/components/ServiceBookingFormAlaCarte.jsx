import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { get, post } from "../utils/axios";
import toast from "react-hot-toast";
import Select from "react-select";

const ServiceBookingFormAlaCarte = (props) => {
  const { name, servicesGrooming, pets, timeSlots, serviceId, services } = props;

  const [selectedPet, setSelectedPet] = useState("");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("");
  const [selectedServicesGrooming, setSelectedServicesGrooming] = useState([]);
  const [selectedAdditionalServices, setSelectedAdditionalServices] = useState([]);
  const [bookingDate, setBookingDate] = useState(new Date());
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [loadingAdditionalServices, setLoadingAdditionalServices] = useState(false);
  const [slots, setSlots] = useState(timeSlots);
  const [loading, setLoading] = useState(false);
  const [totalPrice, setTotalPrice] = useState(0);
  const [chauffeurPrice, setChauffeurPrice] = useState(0);
  const [additionalServices, setAdditionalServices] = useState([]);

  useEffect(() => {
    setSlots(timeSlots);

    const chauffeurServices = (services || []).filter(
      (service) => service?.name?.toLowerCase() === "chauffeur"
    );
    setAdditionalServices(chauffeurServices);
    
  }, [timeSlots, services]);

  // Keep total price in sync: grooming price + chauffeur mileage price
  useEffect(() => {
    const groomingTotal = calculateTotalPrice(selectedPet, selectedServicesGrooming);
    setTotalPrice(groomingTotal + chauffeurPrice);
  }, [selectedPet, selectedServicesGrooming, chauffeurPrice]);

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

  const onChangePet = async (pet) => {
    setSelectedPet(pet);

    const newTotalPrice = calculateTotalPrice(pet, selectedServicesGrooming);
    setTotalPrice(newTotalPrice);

    fetchAvailableSlots(
      bookingDate,
      pet,
      selectedServicesGrooming.map((s) => s.value)
    );
  };

  const onChangeServicesGrooming = (selectedOptions) => {
    setSelectedServicesGrooming(selectedOptions);

    // change the total price with the additional services based on the pet size
    const newTotalPrice = calculateTotalPrice(selectedPet, selectedOptions);
    setTotalPrice(newTotalPrice);

    fetchAvailableSlots(
      bookingDate,
      selectedPet,
      selectedOptions.map((s) => s.value)
    );
  };

  const onChangeAdditionalServices = async (selectedOptions) => {
    setSelectedAdditionalServices(selectedOptions);

    // Check if chauffeur service is selected
    const chauffeurServiceSelected = selectedOptions.some((option) => {
      const service = services.find((svc) => svc.id === option.value);
      return service && service.name.toLowerCase().includes("chauffeur");
    });
    
    if (chauffeurServiceSelected) {
      const chauffeurServiceId = services.find((svc) => svc.name.toLowerCase().includes("chauffeur"))?.id;
      let userId = null;

      try {
        const storedUser = localStorage.getItem("user");
        userId = storedUser ? JSON.parse(storedUser)?.id : null;
      } catch (error) {
        userId = null;
      }

      if (chauffeurServiceId && userId) {
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
          } else if (hasValidationFlags) {
            toast.error(res?.data?.message || "Address validation failed");
          } else {
            const mileagePrice = Number(result?.price) || 0;
            setChauffeurPrice(mileagePrice);
          }
        } catch (error) {
          toast.error("Failed to calculate chauffeur mileage price.");
        } finally {
          setLoadingAdditionalServices(false);
        }
      }
    } else {
      setChauffeurPrice(0);
    }

  }

  const onChangeDate = async (date) => {
    setBookingDate(date);

    fetchAvailableSlots(
      date,
      selectedPet,
      selectedServicesGrooming.map((s) => s.value)
    );
  };

  const fetchAvailableSlots = async (_date, _petId, _selectedServiceIds) => {
    if (!_date || !_petId || _selectedServiceIds.length === 0) {
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
        secondary_service_ids: _selectedServiceIds,
      };
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

  const calculateTotalPrice = (_petId, _selectedServices) => {
    if (!_petId) return 0;
    const chosedPet = pets.find((pet) => pet.id == _petId);
    if (!chosedPet) return 0;
    const chosedPetSize = chosedPet.size;
    const petCoatDoubleCoatedValue = chosedPet?.coat_type?.is_double_coated;
    const isPetDoubleCoated = petCoatDoubleCoatedValue;

    const getCoatTypePrice = (serviceData) => {
      if (!isPetDoubleCoated) return 0;
      const serviceRequiresCoatPricing = serviceData?.is_double_coated;
      
      if (!serviceRequiresCoatPricing) return 0;
      return Number(serviceData?.coat_type_price) || 0;
    };

    let additionalServicesTotal = 0;
    _selectedServices.forEach((option) => {
      const service = servicesGrooming.find((svc) => svc.id === option.value);
      if (service) {
        if (chosedPetSize === "small") {
          additionalServicesTotal += parseFloat(
            service.price_small || service.price || 0
          ) || 0;
        } else if (chosedPetSize === "medium") {
          additionalServicesTotal += parseFloat(
            service.price_medium || service.price || 0
          ) || 0;
        } else if (chosedPetSize === "large") {
          additionalServicesTotal += parseFloat(
            service.price_large || service.price || 0
          ) || 0;
        } else if (chosedPetSize === "xlarge") {
          additionalServicesTotal += parseFloat(
            service.price_xlarge || service.price || 0
          ) || 0;
        } else {
          additionalServicesTotal += parseFloat(service.price || 0) || 0;
        }

        additionalServicesTotal += getCoatTypePrice(service);
      }
    });
    return additionalServicesTotal;
  };

  const confirmBooking = async () => {
    if (!selectedPet || !selectedTimeSlot) {
      toast.error("Please select a pet and a time slot.");
      return;
    }

    if (selectedServicesGrooming.length === 0) {
      toast.error("Please select at least one secondary service.");
      return;
    }
    let data = {
      pet_id: selectedPet,
      timeslot_id: null,
      start_time: slots.find((s) => s.id == selectedTimeSlot).start_time,
      end_time: slots.find((s) => s.id == selectedTimeSlot).end_time,
      date: formatDate(bookingDate),
      service_id: serviceId,
      additional_service_ids: selectedAdditionalServices.map((s) => s.value),
      secondary_service_ids: selectedServicesGrooming.map((s) => s.value),
      used_slot_ids: slots
        .find((s) => s.id == selectedTimeSlot)
        .used_slot_ids.map((s) => s),
      estimated_price: totalPrice,
    };

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
    setSelectedTimeSlot("");
    setBookingDate(new Date());
    setSelectedServicesGrooming([]);
    setSelectedAdditionalServices([]);
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
            {!totalPrice || totalPrice === 0 ? "---" : `$${totalPrice.toFixed(2)}`}
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
            <div className="form-inner">
              <label>Grooming Services</label>
              <Select
                className="basic-multi-select"
                options={servicesGrooming.map((service) => ({
                  value: service.id,
                  label: service.name,
                }))}
                placeholder="Choose grooming services"
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
            </div>
          </div>
          <div className="col-lg-12">
            <div className="form-inner">
              <label>Additional Services</label>
              <Select
                className="basic-multi-select"
                options={additionalServices.map((service) => ({
                  value: service.id,
                  label: service.name,
                }))}
                placeholder="Choose additional services"
                isMulti
                value={selectedAdditionalServices}
                onChange={onChangeAdditionalServices}
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
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>
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

export default ServiceBookingFormAlaCarte;
