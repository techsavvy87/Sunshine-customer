import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { post } from "../utils/axios";
import toast from "react-hot-toast";
import Select from "react-select";

const ServiceBookingFormDaycare = (props) => {
  const {
    name,
    priceHalf,
    priceFull,
    servicesGrooming,
    servicesTraining,
    pets,
    timeSlots,
    serviceId,
  } = props;

  const [selectedPet, setSelectedPet] = useState("");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("");
  const [selectedServicesGrooming, setSelectedServicesGrooming] = useState([]);
  const [selectedServicesTraining, setSelectedServicesTraining] = useState([]);
  const [selectedType, setSelectedType] = useState("");
  const [bookingDate, setBookingDate] = useState(new Date());
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slots, setSlots] = useState(timeSlots);
  const [loading, setLoading] = useState(false);
  const [totalPrice, setTotalPrice] = useState(0);

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

  const calculateTotalPrice = (
    _type,
    _petId,
    _selectedServicesGrooming,
    _selectedServicesTraining
  ) => {
    let basePrice = 0;
    if (_type === "half") {
      basePrice = parseFloat(priceHalf || 0);
    } else if (_type === "full") {
      basePrice = parseFloat(priceFull || 0);
    }

    if (!_petId) {
      return basePrice;
    }

    const chosenPet = pets.find((pet) => pet.id == _petId);
    if (!chosenPet) {
      return basePrice;
    }

    const chosenPetSize = chosenPet.size;

    let groomingServicesTotal = 0;
    _selectedServicesGrooming.forEach((option) => {
      const service = servicesGrooming.find((svc) => svc.id === option.value);
      if (service) {
        if (chosenPetSize === "small") {
          groomingServicesTotal += parseFloat(
            service.price_small || service.price || 0
          );
        } else if (chosenPetSize === "medium") {
          groomingServicesTotal += parseFloat(
            service.price_medium || service.price || 0
          );
        } else if (chosenPetSize === "large") {
          groomingServicesTotal += parseFloat(
            service.price_large || service.price || 0
          );
        } else if (chosenPetSize === "xlarge") {
          groomingServicesTotal += parseFloat(
            service.price_xlarge || service.price || 0
          );
        } else {
          groomingServicesTotal += parseFloat(service.price || 0);
        }
      }
    });

    let trainingServicesTotal = 0;
    _selectedServicesTraining.forEach((option) => {
      const service = servicesTraining.find((svc) => svc.id === option.value);
      if (service) {
        if (chosenPetSize === "small") {
          trainingServicesTotal += parseFloat(
            service.price_small || service.price || 0
          );
        } else if (chosenPetSize === "medium") {
          trainingServicesTotal += parseFloat(
            service.price_medium || service.price || 0
          );
        } else if (chosenPetSize === "large") {
          trainingServicesTotal += parseFloat(
            service.price_large || service.price || 0
          );
        } else if (chosenPetSize === "xlarge") {
          trainingServicesTotal += parseFloat(
            service.price_xlarge || service.price || 0
          );
        } else {
          trainingServicesTotal += parseFloat(service.price || 0);
        }
      }
    });

    return basePrice + groomingServicesTotal + trainingServicesTotal;
  };

  const fetchAvailableSlots = async (_date, _type) => {
    if (!_date || !_type) {
      setSlots([]);
      setSelectedTimeSlot("");
      return;
    }

    setLoadingSlots(true);
    try {
      let data = {
        date: formatDate(_date),
        service_id: serviceId,
        daycare_type: _type,
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

  const onChangeType = async (type) => {
    setSelectedType(type);

    const newTotalPrice = calculateTotalPrice(
      type,
      selectedPet,
      selectedServicesGrooming,
      selectedServicesTraining
    );
    setTotalPrice(newTotalPrice);

    fetchAvailableSlots(bookingDate, type);
  };

  const onChangePet = (pet) => {
    setSelectedPet(pet);
    const newTotalPrice = calculateTotalPrice(
      selectedType,
      pet,
      selectedServicesGrooming,
      selectedServicesTraining
    );
    setTotalPrice(newTotalPrice);

    fetchAvailableSlots(bookingDate, selectedType);
  };

  const onChangeDate = async (date) => {
    setBookingDate(date);

    fetchAvailableSlots(date, selectedType);
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

  const onChangeServicesGrooming = (selectedOptions) => {
    setSelectedServicesGrooming(selectedOptions);

    // Calculate total price with current type, pet, and new grooming services
    const newTotalPrice = calculateTotalPrice(
      selectedType,
      selectedPet,
      selectedOptions,
      selectedServicesTraining
    );
    setTotalPrice(newTotalPrice);
  };

  const onChangeServicesTraining = (selectedOptions) => {
    setSelectedServicesTraining(selectedOptions);

    // Calculate total price with current type, pet, and new training services
    const newTotalPrice = calculateTotalPrice(
      selectedType,
      selectedPet,
      selectedServicesGrooming,
      selectedOptions
    );
    setTotalPrice(newTotalPrice);
  };

  const resetForm = () => {
    setSelectedPet("");
    setSelectedTimeSlot("");
    setBookingDate(new Date());
    setTotalPrice(0);
    setSelectedType("");
    setSelectedServicesGrooming([]);
    setSelectedServicesTraining([]);
  };

  return (
    <div className="services-datails-content py-4">
      <div className="banner-title pt-2 d-flex align-items-center justify-content-between">
        <h2>{name}</h2>
        <div className="currency">
          <h5 className="mb-0">
            {totalPrice === 0 ? "---" : `$${totalPrice.toFixed(2)}`}
          </h5>
        </div>
      </div>
      <div className="service-area">
        <div className="row">
          <div className="col-lg-6">
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
          <div className="col-lg-6">
            <div
              className="d-flex gap-4 justify-content-center"
              style={{ marginTop: 38 }}
            >
              <div className="form-check payment-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="daycareType"
                  id="halfDay"
                  value="half"
                  checked={selectedType === "half"}
                  onChange={(e) => onChangeType(e.target.value)}
                />
                <label
                  htmlFor="halfDay"
                  style={{
                    fontSize: "1rem",
                    fontWeight: 500,
                    color: "var(--text-color2)",
                    fontFamily: "var(--font-cabin)",
                  }}
                >
                  Half Day
                </label>
              </div>
              <div className="form-check payment-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="daycareType"
                  id="fullDay"
                  value="full"
                  checked={selectedType === "full"}
                  onChange={(e) => onChangeType(e.target.value)}
                />
                <label
                  htmlFor="fullDay"
                  style={{
                    fontSize: "1rem",
                    fontWeight: 500,
                    color: "var(--text-color2)",
                    fontFamily: "var(--font-cabin)",
                  }}
                >
                  Full Day
                </label>
              </div>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-lg-6 mt-3">
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
          <div className="col-lg-6 mt-3">
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
        <div className="form-inner mt-3">
          <label>Additional Services</label>
          <Select
            className="basic-multi-select"
            options={servicesGrooming.map((service) => ({
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

export default ServiceBookingFormDaycare;
