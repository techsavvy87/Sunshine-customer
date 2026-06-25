import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { get, post } from "../utils/axios";

function AdditionalOwners() {
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isExistingOwner, setIsExistingOwner] = useState(false);

  const addOwner = () => {
    setOwners([...owners, { id: "", name: "", phone: "" }]);
  };

  useEffect(() => {
    getAdditionalOwners();
    setOwners([{ id: "", name: "", phone: "" }]);
  }, []);

  const getAdditionalOwners = async () => {
    try {
      const res = await get("/profile/owners/list");
      if (res.data.status) {
        const ownersList = res.data.result;
        if (ownersList.length === 0) {
          setIsExistingOwner(false);
          setOwners([{ id: "", name: "", phone: "" }]);
        } else {
          setIsExistingOwner(true);
          setOwners(
            ownersList.map((owner) => ({
              id: owner.id,
              name: owner.full_name,
              phone: owner.phone_number,
            }))
          );
        }
      }
    } catch (error) {
      console.error("Error fetching additional owners:", error);
      toast.error("Failed to fetch additional owners.");
    }
  };

  const changeFullName = (idx, value) => {
    const newOwners = [...owners];
    newOwners[idx].name = value;
    setOwners(newOwners);
  };

  const changePhoneNumber = (idx, value) => {
    const digits = value.replace(/\D/g, "").slice(0, 10);
    let formatted = digits;
    if (digits.length > 0) {
      formatted = "(" + digits.slice(0, 3);
      if (digits.length > 3) {
        formatted += ") " + digits.slice(3, 6);
      }
      if (digits.length > 6) {
        formatted += "-" + digits.slice(6, 10);
      }
    }

    const newOwners = [...owners];
    newOwners[idx].phone = formatted;
    setOwners(newOwners);
  };

  const handleSave = async () => {
    // validate the list of additional owners
    if (!isExistingOwner && owners.length === 0) {
      toast.error("Please add at least one additional owner.");
      return;
    }

    for (let owner of owners) {
      if (!owner.name || !owner.phone) {
        toast.error("Please fill in all fields for each owner.");
        return;
      }
    }

    setLoading(true);
    let data = {
      owners,
    };
    try {
      const res = await post("/profile/owners/update", JSON.stringify(data));
      if (res.data.status) {
        toast.success("Additional owners saved successfully!");
      }
      if (owners.length === 0) {
        setIsExistingOwner(false);
        setOwners([{ id: "", name: "", phone: "" }]);
      }
    } catch (error) {
      console.error("Error saving additional owners:", error);
      toast.error("Failed to save additional owners.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-3">
      <div className="d-flex justify-content-center">
        <div>
          <p className="text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="46"
              height="46"
              fill="currentColor"
              className="bi bi-person-fill-add"
              viewBox="0 0 16 16"
            >
              <path d="M12.5 16a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7m.5-5v1h1a.5.5 0 0 1 0 1h-1v1a.5.5 0 0 1-1 0v-1h-1a.5.5 0 0 1 0-1h1v-1a.5.5 0 0 1 1 0m-2-6a3 3 0 1 1-6 0 3 3 0 0 1 6 0" />
              <path d="M2 13c0 1 1 1 1 1h5.256A4.5 4.5 0 0 1 8 12.5a4.5 4.5 0 0 1 1.544-3.393Q8.844 9.002 8 9c-5 0-6 3-6 4" />
            </svg>
          </p>
          <p
            className="primary-label"
            style={{ cursor: "pointer", fontSize: "17px" }}
            onClick={addOwner}
          >
            <i className="bi bi-plus"></i>
            Add Additional Owner
          </p>
        </div>
      </div>
      <div className="checkout-section">
        <div className="form-wrap p-1">
          {owners.map((owner, idx) => (
            <div className="row" key={idx}>
              <div className="col-lg-4 offset-lg-2">
                <div className="form-inner">
                  <label>Full Name*</label>
                  <input
                    type="text"
                    placeholder="e.g. John Doe"
                    value={owner.name}
                    onChange={(e) => changeFullName(idx, e.target.value)}
                  />
                </div>
              </div>
              <div className="col-lg-4">
                <div className="form-inner">
                  <label>Phone Number*</label>
                  <input
                    type="text"
                    placeholder="e.g. (123) 456-7890"
                    value={owner.phone}
                    onChange={(e) => changePhoneNumber(idx, e.target.value)}
                  />
                </div>
              </div>
              <div className="col-lg-1 d-flex align-items-center justify-content-center">
                <button
                  type="button"
                  className="btn btn-outline-danger btn-sm additional-owner-remove-btn"
                  style={{ marginBottom: 30, border: "none" }}
                  onClick={() => {
                    const newOwners = owners.filter((_, i) => i !== idx);
                    setOwners(newOwners);
                  }}
                >
                  <i className="bi bi-trash"></i>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="row">
        <div className="col-lg-8 offset-lg-2">
          <div className="d-flex justify-content-end align-items-center mt-3">
            <div className="reservation-btn">
              <button
                className="primary-btn1 form-btn"
                style={{ padding: "8px 36px" }}
                onClick={handleSave}
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
                {loading ? "Loading..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdditionalOwners;
