import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Breadcrumb from "../components/Breadcrumb";
import { get } from "../utils/axios";
import PageLoader from "../components/PageLoader";
import ConfirmModal from "../components/ConfirmModal";
import toast from "react-hot-toast";

const ServicePackage = () => {
  const { id } = useParams();

  const [appointments, setAppointments] = useState([]);
  const [appointmentId, setAppointmentId] = useState(null);
  const [openConfirmModal, setOpenConfirmModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getPackageAppointments();
  }, [id]);

  const getPackageAppointments = async () => {
    setIsLoading(true);
    try {
      const res = await get(`/service/package/${id}`);
      if (res.data.status) {
        const appointments = res.data.result;
        setAppointments(appointments || []);
      }
    } catch (err) {
      console.error("Error fetching service details:", err);
    } finally {
      setIsLoading(false);
    }
  };

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

  const cancelAppointment = (id) => {
    setAppointmentId(id);
    setOpenConfirmModal(true);
  };

  const confirmCancelAppointment = async () => {
    setOpenConfirmModal(false);
    try {
      const res = await get(`/appointment/cancel/${appointmentId}`);
      if (res.data.status) {
        setAppointments(res.data.result || []);
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
    <div>
      <Breadcrumb pageName="Service Detail" pageTitle="Package" />
      {isLoading ? (
        <PageLoader />
      ) : (
        <div className="services-details-area pt-120 pb-60">
          <div className="container">
            <div style={{ overflowX: "auto", width: "100%" }}>
              <table
                className="table total-table2 table-bordered"
                style={{ minWidth: 600, whiteSpace: "nowrap" }}
              >
                <thead>
                  <tr>
                    <th>Pet</th>
                    <th>Package</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Start Time</th>
                    <th>End Time</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody style={{ fontSize: 15 }}>
                  {appointments.map((appointment) => (
                    <tr key={appointment.id}>
                      <td>{appointment.pet.name}</td>
                      <td>{appointment.package.name}</td>
                      <td>{appointment.date}</td>
                      <td>{appointment.end_date}</td>
                      <td>{formatTime(appointment.start_time)}</td>
                      <td>{formatTime(appointment.end_time)}</td>
                      <td>
                        {appointment.status
                          .split("_")
                          .map(
                            (word) =>
                              word.charAt(0).toUpperCase() + word.slice(1)
                          )
                          .join(" ")}
                      </td>
                      <td style={{ maxWidth: 100 }}>
                        {(appointment.status === "checked_in" ||
                          appointment.status === "in_progress" ||
                          appointment.status === "completed" ||
                          appointment.status === "finished") && (
                          <Link
                            to={`/process/${appointment.id}`}
                            className="btn btn-primary btn-sm ms-2"
                          >
                            <span className="d-none d-sm-inline">View</span>
                            <i className="bi bi-hourglass d-inline d-sm-none"></i>
                          </Link>
                        )}
                        {appointment.status === "checked_in" && (
                          <button
                            className="btn btn-danger btn-sm ms-2"
                            onClick={() => cancelAppointment(appointment.id)}
                          >
                            <span className="d-none d-sm-inline">Cancel</span>
                            <i className="bi bi-x d-inline d-sm-none"></i>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
        </div>
      )}
    </div>
  );
};

export default ServicePackage;
