import { useState, useRef, useEffect, Fragment } from "react";
import { Link } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import toast from "react-hot-toast";
import { get, post } from "../utils/axios";
import { defaultPetImagePath } from "../utils/constants";
import ConfirmModal from "./ConfirmModal";
import PetVaccinations from "./PetVaccinations";
import AsyncSelector from "./AsyncSelector";

function PetProfiles() {
  const fileInputRef = useRef(null);

  const [pets, setPets] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(defaultPetImagePath);
  const [petName, setPetName] = useState("");
  const [sex, setSex] = useState("male");
  const [spayNeuter, setSpayNeuter] = useState("");
  const [birthDate, setBirthDate] = useState(null);
  const [age, setAge] = useState("");
  const [breed, setBreed] = useState("");
  const [size, setSize] = useState("");
  const [weight, setWeight] = useState("");
  const [color, setColor] = useState("");
  const [coatType, setCoatType] = useState("");
  const [veterinarianName, setVeterinarianName] = useState("");
  const [veterinarianPhone, setVeterinarianPhone] = useState("");
  const [vaccinations, setVaccinations] = useState([]);
  const [vaccineStatus, setVaccineStatus] = useState("missing");
  const [notes, setNotes] = useState("");
  const [certificates, setCertificates] = useState([]);
  const [id, setId] = useState(null);
  const [petImgAction, setPetImgAction] = useState("keep");
  const [weightRanges, setWeightRanges] = useState([]);

  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [openConfirmModal, setOpenConfirmModal] = useState(false);

  useEffect(() => {
    getPets();
    setPetImgAction("keep");
  }, []);

  const getPets = async () => {
    try {
      const res = await get("/profile/pets/list");
      if (res.data.status) {
        const petsList = res.data.result.pets;
        setPets(
          petsList.map((pet) => ({
            ...pet,
            birthdate: pet.birthdate || null,
            age: pet.age || "",
            pet_img_url: pet.pet_img_url || defaultPetImagePath,
          }))
        );
        setWeightRanges(res.data.result.weight_ranges || []);
      }
    } catch (error) {
      console.error("Error fetching pets:", error);
      toast.error("Failed to fetch pets.");
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
    setPetImgAction("change");

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = () => {
    setSelectedFile(null);
    setPreviewUrl(defaultPetImagePath);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setPetImgAction("delete");
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const changeVeterinarianPhone = (e) => {
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
    setVeterinarianPhone(formatted);
  };

  const changeWeight = (e) => {
    const val = e.target.value;
    // Allow only decimal numbers
    if (/^\d*\.?\d*$/.test(val) || val === "") {
      setWeight(val);
    }
  };

  // When the weight input loses focus, validate and (optionally) auto-select a size
  const handleWeightBlur = () => {
    if (weight === "" || weight == null) {
      setSize("");
      return;
    }
    const weightNum = parseFloat(weight);
    for (const range of weightRanges) {
      const min = parseFloat(range.min_weight) ?? null;
      const max = parseFloat(range.max_weight) ?? null;
      if (min != null && max != null) {
        if (weightNum > min && weightNum <= max) {
          setSize(range.id);
          break;
        }
      }
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const isoDate = date.toISOString().split("T")[0]; // Format as YYYY-MM-DD
    return isoDate;
  };

  const choosePet = (pet) => {
    setId(pet.id);
    setSelectedFile(null);
    setPreviewUrl(pet.pet_img_url);
    setPetName(pet.name);
    setBirthDate(pet.birthdate);
    setAge(pet.age);
    setSpayNeuter(pet.spay_neuter);
    setBreed({ value: pet.breed_id, label: pet.breed.name });
    setWeight(pet.weight);
    setSize(pet.sizeId);
    setColor({ value: pet.color_id, label: pet.color.name });
    setCoatType({ value: pet.coat_type_id, label: pet.coat_type.name });
    setVeterinarianName(pet.veterinarian_name);
    setVeterinarianPhone(pet.veterinarian_phone);
    setVaccinations(pet.vaccinations || []);
    setVaccineStatus(pet.vaccine_status);
    setNotes(pet.notes);
    setCertificates(pet.certificates);
    setPetImgAction("keep");
  };

  const addNewPet = () => {
    setId(null);
    setSelectedFile(null);
    setPreviewUrl(defaultPetImagePath);
    setPetName("");
    setBirthDate(null);
    setAge("");
    setBreed(null);
    setWeight("");
    setSize("");
    setColor(null);
    setCoatType(null);
    setVeterinarianName("");
    setVeterinarianPhone("");
    setVaccinations([]);
    setVaccineStatus("missing");
    setNotes("");
    setCertificates([]);
    setSpayNeuter("");
  };

  const handleSubmit = async () => {
    if (!petName) {
      toast.error("Pet name is required.");
      return;
    }
    if (!birthDate && !age) {
      toast.error("Birth date or age is required.");
      return;
    }
    if (!breed) {
      toast.error("Breed is required.");
      return;
    }
    if (!weight) {
      toast.error("Weight is required.");
      return;
    }
    if (!color) {
      toast.error("Color is required.");
      return;
    }
    if (!coatType) {
      toast.error("Color is required.");
      return;
    }
    if (!veterinarianName) {
      toast.error("Veterinarian Name/Facility is required.");
      return;
    }
    if (!veterinarianPhone) {
      toast.error("Veterinarian Phone is required.");
      return;
    }

    setLoading(true);
    try {
      // Prepare form data
      const formData = new FormData();
      formData.append("id", id);
      formData.append("name", petName);
      if (birthDate) formData.append("birthdate", formatDate(birthDate));
      if (age) formData.append("age", age);
      formData.append("breed", breed.value);
      formData.append("color", color.value);
      formData.append("coat_type", coatType.value);
      formData.append("weight", weight);
      formData.append("size", size);
      formData.append("veterinarian_name", veterinarianName);
      formData.append("veterinarian_phone", veterinarianPhone);
      formData.append('spay_neuter', spayNeuter ? spayNeuter : "");
      if (notes) formData.append("notes", notes);
      formData.append("pet_img_action", petImgAction);
      if (petImgAction === "change" && selectedFile) {
        formData.append("pet_img", selectedFile);
      }

      const url = id ? `/profile/pets/update` : "/profile/pets/add";

      // Submit form data
      const res = await post(url, formData, true);
      if (res.data.status) {
        toast.success(
          id ? "Pet updated successfully." : "Pet added successfully."
        );
        getPets();
        setId(res.data.result);
        setPetImgAction("keep");
      }
    } catch (error) {
      console.error("Error saving pet:", error);
      toast.error("Failed to save pet.");
    } finally {
      setLoading(false);
    }
  };

  const confirmDeletePetProfile = async () => {
    if (!id) return;

    setDeleteLoading(true);
    const data = {
      id,
    };
    try {
      const res = await post("/profile/pets/delete", data);
      if (res.data.status) {
        toast.success("Pet deleted successfully.");
        getPets();
        addNewPet();
      }
    } catch (error) {
      console.error("Error deleting pet:", error);
      toast.error("Failed to delete pet.");
    } finally {
      setDeleteLoading(false);
    }
  };

  const onVaccineInfoSubmitted = () => {
    getPets();
  };

  const calculateAge = (birthDate) => {
    if (!birthDate) return "";
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age >= 0 ? age.toString() : "";
  };

  return (
    <div className="container mt-2">
      <div className="profile-section">
        <div className="row">
          {pets.map((pet) => (
            <div className="col-lg-3" key={pet.id}>
              <div className="dog-profile-card" onClick={() => choosePet(pet)}>
                <img
                  src={pet.pet_img_url}
                  alt="Pet"
                  width="50"
                  height="50"
                  style={{ borderRadius: "50%" }}
                />
                <p className="mt-2 mb-0">{pet.name}</p>
              </div>
            </div>
          ))}
          <div className="col-lg-3">
            <div className="dog-profile-card" onClick={addNewPet}>
              <img src="/assets/images/add-dog-icon.svg" alt="Pet" width="50" />
              <p className="mt-2 mb-0">Add New Pet</p>
            </div>
          </div>
        </div>
        <div className="row mt-5">
          <div className="col-lg-12">
            <h3 className="profile-title">Profile Information</h3>
          </div>
        </div>
        <div className="row mt-4">
          <div className="col-lg-2">
            <div className="d-flex justify-content-center align-items-end">
              {/* Profile Photo Preview */}
              <div className="profile-photo-container mb-4 position-relative d-inline-block">
                <img
                  src={previewUrl}
                  alt="Profile Photo"
                  className="rounded-circle border border-3 border-light shadow"
                  style={{
                    width: "100px",
                    height: "100px",
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
                    width: "100px",
                    height: "100px",
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
              {previewUrl != defaultPetImagePath && (
                <button
                  type="button"
                  className="btn btn-outline-danger btn-sm"
                  style={{ marginBottom: 26 }}
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
                  <div className="col-lg-7">
                    <div className="row">
                      <div className="col-lg-4">
                        <div className="form-inner">
                          <label>Pet Name*</label>
                          <input
                            type="text"
                            placeholder="e.g. John"
                            value={petName}
                            onChange={(e) => setPetName(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="col-lg-4">
                        <div className="form-inner">
                          <label>Sex*</label>
                          <select
                            value={sex}
                            onChange={(e) => setSex(e.target.value)}
                          >
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                          </select>
                        </div>
                      </div>
                      <div className="col-lg-4">
                        <div className="form-inner">
                          <label>Spay/Neuter</label>
                          <select
                            value={spayNeuter || ""}
                            onChange={(e) => setSpayNeuter(e.target.value || "")}
                          >
                            <option value="">--Optional--</option>
                            <option value="spayed">Spayed</option>
                            <option value="neutered">Neutered</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-5">
                    <div className="form-inner date">
                      <label>Date of Birth / Age*</label>
                      <div className="d-flex align-items-center gap-2">
                        <DatePicker
                          selected={birthDate}
                          onChange={(date) => {
                            setBirthDate(date);
                            setAge(calculateAge(date));
                          }}
                          placeholderText="BirthDate"
                          className="calendar"
                          fixedHeight
                        />
                        <span style={{ fontSize: "1.4rem", fontWeight: "500" }}>
                          /
                        </span>
                        <div className="input-group">
                          <input
                            type="text"
                            placeholder="e.g. 2"
                            value={age}
                            onChange={(e) => setAge(e.target.value)}
                            style={{ width: "80%", flex: "1" }}
                          />
                          <span
                            className="input-group-text"
                            style={{
                              border: "1px solid #e1e5e9",
                              backgroundColor: "#f4f4f4",
                            }}
                          >
                            Years
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-4">
                    <div className="form-inner">
                      <label>Breed*</label>
                      <AsyncSelector
                        apiUrl="/profile/pets/breeds"
                        placeholder="Choose a breed"
                        selection={breed}
                        onSelect={(val) => {
                          console.log(val);
                          setBreed(val);
                        }}
                      />
                    </div>
                  </div>
                  <div className="col-lg-4">
                    <div className="form-inner">
                      <label>Color*</label>
                      <AsyncSelector
                        apiUrl="/profile/pets/colors"
                        placeholder="Choose a color"
                        selection={color}
                        onSelect={setColor}
                      />
                    </div>
                  </div>
                  <div className="col-lg-4">
                    <div className="form-inner">
                      <label>Coat Type</label>
                      <AsyncSelector
                        apiUrl="/profile/pets/coatTypes"
                        placeholder="Choose a coat type"
                        selection={coatType}
                        onSelect={setCoatType}
                      />
                    </div>
                  </div>
                  <div className="col-lg-2">
                    <div className="form-inner">
                      <label>Weight*</label>
                      <div className="input-group">
                        <input
                          type="text"
                          placeholder="e.g. 30"
                          value={weight}
                          onChange={changeWeight}
                          onBlur={handleWeightBlur}
                          style={{ width: "80%", flex: "1" }}
                        />
                        <span
                          className="input-group-text"
                          style={{
                            border: "1px solid #e1e5e9",
                            backgroundColor: "#f4f4f4",
                          }}
                        >
                          lbs
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-2">
                    <div className="form-inner">
                      <label>Size*</label>
                      <select
                        value={size}
                        onChange={(e) => setSize(e.target.value)}
                      >
                        <option value="" hidden>
                          Select Size
                        </option>
                        {weightRanges.map((range) => (
                          <option key={range.id} value={range.id}>
                            {range.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="col-lg-4">
                    <div className="form-inner">
                      <label>Veterinarian Name / Facility*</label>
                      <input
                        type="text"
                        placeholder="e.g. Animal Clinic"
                        value={veterinarianName}
                        onChange={(e) => setVeterinarianName(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="col-lg-4">
                    <div className="form-inner">
                      <label>Veterinarian Phone*</label>
                      <input
                        type="text"
                        placeholder="e.g. (123) 456-7890"
                        value={veterinarianPhone}
                        onChange={changeVeterinarianPhone}
                      />
                    </div>
                  </div>
                  <div className="col-lg-12">
                    <div className="form-inner">
                      <label>Notes</label>
                      <textarea
                        placeholder="Please list any behavioral issues, medical concerns, or special instructions for your pet:"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        style={{ height: "100px" }}
                      />
                    </div>
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col-lg-2">
                    {id && (
                      <div className="reservation-btn">
                        <Link
                          className="primary-btn1 form-btn"
                          style={{ padding: "8px 30px" }}
                          to={`/questionnaire/${id}`}
                        >
                          Questionnaire
                        </Link>
                      </div>
                    )}
                  </div>
                  <div className="offset-lg-6 col-lg-4">
                    <div className="d-flex justify-content-end align-items-center mt-1 gap-3">
                      {id && (
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          style={{
                            padding: "7px 30px",
                            borderRadius: "40px",
                            fontSize: "1.125rem",
                            fontWeight: 700,
                            fontFamily: "var(--font-dosis)",
                          }}
                          onClick={() => setOpenConfirmModal(true)}
                        >
                          {deleteLoading && (
                            <span
                              className="spinner-border spinner-border-sm me-2"
                              role="status"
                              aria-hidden="true"
                              style={{ marginBottom: 2 }}
                            ></span>
                          )}
                          {deleteLoading ? "Deleting..." : "Delete"}
                        </button>
                      )}
                      <div className="reservation-btn">
                        <button
                          className="primary-btn1 form-btn"
                          style={{ padding: "8px 32px" }}
                          onClick={handleSubmit}
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
                </div>
                {id && (
                  <Fragment>
                    <hr className="my-5" />
                    <PetVaccinations
                      petId={id}
                      vaccinations={vaccinations}
                      vaccineStatus={vaccineStatus}
                      certificates={certificates}
                      onSubmitted={onVaccineInfoSubmitted}
                    />
                  </Fragment>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <ConfirmModal
        open={openConfirmModal}
        onClose={() => setOpenConfirmModal(false)}
        onConfirm={confirmDeletePetProfile}
        title="Confirm Pet Removal"
        message="Are you sure you want to remove this pet from the profile?"
        type="warning"
      />
    </div>
  );
}

export default PetProfiles;
