import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { post } from "../utils/axios";
import toast from "react-hot-toast";
import Select from "react-select";

const ServiceBookingFormPrivateTraining = (props) => {
  const {
    name,
    priceHalf,
    priceOne,
    priceTravel,
    pets,
    timeSlots,
    serviceId,
    servicesGrooming,
  } = props;

  const [selectedPet, setSelectedPet] = useState("");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("");
  const [selectedType, setSelectedType] = useState("half");
  const [bookingDate, setBookingDate] = useState(new Date());
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slots, setSlots] = useState(timeSlots);
  const [loading, setLoading] = useState(false);
  const [totalPrice, setTotalPrice] = useState(0);
  const [selectedLocation, setSelectedLocation] = useState("onsite");
  const [selectedServicesGrooming, setSelectedServicesGrooming] = useState([]);
  const [address, setAddress] = useState("");
  const [customerGoals, setCustomerGoals] = useState("");

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
    const date = dateObj instanceof Date ? dateObj : new Date(dateObj);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
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
        private_training_type: _type,
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

  const onChangePet = (petId) => {
    setSelectedPet(petId);
    // change the total price with the additional services based on the pet size
    const newTotalPrice = calculateTotalPrice(
      petId,
      selectedType,
      selectedLocation,
      selectedServicesGrooming
    );
    setTotalPrice(newTotalPrice);

    fetchAvailableSlots(bookingDate, selectedType);
  };

  const onChangeType = async (type) => {
    setSelectedType(type);
    const newTotalPrice = calculateTotalPrice(
      selectedPet,
      type,
      selectedLocation,
      selectedServicesGrooming
    );
    setTotalPrice(newTotalPrice);

    fetchAvailableSlots(bookingDate, type);
  };

  const onChangeDate = async (date) => {
    setBookingDate(date);

    fetchAvailableSlots(date, selectedType);
  };

  const onChangeLocation = (location) => {
    setSelectedLocation(location);
    // change the total price with the additional services based on the pet size
    const newTotalPrice = calculateTotalPrice(
      selectedPet,
      selectedType,
      location,
      selectedServicesGrooming
    );
    setTotalPrice(newTotalPrice);
  };

  const onChangeServicesGrooming = (selectedOptions) => {
    setSelectedServicesGrooming(selectedOptions);

    // change the total price with the additional services based on the pet size
    const newTotalPrice = calculateTotalPrice(
      selectedPet,
      selectedType,
      selectedLocation,
      selectedOptions
    );
    setTotalPrice(newTotalPrice);
  };

  const calculateTotalPrice = (_petId, _type, _location, _selectedServices) => {
    const chosedPet = pets.find((pet) => pet.id == _petId);
    if (!chosedPet) return 0;
    const chosedPetSize = chosedPet.size;

    let additionalServicesTotal = 0;
    _selectedServices.forEach((option) => {
      const service = servicesGrooming.find((svc) => svc.id === option.value);
      if (service) {
        if (chosedPetSize === "small") {
          additionalServicesTotal += parseFloat(
            service.price_small || service.price
          );
        } else if (chosedPetSize === "medium") {
          additionalServicesTotal += parseFloat(
            service.price_medium || service.price
          );
        } else if (chosedPetSize === "large") {
          additionalServicesTotal += parseFloat(
            service.price_large || service.price
          );
        } else if (chosedPetSize === "xlarge") {
          additionalServicesTotal += parseFloat(
            service.price_xlarge || service.price
          );
        }
      }
    });
    let basePrice = parseFloat(_type === "half" ? priceHalf : priceOne);
    if (_location === "offsite") {
      basePrice += parseFloat(priceTravel);
    }
    return basePrice + additionalServicesTotal;
  };

  const confirmBooking = async () => {
    if (!selectedPet || !selectedTimeSlot || !customerGoals) {
      toast.error("Please fill all required fields.");
      return;
    }

    let data = {
      pet_id: selectedPet,
      timeslot_id: selectedTimeSlot,
      date: formatDate(bookingDate),
      service_id: serviceId,
      location: selectedLocation,
      additional_service_ids: selectedServicesGrooming.map(
        (option) => option.value
      ),
      customer_goals: customerGoals,
      address: address,
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
    setTotalPrice(0);
    setSelectedType("half");
    setSelectedLocation("onsite");
    setSelectedServicesGrooming([]);
    setAddress("");
    setCustomerGoals("");
  };

  return (
    <div className="services-datails-content py-4">
      <div
        className="banner-title pt-2 d-flex align-items-center justify-content-between"
        style={{ marginBottom: "2px" }}
      >
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
              <label>Your Pet*</label>
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
            <div className="d-flex gap-4" style={{ marginTop: 38 }}>
              <div className="form-check payment-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="trainingType"
                  id="halfHour"
                  value="half"
                  checked={selectedType === "half"}
                  onChange={(e) => onChangeType(e.target.value)}
                />
                <label
                  htmlFor="halfHour"
                  style={{
                    fontSize: "1rem",
                    fontWeight: 500,
                    color: "var(--text-color2)",
                    fontFamily: "var(--font-cabin)",
                  }}
                >
                  Half Hour
                </label>
              </div>
              <div className="form-check payment-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="trainingType"
                  id="oneHour"
                  value="one"
                  checked={selectedType === "one"}
                  onChange={(e) => onChangeType(e.target.value)}
                />
                <label
                  htmlFor="oneHour"
                  style={{
                    fontSize: "1rem",
                    fontWeight: 500,
                    color: "var(--text-color2)",
                    fontFamily: "var(--font-cabin)",
                  }}
                >
                  One Hour
                </label>
              </div>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-lg-6 mt-3">
            <div className="form-inner date">
              <label>Date*</label>
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
              <label>Time Slot*</label>
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
        <div className="d-flex gap-4 mt-4">
          <div className="form-check payment-check">
            <input
              className="form-check-input"
              type="radio"
              name="location"
              id="onsite"
              value="onsite"
              checked={selectedLocation === "onsite"}
              onChange={(e) => onChangeLocation(e.target.value)}
            />
            <label
              htmlFor="onsite"
              style={{
                fontSize: "1rem",
                fontWeight: 500,
                color: "var(--text-color2)",
                fontFamily: "var(--font-cabin)",
              }}
            >
              Onsite
            </label>
          </div>
          <div className="form-check payment-check">
            <input
              className="form-check-input"
              type="radio"
              name="location"
              id="offsite"
              value="offsite"
              checked={selectedLocation === "offsite"}
              onChange={(e) => onChangeLocation(e.target.value)}
            />
            <label
              htmlFor="offsite"
              style={{
                fontSize: "1rem",
                fontWeight: 500,
                color: "var(--text-color2)",
                fontFamily: "var(--font-cabin)",
              }}
            >
              Offsite
            </label>
          </div>
        </div>
        {selectedLocation === "onsite" && (
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
          </div>
        )}
        {selectedLocation === "offsite" && (
          <div className="form-inner mt-3">
            <label>Location/Address</label>
            <input
              type="text"
              placeholder="Enter the address for offsite training"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>
        )}
        <div className="form-inner mt-3">
          <label>Customer Goals/Owner Needs*</label>
          <br />
          <textarea
            placeholder="Enter your goals or needs for the training"
            value={customerGoals}
            onChange={(e) => setCustomerGoals(e.target.value)}
            style={{
              width: "100%",
              padding: "8px 14px",
              borderRadius: "5px",
              fontFamily: "Cabin",
              fontSize: "14px",
              border: "1px solid #e8e8e8",
              minHeight: "80px",
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

export default ServiceBookingFormPrivateTraining;
