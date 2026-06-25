import { useCallback, useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useDropzone } from "react-dropzone";
import toast from "react-hot-toast";
import axios from "axios";
import { baseURL } from "../utils/constants";
import { post } from "../utils/axios";

const ACCEPTED_FILE_TYPES = {
  "image/png": [".png"],
  "image/jpg": [".jpg"],
  "image/jpeg": [".jpeg"],
  "application/pdf": [".pdf"],
  "application/msword": [".doc"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
    ".docx",
  ],
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

function PetVaccinations({
  petId,
  vaccinations,
  vaccineStatus,
  certificates,
  onSubmitted,
}) {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [petVaccineStatus, setPetVaccineStatus] = useState(vaccineStatus);
  const [petVaccinations, setPetVaccinations] = useState(vaccinations);

  useEffect(() => {
    setUploadedFiles(
      certificates.map((cert) => ({
        id: cert.id,
        file: {
          type: cert.file_type || "document",
          name: cert.file_name || "Certificate",
          size: cert.file_size || 0,
        },
        type: cert.file_type || "document",
        progress: 100,
        status: "complete",
      }))
    );
    setPetVaccineStatus(vaccineStatus);
    setPetVaccinations(vaccinations);
  }, [petId]);

  const handleVaccinationAdd = () => {
    setPetVaccinations([
      ...petVaccinations,
      { id: "", type: "", date: null, months: "" },
    ]);
  };

  const handleVaccinationChange = (e, idx, field) => {
    const newVaccinations = [...petVaccinations];
    if (field === "date") {
      newVaccinations[idx][field] = e;
    } else {
      newVaccinations[idx][field] = e.target.value;
    }
    setPetVaccinations(newVaccinations);
  };

  const handleVaccinationRemove = (idx) => {
    const newVaccinations = petVaccinations.filter((_, i) => i !== idx);
    setPetVaccinations(newVaccinations);
  };

  const saveVaccinations = async () => {
    let data = {
      pet_profile_id: petId,
      vaccinations: petVaccinations,
    };
    try {
      const res = await post("/profile/pets/vaccinations/add", data);
      if (res.data.status) {
        toast.success("Vaccination Info submitted successfully!");
        setPetVaccineStatus("submitted");
        onSubmitted();
      }
    } catch (error) {
      console.error("Error saving vaccination info:", error);
      toast.error("Failed to save vaccination info.");
    }
  };

  const doUploadProgress = async (fileId) => {
    // upload file
    const formData = new FormData();
    formData.append(
      "file",
      uploadedFiles.find((file) => file.id === fileId).file
    );
    formData.append("pet_profile_id", petId);

    const token = window.localStorage.getItem("token");
    const url = baseURL + "/profile/pets/certificates/add";

    try {
      await axios.post(url, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadedFiles((prev) =>
            prev.map((file) =>
              file.id === fileId ? { ...file, progress: percent } : file
            )
          );
        },
      });
      setUploadedFiles((prev) =>
        prev.map((file) =>
          file.id === fileId
            ? { ...file, progress: 100, status: "complete" }
            : file
        )
      );
      toast.success("File uploaded successfully!");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to upload file. Please try again.");
    }
  };

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    // Handle rejected files
    rejectedFiles.forEach((rejectedFile) => {
      const { file, errors } = rejectedFile;
      errors.forEach((error) => {
        if (error.code === "file-too-large") {
          toast.error(`${file.name} is larger than 10MB`);
        } else if (error.code === "file-invalid-type") {
          toast.error(`${file.name} is not a supported file type`);
        }
      });
    });

    // Handle accepted files
    acceptedFiles.forEach((file) => {
      const id = Math.random().toString(36).substr(2, 9);
      const isImage = file.type.startsWith("image/");

      const newFile = {
        id,
        file,
        type: isImage ? "image" : "document",
        progress: 0,
        status: "pending",
      };

      if (isImage) {
        const url = URL.createObjectURL(file);
        newFile.url = url;
      }

      setUploadedFiles((prev) => [...prev, newFile]);
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_FILE_TYPES,
    maxSize: MAX_FILE_SIZE,
    multiple: true,
  });

  const removeFile = (id) => {
    setUploadedFiles((prev) => {
      const fileToRemove = prev.find((f) => f.id === id);
      if (fileToRemove?.url) {
        URL.revokeObjectURL(fileToRemove.url);
      }
      return prev.filter((f) => f.id !== id);
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (type) => {
    if (type.startsWith("image/")) return <i className="bi bi-image"></i>;
    if (type === "application/pdf")
      return <i className="bi bi-file-earmark-text"></i>;
    return <i className="bi bi-file-earmark"></i>;
  };

  const handleSubmit = async () => {
    // validate the list of pet vaccinations
    for (let vac of petVaccinations) {
      if (!vac.type || !vac.date) {
        toast.error("Please fill in all fields for each vaccination.");
        return;
      }
    }

    setLoading(true);

    // upload certificate files
    const pendingFiles = uploadedFiles.filter(
      (file) => file.status === "pending"
    );
    const completedFiles = uploadedFiles.filter(
      (file) => file.status === "complete"
    );

    if (completedFiles.length === 0 && pendingFiles.length === 0) {
      toast.error("Please upload the certificate files for pet vaccination.");
      setLoading(false);
      return;
    }

    pendingFiles.forEach(async (file) => {
      console.log("Starting upload for file:", file.file.name);
      setUploadedFiles((prev) =>
        prev.map((f) => (f.id === file.id ? { ...f, status: "uploading" } : f))
      );
      await doUploadProgress(file.id);
    });

    // submit the vaccinations
    await saveVaccinations();
    setLoading(false);
  };

  return (
    <div>
      <div className="row">
        <div className="col-lg-4">
          <div className="form-inner mb-0">
            <label>Vaccination Type*</label>
          </div>
        </div>
        <div className="col-lg-4">
          <div className="form-inner mb-0">
            <label>Vaccination Date*</label>
          </div>
        </div>
        <div className="col-lg-2">
          <div className="form-inner mb-0">
            <label>Months</label>
          </div>
        </div>
        {petVaccineStatus === "missing" || petVaccineStatus === "declined" ? (
          <div className="col-lg-2">
            <span
              className="text-primary pet-profile-add-vaccination-link"
              onClick={handleVaccinationAdd}
            >
              +Add New
            </span>
          </div>
        ) : (
          <div className="col-lg-2">
            <span className="text-warning fw-bolder">
              {petVaccineStatus.toUpperCase()}
            </span>
          </div>
        )}
      </div>
      {petVaccinations.map((vaccination, idx) => (
        <div className="row" key={idx}>
          <div className="col-lg-4">
            <div className="form-inner form-vaccination mb-2">
              <select
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "5px",
                }}
                value={vaccination.type}
                onChange={(e) => handleVaccinationChange(e, idx, "type")}
                disabled={
                  petVaccineStatus !== "missing" &&
                  petVaccineStatus !== "declined"
                }
              >
                <option hidden value="">
                  Choose Vaccine
                </option>
                <option value="distemper">Distemper</option>
                <option value="parvo">Parvo</option>
                <option value="leptospirosis">Leptospirosis</option>
                <option value="rabies">Rabies</option>
                <option value="bordetella">Bordetella</option>
              </select>
            </div>
          </div>
          <div className="col-lg-4">
            <div className="form-inner form-vaccination mb-2">
              <DatePicker
                selected={vaccination.date}
                onChange={(date) => handleVaccinationChange(date, idx, "date")}
                placeholderText="Choose Date"
                className="calendar"
                style={{ width: "100%" }}
                disabled={
                  petVaccineStatus !== "missing" &&
                  petVaccineStatus !== "declined"
                }
                fixedHeight
              />
            </div>
          </div>
          <div className="col-lg-2">
            <div className="form-inner form-vaccination mb-2">
              <input
                type="number"
                placeholder="e.g. 12"
                value={vaccination.months}
                onChange={(e) => handleVaccinationChange(e, idx, "months")}
                disabled={
                  petVaccineStatus !== "missing" &&
                  petVaccineStatus !== "declined"
                }
              />
            </div>
          </div>
          <div className="col-lg-2">
            {(petVaccineStatus === "missing" ||
              petVaccineStatus === "declined") && (
              <button
                type="button"
                className="btn btn-outline-danger btn-sm ms-2"
                style={{ border: "none" }}
                onClick={() => handleVaccinationRemove(idx)}
              >
                <i className="bi bi-x" style={{ fontSize: "1.1rem" }}></i>
              </button>
            )}
          </div>
        </div>
      ))}
      <div className="form-inner">
        <label>Health Certificate</label>
        <div className="container-fluid">
          <div className="row justify-content-center">
            <div className="col-12 col-lg-8">
              {/* Upload Zone */}

              {(petVaccineStatus === "missing" ||
                petVaccineStatus === "declined") && (
                <div className="card shadow-sm mb-4">
                  <div
                    {...getRootProps()}
                    className={`card-body p-4 border-2 border-dashed rounded cursor-pointer transition-all ${
                      isDragActive
                        ? "border-primary bg-primary bg-opacity-10"
                        : "border-secondary"
                    }`}
                    style={{ minHeight: "100px", cursor: "pointer" }}
                  >
                    <input {...getInputProps()} />

                    <div className="d-flex flex-column align-items-center justify-content-center text-center h-100">
                      <div>
                        <p className="text-muted mb-2">
                          Drag & drop files here, or{" "}
                          <span className="text-primary fw-bold text-decoration-underline">
                            click to browse
                          </span>
                        </p>
                        <small className="text-muted">
                          Supports: PDF, DOC, DOCX, PNG, JPG, JPEG (max 10MB
                          each)
                        </small>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {/* File List */}
              {uploadedFiles.length > 0 && (
                <div style={{ fontFamily: "Cabin" }}>
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h3 className="h5 mb-0">Files ({uploadedFiles.length})</h3>
                  </div>

                  <div className="list-group">
                    {uploadedFiles.map((uploadedFile) => (
                      <div key={uploadedFile.id} className="list-group-item">
                        <div className="d-flex align-items-center justify-content-between">
                          <div className="d-flex align-items-center gap-3 flex-grow-1 min-w-0">
                            {/* File Icon */}
                            <div className="text-secondary">
                              {getFileIcon(uploadedFile.file.type)}
                            </div>

                            {/* File Info */}
                            <div
                              className="flex-grow-1 min-w-0"
                              style={{ fontSize: "14px" }}
                            >
                              <div
                                className="fw-medium text-truncate"
                                title={uploadedFile.file.name}
                              >
                                {uploadedFile.file.name}
                              </div>
                              <div
                                className="small text-muted d-flex gap-2"
                                style={{ fontSize: "12px" }}
                              >
                                <span>
                                  {formatFileSize(uploadedFile.file.size)}
                                </span>
                                <span>•</span>
                                <span className="text-uppercase">
                                  {uploadedFile.file.type
                                    .split("/")[1]
                                    .includes("document")
                                    ? "docx"
                                    : uploadedFile.file.type.split("/")[1] ||
                                      "file"}
                                </span>
                              </div>

                              {/* Progress Bar */}
                              {uploadedFile.status === "uploading" && (
                                <div className="mt-2">
                                  <div className="d-flex justify-content-between align-items-center mb-1">
                                    <small className="text-muted">
                                      Uploading...
                                    </small>
                                    <small className="text-muted">
                                      {uploadedFile.progress}%
                                    </small>
                                  </div>
                                  <div
                                    className="progress"
                                    style={{ height: "4px" }}
                                  >
                                    <div
                                      className="progress-bar bg-primary"
                                      role="progressbar"
                                      style={{
                                        width: `${uploadedFile.progress}%`,
                                      }}
                                      aria-valuenow={uploadedFile.progress}
                                      aria-valuemin={0}
                                      aria-valuemax={100}
                                    />
                                  </div>
                                </div>
                              )}

                              {uploadedFile.status === "complete" && (
                                <div className="mt-1">
                                  <small className="text-success">
                                    ✓ Upload complete
                                  </small>
                                </div>
                              )}

                              {uploadedFile.status === "pending" && (
                                <div className="mt-1">
                                  <small className="text-muted">
                                    Ready to upload
                                  </small>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Remove Button */}
                          {(petVaccineStatus === "missing" ||
                            petVaccineStatus === "declined") && (
                            <button
                              type="button"
                              className="btn btn-outline-danger btn-sm ms-2"
                              onClick={() => removeFile(uploadedFile.id)}
                              style={{ border: "none" }}
                            >
                              <i className="bi bi-x"></i>
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {(petVaccineStatus === "missing" || petVaccineStatus === "declined") && (
        <div className="d-flex justify-content-end align-items-center gap-3">
          <div className="reservation-btn">
            <button
              className="primary-btn1 form-btn"
              style={{ padding: "8px 36px" }}
              onClick={handleSubmit}
              disabled={loading || petVaccinations.length === 0}
            >
              {loading && (
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                  style={{ marginBottom: 2 }}
                ></span>
              )}
              {loading ? "Loading..." : "Submit"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default PetVaccinations;
