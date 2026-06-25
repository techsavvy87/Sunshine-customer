import { useEffect, useState, Fragment } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { get } from "../utils/axios";
import toast from "react-hot-toast";
import ConfirmModal from "./ConfirmModal";

const ServiceSummaryTab = ({ serviceId, description, appointments }) => {
  const [engagements, setEngagements] = useState([]);
  const [appointmentId, setAppointmentId] = useState(null);
  const [openConfirmModal, setOpenConfirmModal] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "description";

  const handleTabChange = (tab) => {
    setSearchParams({ tab });
  };

  useEffect(() => {
    setEngagements(appointments || []);
  }, [appointments]);

  useEffect(() => {
    // Initialize with default tab if no tab parameter exists
    if (!searchParams.has("tab")) {
      setSearchParams({ tab: "description" }, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const formatTime = (timeStr) => {
    if (!timeStr || typeof timeStr !== "string" || !timeStr.includes(":")) {
      return "-";
    }
    const [hour, minute, second] = timeStr.split(":");
    const date = new Date();
    date.setHours(hour, minute, second);
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const refreshAppointments = async () => {
    try {
      const res = await get(`/appointment/list/${serviceId}`);
      if (res.data.status) {
        setEngagements(res.data.result || []);
        toast.success("Appointments have been refreshed!");
      } else {
        toast.error("Failed to refresh appointments. Please try again.");
      }
    } catch (err) {
      toast.error("Something went wrong.");
      console.error(err);
    }
  };

  const cancelAppointment = (id) => {
    setAppointmentId(id);
    setOpenConfirmModal(true);
  };

  const confirmCancelAppointment = async () => {
    setOpenConfirmModal(false);
    try {
      const res = await get(`/appointment/cancel/${appointmentId}`);
      if (res.data.status) {
        setEngagements(res.data.result || []);
        toast.success("Appointment has been cancelled!");
      } else {
        toast.error(`${res.data.message} Please try again.`);
      }
    } catch (err) {
      toast.error("Something went wrong.");
      console.error(err);
    }
  };

  return (
    <Fragment>
      <div className="col-lg-12" style={{ fontFamily: "Cabin" }}>
        <div
          className="nav nav2 nav nav-pills"
          role="tablist"
          aria-orientation="vertical"
        >
          <button
            className={`nav-link ${
              activeTab === "description" ? "active" : ""
            }`}
            onClick={() => handleTabChange("description")}
            type="button"
            role="tab"
            aria-controls="description"
            aria-selected={activeTab === "description"}
          >
            Description{" "}
          </button>
          <button
            className={`nav-link ${
              activeTab === "appointments" ? "active" : ""
            }`}
            onClick={() => handleTabChange("appointments")}
            type="button"
            role="tab"
            aria-controls="my-appointments"
            aria-selected={activeTab === "appointments"}
          >
            My Appointments
          </button>
        </div>
        <div className="tab-content tab-content2">
          <div
            className={`tab-pane fade ${
              activeTab === "description" ? "show active" : ""
            }`}
            id="description"
            role="tabpanel"
          >
            <div
              className="description p-3"
              dangerouslySetInnerHTML={{ __html: description }}
            />
          </div>
          <div
            className={`tab-pane fade ${
              activeTab === "appointments" ? "show active" : ""
            }`}
            id="my-appointments"
            role="tabpanel"
          >
            <div className="addithonal-information px-3">
              <div className="d-flex justify-content-end">
                <button
                  className="btn btn-primary btn-sm mb-2"
                  type="button"
                  onClick={refreshAppointments}
                >
                  <i className="bi bi-arrow-repeat"></i>
                </button>
              </div>
              <div style={{ overflowX: "auto", width: "100%" }}>
                <table
                  className="table total-table2 table-bordered"
                  style={{ minWidth: 600, whiteSpace: "nowrap" }}
                >
                  <thead>
                    <tr>
                      <th>Pet</th>
                      {engagements.length > 0 && engagements[0].class_name && (
                        <th>Class</th>
                      )}
                      <th>Staff</th>
                      <th>
                        {engagements.length > 0 && engagements[0].end_date
                          ? "Start Date"
                          : "Date"}
                      </th>
                      <th>Start Time</th>
                      {engagements.length > 0 && engagements[0].end_date ? (
                        <th>End Date</th>
                      ) : null}
                      <th>End Time</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody style={{ fontSize: 15 }}>
                    {engagements.map((engagement) => (
                      <tr key={engagement.id}>
                        <td>{engagement.pet.name}</td>
                        {engagement.class_name && (
                          <td>{engagement.class_name}</td>
                        )}
                        <td>
                          {engagement.staff
                            ? engagement.staff.name
                            : "Unassigned"}
                        </td>
                        <td>{engagement.date}</td>
                        <td>{formatTime(engagement.start_time)}</td>
                        {engagement.end_date ? (
                          <td>{engagement.end_date}</td>
                        ) : null}
                        <td>{formatTime(engagement.end_time)}</td>
                        <td>
                          {engagement.status
                            .split("_")
                            .map(
                              (word) =>
                                word.charAt(0).toUpperCase() + word.slice(1)
                            )
                            .join(" ")}
                        </td>
                        <td style={{ maxWidth: 100 }}>
                          {(engagement.status === "checked_in" ||
                            engagement.status === "in_progress" ||
                            engagement.status === "completed" ||
                            engagement.status === "finished") && (
                            <Link
                              to={`/process/${engagement.id}`}
                              className="btn btn-primary btn-sm ms-2"
                            >
                              <span className="d-none d-sm-inline">View</span>
                              <i className="bi bi-hourglass d-inline d-sm-none"></i>
                            </Link>
                          )}
                          {engagement.status === "checked_in" && (
                            <button
                              className="btn btn-danger btn-sm ms-2"
                              onClick={() => cancelAppointment(engagement.id)}
                            >
                              <span className="d-none d-sm-inline">Cancel</span>
                              <i className="bi bi-x d-inline d-sm-none"></i>
                            </button>
                          )}
                          <Link
                            to={`/pre-checkin/${engagement.id}`}
                            className="btn btn-warning btn-sm ms-2"
                          >
                            <span className="d-none d-sm-inline">
                              Pre Check-In
                            </span>
                            <i className="bi bi-clipboard-check d-inline d-sm-none"></i>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ConfirmModal
        open={openConfirmModal}
        onClose={() => setOpenConfirmModal(false)}
        onConfirm={confirmCancelAppointment}
        title="Confirm Appointment Cancellation"
        message="Are you sure you want to cancel this appointment?"
        type="warning"
        confirmText="Yes"
        cancelText="No"
      />
    </Fragment>
  );
};

export default ServiceSummaryTab;
