import { useState, useEffect, Fragment } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Breadcrumb from "../components/Breadcrumb";
import PageLoader from "../components/PageLoader";
import { get } from "../utils/axios";

const CHECKIN_FIELD_GROUPS = [
  { label: "Trip Information", keys: ["trip_information", "tripInfo", "trip_info"] },
  { label: "Pet Information", keys: ["pet_information", "petInfo", "pet_info"] },
  {
    label: "Feeding and Medication Information",
    keys: [
      "feeding_medication_information",
      "feedingMedicationInformation",
      "feeding_medication_info",
    ],
  },
  {
    label: "Assignment / Location for Visit",
    keys: ["assignment_location", "location", "assigned_room_kennel", "room_kennel"],
  },
  { label: "Assign Staff", keys: ["assigned_staff", "staff_name"] },
  { label: "Estimated Price including tax", keys: ["estimated_price"], currency: true },
  { label: "Date", keys: ["date"] },
  { label: "Start Time", keys: ["start_time"] },
  { label: "Pickup Date", keys: ["pickup_date", "pickupDate"] },
  { label: "Pickup Time", keys: ["pickup_time", "pickupTime"] },
  { label: "Boarding Agreement", keys: ["boarding_agreement"], boolean: true },
  { label: "Signature", keys: ["signature_text", "signature", "signature_name"] },
  { label: "Notes", keys: ["notes"] },
];

const getCheckinValue = (checkin, keys) => {
  for (const key of keys) {
    const value = checkin?.[key];
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      return value;
    }
  }
  return "";
};

const formatCheckinValue = (field, value) => {
  if (field.boolean) {
    return value === true || value === 1 || value === "1" || String(value).toLowerCase() === "true"
      ? "Yes"
      : "No";
  }
  if (field.currency) {
    const amount = Number(value);
    return Number.isFinite(amount) ? `$${amount.toFixed(2)}` : value;
  }
  return value;
};

