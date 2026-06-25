import { useState, useRef, useEffect, Fragment } from "react";
import { useSelector } from "react-redux";
import Select from "react-select";
import toast from "react-hot-toast";
import { states, defaultUserAvatarPath } from "../utils/constants";
import { post, get } from "../utils/axios";
import PageLoader from "./PageLoader";

function PersonalProfile() {
  const user = useSelector((state) => state.auth.user);

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(defaultUserAvatarPath);

  const [id, setId] = useState(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber1, setPhoneNumber1] = useState("");
  const [phoneNumber2, setPhoneNumber2] = useState("");
  const [gender, setGender] = useState("male");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState(null);
  const [postCode, setPostCode] = useState("");
  const [avatarAction, setAvatarAction] = useState("keep");
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fileInputRef = useRef(null);

  useEffect(() => {
    setAvatarAction("keep");
    getProfile();
  }, []);

  const getProfile = async () => {
    setIsLoading(true);
    try {
      const res = await get(`/profile/show`);
      if (res.data.status) {
        const userProfile = res.data.result;
        setId(userProfile.id || null);
        setFirstName(userProfile.first_name || "");
        setLastName(userProfile.last_name || "");
        setPhoneNumber1(userProfile.phone_number_1 || "");
        setPhoneNumber2(userProfile.phone_number_2 || "");
        setGender(userProfile.gender);
        setAddress(userProfile.address || "");
        setCity(userProfile.city || "");
        setState(states.find((s) => s.value === userProfile.state) || null);
        setPostCode(userProfile.zip_code || "");
        if (userProfile.avatar_img_url)
          setPreviewUrl(userProfile.avatar_img_url);
      }
    } catch (err) {
      console.error("Error fetching profile details:", err);
      toast.error("Failed to fetch profile details");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];

    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file.", {
        position: "bottom-center",
      });
      return;
    }

    // Validate file size (2MB limit)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("File size must be less than 2MB.", {
        position: "bottom-center",
      });
      return;
    }

    setSelectedFile(file);
    setAvatarAction("change");

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = () => {
    setSelectedFile(null);
    setPreviewUrl(defaultUserAvatarPath);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setAvatarAction("delete");
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const changePhoneNumber1 = (e) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
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
    setPhoneNumber1(formatted);
  };

  const changePhoneNumber2 = (e) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
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
    setPhoneNumber2(formatted);
  };

  const handleSave = async () => {
    if (!firstName) {
      toast.error("First Name is required.");
      return;
    }
    if (!lastName) {
      toast.error("Last Name is required.");
      return;
    }
    if (!phoneNumber1) {
      toast.error("Phone Number 1 is required.");
      return;
    }

    const formData = new FormData();
    formData.append("first_name", firstName);
    formData.append("last_name", lastName);
    formData.append("phone_number_1", phoneNumber1);
    formData.append("gender", gender);
    formData.append("avatar_action", avatarAction);
    if (phoneNumber2) formData.append("phone_number_2", phoneNumber2);
    if (address) formData.append("address", address);
    if (city) formData.append("city", city);
    if (state) formData.append("state", state.value);
    if (postCode) formData.append("zip_code", postCode);
    if (avatarAction === "change" && selectedFile)
      formData.append("profile_avatar", selectedFile);

    setLoading(true);
    try {
      const res = await post("/profile/update", formData, true);
      if (res.data.status) {
        toast.success("Profile updated successfully!");
        setId(res.data.result.id);
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Fragment>
      {isLoading ? (
        <PageLoader />
      ) : (
        <div className="container mt-3">
          <div className="row">
            <div className="col-lg-2">
              <div className="d-flex justify-content-center align-items-end">
                {/* Profile Photo Preview */}
                <div className="profile-photo-container mb-4 position-relative d-inline-block">
                  <img
                    src={previewUrl}
                    alt="Profile Photo"
                    className="rounded-circle border border-3 border-light shadow"
                    style={{
                      width: "142px",
                      height: "142px",
                      objectFit: "cover",
                    }}
                  />

                  {/* Upload Overlay */}
                  <div
                    className="upload-overlay position-absolute top-50 start-50 translate-middle"
                    style={{
                      opacity: 0,
                      transition: "opacity 0.3s ease",
                      backgroundColor: "rgba(0, 0, 0, 0.5)",
                      borderRadius: "50%",
                      width: "142px",
                      height: "142px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                    }}
                    onClick={triggerFileInput}
                    onMouseEnter={(e) => (e.target.style.opacity = 1)}
                    onMouseLeave={(e) => (e.target.style.opacity = 0)}
                  >
                    <button
                      type="button"
                      className="btn btn-primary btn-sm rounded-circle p-2"
                    >
                      <i className="bi bi-camera"></i>
                    </button>
                  </div>
                </div>
                {/* File Input (Hidden) */}
                <input
                  type="file"
                  ref={fileInputRef}
                  className="d-none"
                  accept="image/*"
                  onChange={handleFileSelect}
                />
                {/* Remove Button */}
                {previewUrl != defaultUserAvatarPath && (
                  <button
                    type="button"
                    className="btn btn-outline-danger btn-sm"
                    style={{ marginBottom: 30 }}
                    onClick={removePhoto}
                  >
                    <i className="bi bi-trash"></i>
                  </button>
                )}
              </div>
            </div>
            <div className="col-lg-10">
              <div className="checkout-section">
                <div className="form-wrap p-1">
                  <div className="row">
                    <div className="col-lg-4">
                      <div className="form-inner">
                        <label>First Name*</label>
                        <input
                          type="text"
                          placeholder="e.g. John"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="col-lg-4">
                      <div className="form-inner">
                        <label>Last Name*</label>
                        <input
                          type="text"
                          placeholder="e.g. Doe"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="col-lg-4">
                      <div className="form-inner">
                        <label>Email</label>
                        <input
                          type="email"
                          value={user.email}
                          disabled
                          className="bg-light"
                        />
                      </div>
                    </div>
                    <div className="col-lg-6">
                      <div className="form-inner">
                        <label>Phone Number 1*</label>
                        <input
                          type="text"
                          placeholder="e.g. (123) 456-7890"
                          value={phoneNumber1}
                          onChange={changePhoneNumber1}
                        />
                      </div>
                    </div>
                    <div className="col-lg-6">
                      <div className="form-inner">
                        <label>Phone Number 2</label>
                        <input
                          type="text"
                          placeholder="e.g. (123) 456-7890"
                          value={phoneNumber2}
                          onChange={changePhoneNumber2}
                        />
                      </div>
                    </div>
                    <div className="col-12">
                      <label
                        style={{
                          fontSize: "1rem",
                          fontWeight: 500,
                          color: "var(--text-color2)",
                          fontFamily: '"Cabin"',
                          marginBottom: 10,
                        }}
                      >
                        Gender
                      </label>
                      <div>
                        <div className="form-check form-check-inline">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="gender"
                            value="male"
                            checked={gender === "male"}
                            onChange={(e) => setGender(e.target.value)}
                            id="gender_male"
                          />
                          <label
                            className="form-check-label"
                            htmlFor="gender_male"
                            style={{
                              marginBottom: 20,
                              color: "var(--text-color2)",
                              fontFamily: "Cabin",
                            }}
                          >
                            Male
                          </label>
                        </div>
                        <div className="form-check form-check-inline">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="gender"
                            value="female"
                            checked={gender === "female"}
                            onChange={(e) => setGender(e.target.value)}
                            id="gender_female"
                          />
                          <label
                            className="form-check-label"
                            htmlFor="gender_female"
                            style={{
                              marginBottom: 20,
                              color: "var(--text-color2)",
                              fontFamily: "Cabin",
                            }}
                          >
                            Female
                          </label>
                        </div>
                      </div>
                    </div>
                    <div className="col-12">
                      <div className="form-inner">
                        <label>Street Address</label>
                        <input
                          type="text"
                          placeholder="House and street name"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="col-lg-4">
                      <div className="form-inner">
                        <input
                          type="text"
                          placeholder="City"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="col-lg-4">
                      <div className="form-inner">
                        <Select
                          options={states}
                          placeholder="State"
                          value={state}
                          onChange={setState}
                          styles={{
                            control: (baseStyles, state) => ({
                              ...baseStyles,
                              borderColor: state.isFocused
                                ? "#e8e8e8"
                                : "#e9e9e9",
                              minHeight: "44px", // Reduce height here
                              height: "44px", // Reduce height here
                              fontFamily: "Cabin",
                              fontSize: "0.875rem",
                              boxShadow: "none",
                            }),
                            valueContainer: (base) => ({
                              ...base,
                              paddingTop: 2,
                              paddingBottom: 2,
                            }),
                            input: (base) => ({
                              ...base,
                              marginTop: -50,
                            }),
                            indicatorsContainer: (base) => ({
                              ...base,
                              height: "44px",
                            }),
                            singleValue: (base) => ({
                              ...base,
                              color: "#868686", // font color for selected value
                            }),
                          }}
                        />
                      </div>
                    </div>
                    <div className="col-lg-4">
                      <div className="form-inner">
                        <input
                          type="text"
                          placeholder="Post Code"
                          value={postCode}
                          onChange={(e) => setPostCode(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
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
                {loading ? "Loading..." : id ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </Fragment>
  );
}

export default PersonalProfile;
