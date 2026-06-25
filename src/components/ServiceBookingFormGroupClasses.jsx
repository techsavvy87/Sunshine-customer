import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Select from "react-select";

const ServiceBookingFormGroupClasses = (props) => {
  const { name, pets, groupClasses = [] } = props;
  const navigate = useNavigate();

  const [selectedPet, setSelectedPet] = useState("");
  const [selectedClassOptions, setSelectedClassOptions] = useState([]);
  const [options, setOptions] = useState([]);
  const [selectedClassIds, setSelectedClassIds] = useState([]);
  const [totalPrice, setTotalPrice] = useState("---");

  useEffect(() => {
    const opts = groupClasses.map((c) => ({
      value: c.id,
      label: `${c.name} • ${c.duration || "-"} • ${c.schedule || "-"}`,
      data: c,
    }));
    setOptions(opts);
  }, [groupClasses]);

  useEffect(() => {
    const ids = selectedClassOptions.map((o) => o.value);
    setSelectedClassIds(ids);

    const sum = selectedClassOptions.reduce(
      (acc, o) => acc + parseFloat(o.data?.price || 0),
      0
    );
    setTotalPrice(sum > 0 ? `$${sum.toFixed(2)}` : "---");
  }, [selectedClassOptions]);

  const confirmBooking = async () => {
    if (!selectedPet) {
      toast.error("Please select a pet.");
      return;
    }
    if (selectedClassOptions.length === 0) {
      toast.error("Please select at least one group class.");
      return;
    }

    navigate("/checkout/class", {
      state: {
        class_ids: selectedClassIds,
        pet_id: selectedPet,
      },
    });
  };

  const formatCurrency = (val) => {
    const n = parseFloat(val || 0);
    if (Number.isNaN(n)) return "$0.00";
    return `$${n.toFixed(2)}`;
  };

  const formatStartDate = (dateStr) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    return d.toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="services-datails-content py-4">
      <div className="banner-title pt-2 d-flex align-items-center justify-content-between">
        <h2>{name || "Group Classes"}</h2>
        <div className="currency">
          <h5 className="mb-0">{totalPrice}</h5>
        </div>
      </div>
      <div className="service-area">
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

        <div className="form-inner mt-3">
          <label>Select Group Classes</label>
          <Select
            className="basic-multi-select"
            isMulti
            options={options}
            value={selectedClassOptions}
            onChange={(vals) => setSelectedClassOptions(vals || [])}
            placeholder="Choose one or more classes"
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

        {selectedClassOptions.length > 0 && (
          <div className="mt-3">
            {selectedClassOptions.map((opt) => {
              const cls = opt.data || {};
              return (
                <div
                  key={`detail-${opt.value}`}
                  className="px-3 py-2 border rounded mb-3"
                >
                  <h6 className="mb-2 text-dark">{cls.name}</h6>
                  <div className="d-flex align-items-center gap-4">
                    <span>
                      <strong>Price:</strong> {formatCurrency(cls.price)}
                    </span>
                    <span>
                      <strong>Duration:</strong>{" "}
                      {`${cls.duration_amount} ${cls.duration_unit}`}
                    </span>
                  </div>
                  <div className="d-flex align-items-center gap-4 mt-1">
                    <span>
                      <strong>Schedule:</strong> {cls.schedule || "-"}
                    </span>
                    <span>
                      <strong>Start Date:</strong>{" "}
                      {formatStartDate(cls.started_at || cls.start_date)}
                    </span>
                  </div>
                  {cls.description && (
                    <span className="mb-0 mt-1">
                      <strong>Description:</strong> {cls.description}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="shop-quantity d-flex flex-wrap align-items-center justify-content-start mb-20 pt-3">
          <button
            className="primary-btn2 px-4 pt-2 pb-1"
            onClick={confirmBooking}
          >
            Book
          </button>
        </div>
      </div>
    </div>
  );
};

export default ServiceBookingFormGroupClasses;