const Process = () => {
  const { appoId } = useParams();
  const navigate = useNavigate();
  const [petName, setPetName] = useState("");
  const [petId, setPetId] = useState(null);
  const [serviceName, setServiceName] = useState("");
  const [checkin, setCheckin] = useState(null);
  const [process, setProcess] = useState([]);
  const [checkout, setCheckout] = useState(null);
  const [invoice, setInvoice] = useState(null);
  const [status, setStatus] = useState("");
  const [date, setDate] = useState("");
  const [staffName, setStaffName] = useState("");
  const [estimated, setEstimated] = useState("");
  const [additionalServiceNames, setAdditionalServiceNames] = useState("");
  const [coatPriceApplied, setCoatPriceApplied] = useState(false);
  const [className, setClassName] = useState("");
  const [isPaid, setIsPaid] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const getProcess = async () => {
      setIsLoading(true);
      try {
        const res = await get(`/appointment/process/${appoId}`);
        if (res.data.status) {
          const resp = res.data.result;
          console.log(resp);
          setPetName(resp.pet.name);
          setPetId(resp.pet?.id ?? null);
          setServiceName(resp.service.name);
          setCheckin(resp.checkin);
          setProcess(resp.process);
          setCheckout(resp.checkout);
          setStatus(resp.status);
          setDate(resp.date || "N/A");
          setStaffName(
            resp.staff
              ? resp.staff.profile.first_name + " " + resp.staff.profile.last_name
              : "Unassigned"
          );
          setEstimated(Number(resp.estimated_price).toFixed(2));
          setAdditionalServiceNames(
            (Array.isArray(resp?.additionalServices) ? resp.additionalServices : [])
              .map((service) => service.name)
              .join(", ")
          );
          setCoatPriceApplied(
            resp?.coat_price_applied === true ||
              resp?.coat_price_applied === 1 ||
              resp?.coat_price_applied === "1" ||
              String(resp?.coat_price_applied || "").toLowerCase() === "true"
          );
          setInvoice(resp.invoice);
          setClassName(resp.class_name);
          setIsPaid(resp.is_paid);
        }
      } catch (err) {
        console.error("Error fetching grooming progress:", err);
      } finally {
        setIsLoading(false);
      }
    };

    getProcess();
  }, [appoId]);

  // Convert a time string in 'HH:mm:ss' or 'HH:mm' to 12-hour format like '09:00 AM'
  const formatTimeUTCToLocal = (timeStr) => {
    if (!timeStr) return "";
    const parts = timeStr.split(":");
    if (parts.length < 2) return timeStr;
    let hours = parseInt(parts[0], 10);
    const mins = parseInt(parts[1], 10);
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12;
    const paddedMins = mins.toString().padStart(2, "0");
    return `${hours.toString().padStart(2, "0")}:${paddedMins} ${ampm}`;
  };

  const BOARDING_STEPS = [
    { key: "feeding_am", label: "AM Feeding/Meds" },
    { key: "check_pet", label: "Nose to Tail Check" },
    { key: "lunch_tlr", label: "Lunch" },
    { key: "rest_tlr", label: "Rest" },
    { key: "feeding_pm", label: "PM Feeding/Meds" },
  ];

  const flowAppliesToCurrentPet = (flow, flowsObj, useFallbackShowAll) => {
    if (useFallbackShowAll) return true;
    if (petId == null) return true;
    const ids = flow?.selected_pet_ids;
    if (!ids || !Array.isArray(ids)) return true;
    return ids.some((id) => String(id) === String(petId));
  };

  const getBoardingStepsFromProcess = (proc) => {
    if (!proc?.flows) return [];
    let flowsObj = {};
    try {
      flowsObj = typeof proc.flows === "string" ? JSON.parse(proc.flows) : proc.flows;
    } catch {
      return [];
    }
    const date = proc.date || "";
    let currentPetFoundInAnyFlow = false;
    if (petId != null) {
      for (const { key } of BOARDING_STEPS) {
        const flow = flowsObj[key];
        const ids = flow?.selected_pet_ids;
        if (Array.isArray(ids) && ids.some((id) => String(id) === String(petId))) {
          currentPetFoundInAnyFlow = true;
          break;
        }
      }
    }
    const useFallbackShowAll = petId != null && !currentPetFoundInAnyFlow;

    return BOARDING_STEPS.map(({ key, label }) => {
      const flow = flowsObj[key];
      const applies = flowAppliesToCurrentPet(flow, flowsObj, useFallbackShowAll);
      const time =
        applies && flow?.process_time
          ? formatTimeUTCToLocal(flow.process_time)
          : "—";
      return { label, date, time };
    });
  };

  return (
    <div>
      <Breadcrumb pageName={serviceName} pageTitle="Process" />
      {isLoading ? (
        <PageLoader />
      ) : (
        <div className="pt-70 pb-80">
          <div className="container checkout-section grooming-progress-section">
            <div className="payment-form">
              <div className="form-wrap box--shadow payment-methods">
                <div className="d-flex justify-content-end">
                  <button
                    type="button"
                    className="btn btn-outline-primary btn-sm px-3"
                    style={{ height: 32 }}
                    onClick={() => navigate(-1)}
                  >
                    <i className="bi bi-arrow-left me-2" aria-hidden="true"></i>
                    Back
                  </button>
                </div>
                <div className="row mt-4">
                  <div className="col-md-3 form-inner mb-0">
                    <label>Pet Name</label>
                    <span className="fs-5 ms-3">{petName}</span>
                  </div>
                  <div className="col-md-3 form-inner mb-0">
                    <label>Date</label>
                    <span className="fs-5 ms-3">{date}</span>
                  </div>
                  {staffName !== "Unassigned" && (
                    <div className="col-md-3 form-inner mb-0">
                      <label>Staff</label>
                      <span className="fs-5 ms-3">{staffName}</span>
                    </div>
                  )}
                  <div className="col-md-3 form-inner mb-0">
                    <label>Estimated Price</label>
                    <span className="fs-5 ms-3">${estimated}</span>
                  </div>
                </div>
                {additionalServiceNames && (
                  <div className="row">
                    <div className="col-md-12 form-inner mb-0">
                      <label>
                        Additional Services
                        {coatPriceApplied && " (Coat price applied)"}
                      </label>
                      <span className="fs-5 ms-3">
                        {additionalServiceNames}
                      </span>
                    </div>
                  </div>
                )}
                {className && (
                  <div className="row">
                    <div className="col-md-12 form-inner mb-0">
                      <label>Class</label>
                      <span className="fs-5 ms-3">{className}</span>
                    </div>
                  </div>
                )}
                <div className="services-details-area">
                  <div className="tab-content2">
                    <div className="tab-pane">
                      <div className="reviews-area">
                        <div className="review-list-area">
                          <ul className="review-list">
                            {checkin && (
                              <li>
                                <div
                                  className="single-review d-flex justify-content-between flex-md-nowrap flex-wrap position-relative"
                                  style={{ background: "#e0e7ff" }}
                                >
                                  <div className="review-content">
                                    <div className="c-header d-flex align-items-center">
                                      <div className="review-meta">
                                        <h5
                                          className="mb-0 text-dark"
                                          style={{
                                            fontWeight: 500,
                                            fontFamily: "Cabin",
                                          }}
                                        >
                                          Check In
                                        </h5>
                                      </div>
                                    </div>
                                    <div className="row g-3 mt-2 text-dark">
                                      {CHECKIN_FIELD_GROUPS.map((field) => {
                                        const value = getCheckinValue(checkin, field.keys);
                                        if (
                                          value === "" ||
                                          value === null ||
                                          value === undefined
                                        ) {
                                          return null;
                                        }

                                        return (
                                          <div
                                            key={field.label}
                                            className={
                                              field.label === "Notes" || field.label === "Signature"
                                                ? "col-12"
                                                : "col-md-6"
                                            }
                                          >
                                            <div className="c-date">
                                              {field.label}: {" "}
                                              <span className="ms-1">
                                                {formatCheckinValue(field, value)}
                                              </span>
                                            </div>
                                          </div>
                                        );
                                      })}
                                      {checkin.notes && !CHECKIN_FIELD_GROUPS.some((field) => field.label === "Notes") && (
                                        <div className="col-12">
                                          <div className="c-body mt-2">{checkin.notes}</div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  {(status === "in_progress" ||
                                    status === "completed" ||
                                    status === "finished" ||
                                    status === "issue") && (
                                    <div className="position-absolute top-0 end-0">
                                      <span
                                        style={{
                                          display: "inline-block",
                                          fontSize: "1.063rem",
                                          fontWeight: 500,
                                          color: "var(--white)",
                                          fontFamily: "var(--font-cabin)",
                                          padding: "2px 25px",
                                          transition: ".35s",
                                          position: "relative",
                                          background:
                                            "linear-gradient(90deg, #f86ca7, #ff7f18)",
                                          overflow: "hidden",
                                        }}
                                      >
                                        Done
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </li>
                            )}
                            {process.length > 0 && (
                              <li>
                                <div
                                  className="single-review d-flex justify-content-between flex-md-nowrap flex-wrap position-relative"
                                  style={{ background: "#ede9fe" }}
                                >
                                  <div className="review-content w-100">
                                    <div className="c-header d-flex align-items-center">
                                      <div className="review-meta">
                                        <h5
                                          className="mb-0 text-dark"
                                          style={{
                                            fontWeight: 500,
                                            fontFamily: "Cabin",
                                          }}
                                        >
                                          In Progress
                                        </h5>
                                      </div>
                                    </div>
                                    {serviceName === "Boarding" ? (
                                      process.map((proc) => {
                                        const steps = getBoardingStepsFromProcess(proc);
                                        return (
                                          <div key={proc.id} className="mt-3">
                                            {proc.date && (
                                              <div className="text-dark mb-3 fw-bold">
                                                {proc.date}
                                              </div>
                                            )}
                                            <div
                                              className="text-dark"
                                              style={{
                                                display: "grid",
                                                gridTemplateColumns: "repeat(5, 1fr)",
                                                gap: "0.5rem 1rem",
                                                alignItems: "start",
                                              }}
                                            >
                                              {steps.map((step, idx) => (
                                                <div key={idx}>
                                                  <div className="small text-secondary mb-1">
                                                    {step.label}
                                                  </div>
                                                  <div>{step.time}</div>
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                        );
                                      })
                                    ) : (
                                      process.map((proc) => (
                                        <Fragment key={proc.id}>
                                          <div className="d-flex align-items-center gap-4 text-dark mt-2">
                                            {proc.date && (
                                              <div className="c-date">
                                                Date:{" "}
                                                <span className="ms-1 ">
                                                  {proc.date}
                                                </span>
                                              </div>
                                            )}
                                            <div className="c-date">
                                              Start Time:{" "}
                                              <span className="ms-1 ">
                                                {formatTimeUTCToLocal(
                                                  proc.start_time
                                                )}
                                              </span>
                                            </div>
                                            <div className="c-date">
                                              Pickup Time:{" "}
                                              <span className="ms-1 ">
                                                {formatTimeUTCToLocal(
                                                  proc.pickup_time
                                                )}
                                              </span>
                                            </div>
                                            {proc.staff && (
                                              <div>
                                                Staff:{" "}
                                                <span className="ms-1 ">
                                                  {proc.staff.name}
                                                </span>
                                              </div>
                                            )}
                                          </div>
                                          <div className="c-body mt-2">
                                            {proc.notes}
                                          </div>
                                        </Fragment>
                                      ))
                                    )}
                                  </div>
                                  {(status === "completed" ||
                                    status === "finished") && (
                                    <div className="position-absolute top-0 end-0">
                                      <span
                                        style={{
                                          display: "inline-block",
                                          fontSize: "1.063rem",
                                          fontWeight: 500,
                                          color: "var(--white)",
                                          fontFamily: "var(--font-cabin)",
                                          padding: "2px 25px",
                                          transition: ".35s",
                                          position: "relative",
                                          background:
                                            "linear-gradient(90deg, #f86ca7, #ff7f18)",
                                          overflow: "hidden",
                                        }}
                                      >
                                        Done
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </li>
                            )}
                            {checkout && (
                              <li>
                                <div
                                  className="single-review d-flex justify-content-between flex-md-nowrap flex-wrap position-relative"
                                  style={{ background: "#bbf7d0" }}
                                >
                                  <div className="review-content">
                                    <div className="c-header d-flex align-items-center">
                                      <div className="review-meta">
                                        <h5
                                          className="mb-0 text-dark"
                                          style={{
                                            fontWeight: 500,
                                            fontFamily: "Cabin",
                                          }}
                                        >
                                          Check Out
                                        </h5>
                                      </div>
                                    </div>
                                    <div className="d-flex align-items-center gap-4 text-dark mt-2">
                                      {checkout.date && (
                                        <div className="c-date">
                                          Date:{" "}
                                          <span className="ms-1 ">
                                            {checkout.date}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                    <div className="c-body mt-2">
                                      {checkout.notes}
                                    </div>
                                  </div>
                                  {status === "finished" && (
                                    <div className="position-absolute top-0 end-0">
                                      <span
                                        style={{
                                          display: "inline-block",
                                          fontSize: "1.063rem",
                                          fontWeight: 500,
                                          color: "var(--white)",
                                          fontFamily: "var(--font-cabin)",
                                          padding: "2px 25px",
                                          transition: ".35s",
                                          position: "relative",
                                          background:
                                            "linear-gradient(90deg, #f86ca7, #ff7f18)",
                                          overflow: "hidden",
                                        }}
                                      >
                                        Done
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </li>
                            )}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="d-flex justify-content-center gap-5">
                {invoice && (
                  <div className="text-center mt-5">
                    <div className="reservation-btn">
                      <Link
                        to={`/invoice/${invoice.id}`}
                        className="primary-btn1 form-btn"
                        style={{ padding: "8px 36px" }}
                      >
                        View Invoice
                      </Link>
                    </div>
                  </div>
                )}
                {status !== "finished" && !isPaid && (
                  <div className="text-center mt-5">
                    <div className="reservation-btn">
                      <Link
                        to={`/checkout/${appoId}`}
                        className="primary-btn1 form-btn"
                        style={{ padding: "8px 36px" }}
                      >
                        Checkout
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Process;
