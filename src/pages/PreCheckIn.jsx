import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import Breadcrumb from "../components/Breadcrumb";
import PageLoader from "../components/PageLoader";
import { get, post } from "../utils/axios";

const TAX_RATE = 0.07;

const makeListItem = (prefix, index, defaults = {}) => ({
  id: `${prefix}-${Date.now()}-${index}`,
  ...defaults,
});

const getFirstValue = (...values) =>
  values.find(
    (value) => value !== undefined && value !== null && String(value).trim() !== ""
  ) || "";

const formatDateValue = (value) => {
  if (!value) return "";
  const raw = String(value);
  const match = raw.match(/\d{4}-\d{2}-\d{2}/);
  return match ? match[0] : raw;
};

const formatTimeValue = (value) => {
  if (!value) return "";
  const raw = String(value);
  const match = raw.match(/\d{2}:\d{2}/);
  return match ? match[0] : raw;
};

const formatDateTimeDisplay = (date, time) => {
  if (!date) return "";
  const full = `${date}${time ? ` ${time}` : ""}`;
  const parsed = new Date(full);
  if (Number.isNaN(parsed.getTime())) return full;
  return parsed.toLocaleString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const parseBoolean = (value) => {
  if (value === true || value === 1 || value === "1") return true;
  const normalized = String(value || "").trim().toLowerCase();
  return normalized === "true" || normalized === "yes" || normalized === "on";
};

const initialFormState = {
  checkin_id: "",
  customer_name: "",
  pet_name: "",
  service_name: "",
  date: "",
  start_time: "",
  pickup_date: "",
  pickup_time: "",
  estimated_price: "",
  assigned_room_kennel: "",
  assigned_staff: "",
  assignment_location: "",
  trip_pickup_datetime: "",
  trip_location: "",
  trip_phone: "",
  alternate_contact_name: "",
  alternate_contact_phone: "",
  trip_information: "",
  pet_information: "",
  feeding_medication_information: "",
  feeding_instructions: "",
  medication_instructions: "",
  pet_flea_tick: false,
  pet_items: "",
  location_type: "",
  location_details: "",
  rest_required: false,
  rest_note: "",
  appointment_status: "",
  boarding_agreement: false,
  agreement_treat_vet: false,
  agreement_notes: "",
  signature_name: "",
  signature_date: "",
  signature_value: "",
  signature_text: "",
  notes: "",
};

const PreCheckIn = () => {
  const { appoId } = useParams();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [serviceName, setServiceName] = useState("Pre Check-In");
  const [petName, setPetName] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [formData, setFormData] = useState(initialFormState);
  const [dryFoods, setDryFoods] = useState([makeListItem("dry", 1)]);
  const [wetFoods, setWetFoods] = useState([makeListItem("wet", 1)]);
  const [medications, setMedications] = useState([makeListItem("med", 1)]);
  const signatureCanvasRef = useRef(null);
  const signatureDrawingRef = useRef(false);

  const baseEstimatedPrice = Number(formData.estimated_price || 0);
  const estimatedTaxFee = baseEstimatedPrice * TAX_RATE;
  const estimatedTotalPrice = baseEstimatedPrice + estimatedTaxFee;

  useEffect(() => {
    const getAppointmentData = async () => {
      setIsLoading(true);
      try {
        const [processRes, checkoutRes] = await Promise.allSettled([
          get(`/appointment/process/${appoId}`),
          get(`/checkout/detail/${appoId}`),
        ]);

        const res =
          processRes.status === "fulfilled" ? processRes.value : null;

        if (!res?.data?.status) {
          toast.error(res?.data?.message || "Failed to load appointment data.");
          return;
        }

        const appointment = res.data.result || {};
        const checkin = appointment.checkin || {};
        const checkoutData =
          checkoutRes.status === "fulfilled" ? checkoutRes.value?.data?.result : null;
        const orderDetails = checkoutData?.order_details || {};

        const nextCustomerName = getFirstValue(
          appointment.customer?.name,
          appointment.customer_name,
          appointment.user?.name,
          appointment.client_name,
          checkin.customer_name
        );
        const nextPetName = getFirstValue(
          appointment.pet?.name,
          appointment.pet_name,
          checkin.pet_name
        );

        setServiceName(
          getFirstValue(appointment.service?.name, appointment.service_name, "Pre Check-In")
        );
        setCustomerName(nextCustomerName);
        setPetName(nextPetName);

        setFormData({
          checkin_id: checkin.id || "",
          customer_name: nextCustomerName,
          pet_name: nextPetName,
          service_name: getFirstValue(appointment.service?.name, appointment.service_name),
          date: formatDateValue(getFirstValue(checkin.date, appointment.date)),
          start_time: formatTimeValue(getFirstValue(checkin.start_time, appointment.start_time)),
          pickup_date: formatDateValue(
            getFirstValue(appointment.pickup_date, appointment.end_date, checkin.pickup_date)
          ),
          pickup_time: formatTimeValue(
            getFirstValue(appointment.pickup_time, appointment.end_time, checkin.pickup_time)
          ),
          trip_pickup_datetime: getFirstValue(
            checkin.trip_pickup_datetime,
            formatDateTimeDisplay(
              getFirstValue(appointment.end_date, appointment.pickup_date, checkin.pickup_date),
              getFirstValue(appointment.end_time, appointment.pickup_time, checkin.pickup_time)
            )
          ),
          trip_location: getFirstValue(checkin.trip_location, appointment.assignment_location, appointment.location),
          trip_phone: getFirstValue(checkin.trip_phone, appointment.customer?.phone, appointment.phone),
          alternate_contact_name: getFirstValue(checkin.alternate_contact_name),
          alternate_contact_phone: getFirstValue(checkin.alternate_contact_phone),
          estimated_price: getFirstValue(
            orderDetails.estimated_service_price,
            orderDetails.total_service_price,
            checkoutData?.estimated_service_price,
            appointment.estimated_price,
            checkin.estimated_price
          ),
          assigned_room_kennel: getFirstValue(
            appointment.assigned_room_kennel,
            appointment.room_kennel,
            appointment.room_name,
            appointment.kennel_name,
            checkin.assigned_room_kennel,
            checkin.room_kennel
          ),
          assigned_staff: getFirstValue(
            appointment.staff?.name,
            appointment.staff_name,
            checkin.assigned_staff,
            checkin.staff_name
          ),
          assignment_location: getFirstValue(
            appointment.assignment_location,
            appointment.location,
            checkin.assignment_location,
            checkin.location
          ),
          trip_information: getFirstValue(
            checkin.trip_information,
            checkin.tripInfo,
            checkin.trip_info
          ),
          pet_information: getFirstValue(checkin.pet_information, checkin.petInfo, checkin.pet_info),
          feeding_medication_information: getFirstValue(
            checkin.feeding_medication_information,
            checkin.feedingMedicationInformation,
            checkin.feeding_medication_info
          ),
          pet_flea_tick: parseBoolean(checkin.pet_flea_tick),
          pet_items: getFirstValue(checkin.pet_items),
          location_type: getFirstValue(checkin.location_type, appointment.location_type),
          location_details: getFirstValue(checkin.location_details, appointment.location_details),
          rest_required: parseBoolean(checkin.rest_required),
          rest_note: getFirstValue(checkin.rest_note),
          appointment_status: getFirstValue(appointment.status, checkin.status),
          agreement_treat_vet: parseBoolean(checkin.agreement_treat_vet),
          feeding_instructions: getFirstValue(
            checkin.feeding_instructions,
            checkin.feedingInstructions
          ),
          medication_instructions: getFirstValue(
            checkin.medication_instructions,
            checkin.medicationInstructions
          ),
          boarding_agreement: parseBoolean(checkin.boarding_agreement),
          agreement_notes: getFirstValue(checkin.agreement_notes, checkin.boarding_agreement_notes),
          signature_name: getFirstValue(checkin.signature_name, checkin.signatureName),
          signature_date: formatDateValue(getFirstValue(checkin.signature_date, appointment.date)),
          signature_value: getFirstValue(checkin.signature_value, checkin.signature_text, checkin.signature),
          signature_text: getFirstValue(checkin.signature_text, checkin.signature),
          notes: getFirstValue(checkin.notes),
        });

        const hydrateArray = (field, fallbackPrefix) => {
          const values = Array.isArray(checkin?.[field]) ? checkin[field] : [];
          if (values.length > 0) {
            return values.map((item, index) => ({
              id: item.id || `${fallbackPrefix}-${index}`,
              ...item,
            }));
          }
          return [makeListItem(fallbackPrefix, 1)];
        };

        setDryFoods(hydrateArray("dry_foods", "dry"));
        setWetFoods(hydrateArray("wet_foods", "wet"));
        setMedications(hydrateArray("medications_list", "med"));
      } catch (error) {
        console.error("Error loading pre check-in data:", error);
        toast.error("Failed to load appointment data.");
      } finally {
        setIsLoading(false);
      }
    };

    getAppointmentData();
  }, [appoId]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const getSignaturePoint = (event, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if (event.touches && event.touches.length > 0) {
      const touch = event.touches[0];
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY,
      };
    }

    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY,
    };
  };

  const startSignatureDraw = (event) => {
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { x, y } = getSignaturePoint(event, canvas);
    signatureDrawingRef.current = true;
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const drawSignature = (event) => {
    if (!signatureDrawingRef.current) return;
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { x, y } = getSignaturePoint(event, canvas);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const endSignatureDraw = () => {
    if (!signatureDrawingRef.current) return;
    signatureDrawingRef.current = false;

    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.closePath();
    }

    const dataUrl = canvas.toDataURL("image/png");
    setFormData((prev) => ({
      ...prev,
      signature_value: dataUrl,
      signature_text: dataUrl,
    }));
  };

  const clearSignature = () => {
    const canvas = signatureCanvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }

    setFormData((prev) => ({
      ...prev,
      signature_value: "",
      signature_text: "",
    }));
  };

  useEffect(() => {
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#111827";
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (formData.signature_value && String(formData.signature_value).startsWith("data:image")) {
      const image = new Image();
      image.onload = () => {
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      };
      image.src = formData.signature_value;
    }
  }, [formData.signature_value]);

  const updateListItem = (setter, id, field, value) => {
    setter((items) =>
      items.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const addListItem = (setter, prefix) => {
    setter((items) => [...items, makeListItem(prefix, items.length + 1)]);
  };

  const removeListItem = (setter, id, prefix) => {
    setter((items) => {
      const nextItems = items.filter((item) => item.id !== id);
      return nextItems.length > 0 ? nextItems : [makeListItem(prefix, 1)];
    });
  };

  const statusOptions = useMemo(
    () => ["Pending", "Confirmed", "Checked In", "In Progress", "Completed"],
    []
  );

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.date || !formData.start_time) {
      toast.error("Please provide the check-in date and start time.");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        appointment_id: appoId,
        checkin_id: formData.checkin_id || undefined,
        customer_name: formData.customer_name,
        pet_name: formData.pet_name,
        service_name: formData.service_name,
        date: formData.date,
        start_time: formData.start_time,
        pickup_date: formData.pickup_date || undefined,
        pickup_time: formData.pickup_time || undefined,
        estimated_price: formData.estimated_price === "" ? null : Number(estimatedTotalPrice.toFixed(2)),
        estimated_price_before_tax:
          formData.estimated_price === "" ? null : Number(baseEstimatedPrice.toFixed(2)),
        estimated_tax_fee:
          formData.estimated_price === "" ? null : Number(estimatedTaxFee.toFixed(2)),
        assigned_room_kennel: formData.assigned_room_kennel,
        assigned_staff: formData.assigned_staff,
        assignment_location: formData.assignment_location,
        trip_pickup_datetime: formData.trip_pickup_datetime,
        trip_location: formData.trip_location,
        trip_phone: formData.trip_phone,
        alternate_contact_name: formData.alternate_contact_name,
        alternate_contact_phone: formData.alternate_contact_phone,
        trip_information: formData.trip_information,
        pet_information: formData.pet_information,
        pet_flea_tick: formData.pet_flea_tick ? 1 : 0,
        pet_items: formData.pet_items,
        location_type: formData.location_type,
        location_details: formData.location_details,
        rest_required: formData.rest_required ? 1 : 0,
        rest_note: formData.rest_note,
        appointment_status: formData.appointment_status,
        feeding_medication_information: formData.feeding_medication_information,
        feeding_instructions: formData.feeding_instructions,
        medication_instructions: formData.medication_instructions,
        dry_foods: dryFoods,
        wet_foods: wetFoods,
        medications_list: medications,
        boarding_agreement: formData.boarding_agreement ? 1 : 0,
        agreement_treat_vet: formData.agreement_treat_vet ? 1 : 0,
        agreement_notes: formData.agreement_notes,
        signature_name: formData.signature_name,
        signature_date: formData.signature_date || formData.date,
        signature_value: formData.signature_value,
        signature_text: formData.signature_text,
        notes: formData.notes,
      };

      const res = await post(`/appointment/pre-checkin/${appoId}`, payload);
      if (res.data.status) {
        toast.success(res.data.message || "Pre Check-In saved successfully.");
        navigate(`/process/${appoId}`);
      } else {
        toast.error(res.data.message || "Failed to save pre check-in.");
      }
    } catch (error) {
      console.error("Error saving pre check-in:", error);
      toast.error("Failed to save pre check-in.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <Breadcrumb pageName={serviceName} pageTitle="Pre Check-In" />
      <style>
        {`
          .pre-checkin-page {
            background: #f3f4f6;
          }
          .pre-checkin-form {
            font-family: Cabin, sans-serif;
            font-size: 16px;
            color: #111827;
          }
          .pre-checkin-form select {
            display: block;
            height: 45px;
            width: 100%;
            font-size: 0.875rem;
            font-weight: 400;
            color: #868686;
            font-family: var(--font-cabin);
            padding: 10px 20px;
            background: #ffffff;
            border: 1px solid #eee;
            border-radius: 5px;
          }
          .pre-checkin-form input[type="date"] {
            display: block;
            height: 45px;
            width: 100%;
            font-size: 0.875rem;
            font-weight: 400;
            color: #868686;
            font-family: var(--font-cabin);
            padding: 10px 20px;
            background: #ffffff;
            border: 1px solid #eee;
            border-radius: 5px;
          }
          .pre-checkin-panel {
            background: #ffffff;
            border: 1px solid #dbe2ea;
            border-radius: 4px;
            padding: 14px;
          }
          .pre-checkin-panel .section-title {
            font-size: 1.65rem;
            font-weight: 600;
            margin-bottom: 10px;
            line-height: 1.25;
          }
          .pre-checkin-panel .item-card {
            border: 1px solid #dbe2ea;
            border-radius: 4px;
            padding: 12px;
            background: #fff;
          }
          .pre-checkin-panel .agreement-box {
            background: #f8fafc;
            border: 1px solid #dbe2ea;
            border-radius: 4px;
          }
          .pre-checkin-panel .form-inner input,
          .pre-checkin-panel .form-inner select,
          .pre-checkin-panel .form-inner textarea {
            border-color: #d1d5db;
          }
          .pre-checkin-panel .form-inner label {
            font-weight: 500;
            color: #1f2937;
          }
          .trip-info-panel {
            background: transparent;
            border: 0;
            padding: 0;
          }
          .trip-info-panel .section-title {
            font-size: 1.65rem;
            font-weight: 600;
            margin-bottom: 10px;
          }
          .trip-info-panel .trip-field {
            margin-bottom: 14px;
          }
          .trip-info-panel .trip-label {
            display: block;
            font-size: 1rem;
            font-weight: 500;
            margin-bottom: 6px;
            color: #111827;
          }
          .trip-info-panel .trip-control {
            width: 100%;
            height: 42px;
            border: 1px solid #cfd4dc;
            border-radius: 4px;
            padding: 8px 12px;
            background: #fff;
            font-size: 1rem;
            color: #111827;
          }
          .trip-info-panel .trip-control::placeholder,
          .trip-info-panel .trip-textarea::placeholder {
            color: #9ca3af;
          }
          .trip-info-panel .trip-textarea {
            width: 100%;
            border: 1px solid #cfd4dc;
            border-radius: 4px;
            padding: 12px;
            min-height: 118px;
            background: #fff;
            font-size: 1rem;
            color: #111827;
          }
          .trip-info-panel .trip-time-wrap {
            position: relative;
          }
          .trip-info-panel .trip-time-wrap .trip-control {
            padding-right: 44px;
          }
          .trip-info-panel .trip-time-icon {
            position: absolute;
            right: 12px;
            top: 50%;
            transform: translateY(-50%);
            color: #111827;
            pointer-events: none;
            font-size: 1.05rem;
          }
          .pet-info-panel {
            background: transparent;
            border: 0;
            padding: 0;
          }
          .pet-info-panel .section-title {
            font-size: 1.65rem;
            font-weight: 600;
            margin-bottom: 8px;
          }
          .pet-info-panel .pet-check-row {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 12px;
          }
          .pet-info-panel .pet-check-input {
            width: 20px;
            height: 20px;
            border: 1px solid #c9ced6;
            border-radius: 4px;
            margin: 0;
          }
          .pet-info-panel .pet-check-label {
            margin: 0;
            font-size: 1rem;
            color: #111827;
            font-weight: 500;
          }
          .pet-info-panel .pet-label {
            display: block;
            font-size: 1rem;
            font-weight: 500;
            color: #111827;
            margin-bottom: 6px;
          }
          .pet-info-panel .pet-textarea {
            width: 100%;
            border: 1px solid #cfd4dc;
            border-radius: 4px;
            padding: 12px;
            min-height: 118px;
            font-size: 1rem;
            color: #111827;
            background: #fff;
          }
          .pet-info-panel .pet-textarea::placeholder {
            color: #9ca3af;
          }
          .feeding-panel {
            background: transparent;
            border: 0;
            padding: 0;
          }
          .feeding-panel .section-title {
            font-size: 1.65rem;
            font-weight: 600;
            margin-bottom: 10px;
          }
          .feeding-panel .subsection-title {
            font-size: 1.2rem;
            font-weight: 600;
            color: #111827;
          }
          .feeding-panel .feeding-subsection {
            margin-top: 12px;
          }
          .feeding-panel .feeding-subsection.with-divider {
            border-top: 1px solid #d8dde5;
            padding-top: 12px;
            margin-top: 12px;
          }
          .feeding-panel .subsection-head {
            margin-bottom: 8px;
          }
          .feeding-panel .add-item-btn {
            min-width: 88px;
            height: 32px;
            border-radius: 6px;
            font-size: 0.95rem;
            padding: 0 14px;
            line-height: 32px;
          }
          .feeding-panel .item-card {
            border: 1px solid #d2d8e0;
            border-radius: 4px;
            padding: 12px;
            background: #fff;
          }
          .feeding-panel .item-card .row {
            --bs-gutter-y: 0.75rem;
          }
          .feeding-panel .item-card .item-title {
            font-size: 1.12rem;
            font-weight: 600;
            color: #111827;
          }
          .feeding-panel .item-card .remove-btn {
            color: #c3c9d2;
            text-decoration: none;
            font-size: 1.05rem;
            line-height: 1;
          }
          .feeding-panel .item-card label,
          .feeding-panel .dispense-label,
          .feeding-panel .dispense-option {
            font-size: 0.97rem;
            color: #111827;
            font-weight: 500;
          }
          .feeding-panel .item-card .form-inner label {
            margin-bottom: 4px;
          }
          .feeding-panel .item-card input:not([type="date"]),
          .feeding-panel .item-card textarea {
            border: 1px solid #cfd4dc;
            border-radius: 4px;
            height: 40px;
            font-size: 0.95rem;
            padding: 8px 12px;
          }
          .feeding-panel .amount-input {
            max-width: 170px;
            width: 100%;
          }
          .feeding-panel .item-card input::placeholder {
            color: #9ca3af;
          }
          .feeding-panel .dispense-row {
            display: flex;
            align-items: center;
            gap: 14px;
            flex-wrap: wrap;
            padding-top: 2px;
          }
          .feeding-panel .dispense-option {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            margin-bottom: 0;
            font-weight: 500;
          }
          .feeding-panel .dispense-option input {
            width: 18px;
            height: 18px;
            margin: 0;
          }
          .assignment-panel .form-inner {
            margin-bottom: 14px;
          }
          .assignment-panel {
            background: transparent;
            border: 0;
            padding: 0;
          }
          .assignment-panel > .section-header {
            margin-bottom: 10px;
          }
          .assignment-panel .form-inner label {
            font-size: 1rem;
            font-weight: 500;
            color: #111827;
            margin-bottom: 6px;
          }
          .assignment-panel .location-types {
            display: flex;
            flex-wrap: wrap;
            gap: 22px;
            padding-top: 2px;
          }
          .assignment-panel .location-types label {
            display: inline-flex;
            align-items: center;
            gap: 7px;
            margin-bottom: 0;
            font-size: 0.97rem;
            font-weight: 500;
          }
          .assignment-panel .location-types input,
          .assignment-panel .rest-required input {
            width: 18px;
            height: 18px;
            margin: 0;
          }
          .assignment-panel .rest-required {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 10px;
            font-size: 0.97rem;
          }
          .assignment-panel .details-textarea {
            width: 100%;
            min-height: 84px;
            border: 1px solid #d1d5db;
            border-radius: 4px;
            padding: 10px 12px;
            background: #ffffff;
            resize: vertical;
          }
          .assignment-panel .assignment-grid {
            margin-top: 14px;
          }
          .assignment-panel .estimated-price-group {
            border: 1px solid #d1d5db;
            border-radius: 4px;
            overflow: hidden;
            background: #ffffff;
          }
          .assignment-panel .estimated-price-group .form-control {
            border: 0;
            box-shadow: none;
            height: 44px;
            font-size: 0.95rem;
            padding: 10px 12px;
          }
          .assignment-panel .estimated-price-group .form-control:focus {
            box-shadow: none;
          }
          .assignment-panel .estimated-price-badge {
            border: 0;
            background: transparent;
            padding: 0 12px 0 0;
          }
          .assignment-panel .estimated-price-badge span {
            display: inline-block;
            font-size: 0.82rem;
            line-height: 1;
            color: #374151;
            background: #f3f4f6;
            border: 1px solid #e5e7eb;
            border-radius: 4px;
            padding: 4px 8px;
          }
          .assignment-panel .start-time-wrap {
            position: relative;
          }
          .assignment-panel .start-time-input {
            width: 100%;
            height: 45px;
            border: 1px solid #eee;
            border-radius: 5px;
            padding: 10px 38px 10px 20px;
            font-size: 0.875rem;
            font-weight: 400;
            color: #868686;
            font-family: var(--font-cabin);
            background: #ffffff;
          }
          .assignment-panel .start-time-icon {
            position: absolute;
            right: 12px;
            top: 50%;
            transform: translateY(-50%);
            color: #111827;
            pointer-events: none;
            font-size: 0.85rem;
          }
          .assignment-panel .notes-textarea {
            width: 100%;
            display: block;
            min-height: 96px;
          }
          .assignment-panel .assignment-subpanel:last-child .form-inner {
            margin-bottom: 0;
          }
          .boarding-panel {
            background: transparent;
            border: 0;
            padding: 0;
          }
          .boarding-panel > .section-header {
            margin-bottom: 10px;
          }
          .boarding-panel .signature-canvas-wrap {
            width: 100%;
            border: 1px solid #d1d5db;
            border-radius: 4px;
            background: #ffffff;
            overflow: hidden;
          }
          .boarding-panel .signature-canvas {
            width: 100%;
            height: 180px;
            display: block;
            cursor: default;
            touch-action: none;
            background: #ffffff;
          }
          .boarding-panel .owner-name-field label {
            display: block;
            margin-bottom: 6px;
            font-weight: 400;
          }
          .boarding-panel .owner-name-input {
            display: block;
            width: 100%;
            height: 45px;
            border: 1px solid #cfd4dc;
            border-radius: 4px;
            padding: 10px 12px;
            background: #ffffff;
            color: #111827;
            font-size: 1rem;
          }
        `}
      </style>
      {isLoading ? (
        <PageLoader />
      ) : (
        <div className="checkout-section pt-120 pb-120 pre-checkin-page">
          <div className="container">
            <form className="pre-checkin-form" onSubmit={handleSubmit}>
              <div className="d-flex justify-content-end mb-3">
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm px-3"
                  onClick={() => navigate(-1)}
                >
                  <i className="bi bi-arrow-left me-2" aria-hidden="true"></i>
                  Back
                </button>
              </div>

              <div className="pre-checkin-panel trip-info-panel">
                <div className="section-title">Trip Information</div>
                <div className="trip-field">
                  <label className="trip-label">Confirm pickup date and time:</label>
                  <div className="trip-time-wrap">
                    <input
                      type="text"
                      name="trip_pickup_datetime"
                      value={formData.trip_pickup_datetime}
                      onChange={handleChange}
                      placeholder="MM/DD/YYYY HH:MM AM"
                      className="trip-control"
                    />
                    <i className="bi bi-calendar-event trip-time-icon" aria-hidden="true"></i>
                  </div>
                </div>

                <div className="trip-field">
                  <label className="trip-label">Trip location:</label>
                  <input
                    name="trip_location"
                    value={formData.trip_location}
                    onChange={handleChange}
                    placeholder="Enter trip location"
                    className="trip-control"
                  />
                </div>

                <div className="trip-field">
                  <label className="trip-label">Trip phone number (if different from current on file):</label>
                  <input
                    name="trip_phone"
                    value={formData.trip_phone}
                    onChange={handleChange}
                    placeholder="Enter phone number"
                    className="trip-control"
                  />
                </div>

                <div className="trip-field">
                  <label className="trip-label">Alternate contact (name and phone):</label>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <input
                        name="alternate_contact_name"
                        value={formData.alternate_contact_name}
                        onChange={handleChange}
                        placeholder="Name"
                        className="trip-control"
                      />
                    </div>
                    <div className="col-md-6">
                      <input
                        name="alternate_contact_phone"
                        value={formData.alternate_contact_phone}
                        onChange={handleChange}
                        placeholder="Phone"
                        className="trip-control"
                      />
                    </div>
                  </div>
                </div>

                <div className="trip-field mb-0">
                  <label className="trip-label">Notes (authorized pickup & payment arrangement):</label>
                  <textarea
                    rows="4"
                    name="trip_information"
                    value={formData.trip_information}
                    onChange={handleChange}
                    placeholder="Enter notes..."
                    className="trip-textarea"
                  />
                </div>
              </div>

              <div className="pre-checkin-panel mt-3 pet-info-panel">
                <div className="section-title">Pet Information</div>
                <div className="pet-check-row">
                  <input
                    type="checkbox"
                    className="pet-check-input"
                    id="pet_flea_tick"
                    name="pet_flea_tick"
                    checked={formData.pet_flea_tick}
                    onChange={handleChange}
                  />
                  <label className="pet-check-label" htmlFor="pet_flea_tick">
                    Flea/Tick
                  </label>
                </div>
                <div>
                  <label className="pet-label">Items:</label>
                  <textarea
                    rows="4"
                    name="pet_items"
                    value={formData.pet_items}
                    onChange={handleChange}
                    placeholder="Please describe items brought for boarding (e.g., Leash, Collar, toys, bedding, etc)"
                    className="pet-textarea"
                  />
                </div>
              </div>

              <div className="pre-checkin-panel mt-3 feeding-panel">
                <div className="section-header d-flex justify-content-between align-items-center flex-wrap gap-2">
                  <div className="section-title mb-0">Feeding and Medication Information</div>
                </div>

                <div className="subsection feeding-subsection">
                  <div className="subsection-head d-flex justify-content-between align-items-center">
                    <strong className="subsection-title">Dry Food</strong>
                    <button type="button" className="btn btn-primary add-item-btn" onClick={() => addListItem(setDryFoods, "dry")}>Add Dry</button>
                  </div>
                  {dryFoods.map((item, index) => (
                    <div className="item-card mb-3" key={item.id}>
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <div className="item-title">Dry Food #{index + 1}</div>
                        <button type="button" className="btn btn-link p-0 remove-btn" onClick={() => removeListItem(setDryFoods, item.id, "dry")}>x</button>
                      </div>
                      <div className="row g-3">
                        <div className="col-md-4">
                          <div className="form-inner mb-0">
                            <label>Brand:</label>
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-inner mb-0">
                            <label>Amount:</label>
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-inner mb-0">
                            <label className="dispense-label">Dispense:</label>
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-inner">
                            <input
                              value={item.brand || ""}
                              onChange={(e) => updateListItem(setDryFoods, item.id, "brand", e.target.value)}
                              placeholder="Enter dry food brand"
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-inner">
                            <input
                              value={item.amount || ""}
                              onChange={(e) => updateListItem(setDryFoods, item.id, "amount", e.target.value)}
                              placeholder="e.g. 1 cup, 1/2 cup"
                              className="amount-input"
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-inner">
                            <div className="dispense-row">
                              {[
                                ["am", "AM"],
                                ["pm", "PM"],
                                ["lunch", "Lunch"],
                              ].map(([value, label]) => (
                                <label key={value} className="dispense-option">
                                  <input
                                    type="checkbox"
                                    checked={Boolean(item.dispense?.includes?.(value))}
                                    onChange={(e) => {
                                      const current = Array.isArray(item.dispense) ? item.dispense : [];
                                      const next = e.target.checked
                                        ? [...current, value]
                                        : current.filter((v) => v !== value);
                                      updateListItem(setDryFoods, item.id, "dispense", next);
                                    }}
                                  />
                                  {label}
                                </label>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="subsection feeding-subsection with-divider">
                  <div className="subsection-head d-flex justify-content-between align-items-center">
                    <strong className="subsection-title">Wet Food</strong>
                    <button type="button" className="btn btn-primary add-item-btn" onClick={() => addListItem(setWetFoods, "wet")}>Add Wet</button>
                  </div>
                  {wetFoods.map((item, index) => (
                    <div className="item-card mb-3" key={item.id}>
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <div className="item-title">Wet Food #{index + 1}</div>
                        <button type="button" className="btn btn-link p-0 remove-btn" onClick={() => removeListItem(setWetFoods, item.id, "wet")}>x</button>
                      </div>
                      <div className="row g-3">
                        <div className="col-md-4">
                          <div className="form-inner mb-0">
                            <label>Brand:</label>
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-inner mb-0">
                            <label>Amount:</label>
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-inner mb-0">
                            <label className="dispense-label">Dispense:</label>
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-inner">
                            <input
                              value={item.brand || ""}
                              onChange={(e) => updateListItem(setWetFoods, item.id, "brand", e.target.value)}
                              placeholder="Enter wet food brand"
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-inner">
                            <input
                              value={item.amount || ""}
                              onChange={(e) => updateListItem(setWetFoods, item.id, "amount", e.target.value)}
                              placeholder="e.g. 2 Tbsp, 1 container"
                              className="amount-input"
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-inner">
                            <div className="dispense-row">
                              {[
                                ["am", "AM"],
                                ["pm", "PM"],
                                ["lunch", "Lunch"],
                              ].map(([value, label]) => (
                                <label key={value} className="dispense-option">
                                  <input
                                    type="checkbox"
                                    checked={Boolean(item.dispense?.includes?.(value))}
                                    onChange={(e) => {
                                      const current = Array.isArray(item.dispense) ? item.dispense : [];
                                      const next = e.target.checked
                                        ? [...current, value]
                                        : current.filter((v) => v !== value);
                                      updateListItem(setWetFoods, item.id, "dispense", next);
                                    }}
                                  />
                                  {label}
                                </label>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="subsection feeding-subsection with-divider">
                  <div className="subsection-head d-flex justify-content-between align-items-center">
                    <strong className="subsection-title">Medications</strong>
                    <button type="button" className="btn btn-primary add-item-btn" onClick={() => addListItem(setMedications, "med")}>Add Medication</button>
                  </div>
                  {medications.map((item, index) => (
                    <div className="item-card mb-3" key={item.id}>
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <div className="item-title">Medication #{index + 1}</div>
                        <button type="button" className="btn btn-link p-0 remove-btn" onClick={() => removeListItem(setMedications, item.id, "med")}>x</button>
                      </div>
                      <div className="row g-3">
                        <div className="col-md-4">
                          <div className="form-inner mb-0">
                            <label>Medication Name:</label>
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-inner mb-0">
                            <label>Dosage/Instruction:</label>
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-inner mb-0">
                            <label>Meal Condition:</label>
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-inner">
                            <input
                              value={item.name || ""}
                              onChange={(e) => updateListItem(setMedications, item.id, "name", e.target.value)}
                              placeholder="Enter medication name"
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-inner">
                            <input
                              value={item.dosage || ""}
                              onChange={(e) => updateListItem(setMedications, item.id, "dosage", e.target.value)}
                              placeholder="e.g. 1 pill, 2 drops left ear"
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-inner">
                            <select
                              value={item.meal_condition || ""}
                              onChange={(e) => updateListItem(setMedications, item.id, "meal_condition", e.target.value)}
                            >
                              <option value="">Select option</option>
                              <option value="after_meal">After Meal</option>
                              <option value="before_meal">Before Meal</option>
                              <option value="empty_stomach">Empty Stomach</option>
                            </select>
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-inner mb-0">
                            <label className="dispense-label">Dispense:</label>
                          </div>
                        </div>
                        <div className="col-12">
                          <div className="form-inner">
                            <div className="dispense-row">
                              {[
                                ["am", "AM"],
                                ["pm", "PM"],
                                ["rest", "Rest"],
                                ["before_bed", "Before Bed"],
                                ["custom_time", "Custom Time"],
                              ].map(([value, label]) => (
                                <label key={value} className="dispense-option">
                                  <input
                                    type="checkbox"
                                    checked={Boolean(item.dispense?.includes?.(value))}
                                    onChange={(e) => {
                                      const current = Array.isArray(item.dispense) ? item.dispense : [];
                                      const next = e.target.checked
                                        ? [...current, value]
                                        : current.filter((v) => v !== value);
                                      updateListItem(setMedications, item.id, "dispense", next);
                                    }}
                                  />
                                  {label}
                                </label>
                              ))}
                            </div>
                          </div>
                        </div>
                        {Boolean(item.dispense?.includes?.("custom_time")) && (
                          <>
                            <div className="col-md-4">
                              <div className="form-inner mb-0">
                                <label>Custom Time Date:</label>
                              </div>
                            </div>
                            <div className="col-md-4">
                              <div className="form-inner">
                                <input
                                  type="date"
                                  value={item.custom_time_date || ""}
                                  onChange={(e) =>
                                    updateListItem(
                                      setMedications,
                                      item.id,
                                      "custom_time_date",
                                      e.target.value
                                    )
                                  }
                                />
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pre-checkin-panel mt-3 assignment-panel">
                <div className="section-header d-flex justify-content-between align-items-center flex-wrap gap-2">
                  <div className="section-title mb-0">Assignment or location for visit</div>
                </div>
                <div className="pre-checkin-panel assignment-subpanel">
                  <div className="form-inner mb-3">
                    <label>Location type:</label>
                    <div className="location-types">
                      {["Suite", "Run", "Bedroom", "Kennel"].map((option) => (
                        <label key={option}>
                          <input
                            type="radio"
                            name="location_type"
                            value={option}
                            checked={formData.location_type === option}
                            onChange={handleChange}
                          />
                          {option}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="form-inner mb-3">
                    <label>Location details:</label>
                    <textarea
                      rows="2"
                      name="location_details"
                      value={formData.location_details}
                      onChange={handleChange}
                      placeholder="Enter details if needed..."
                      className="details-textarea"
                    />
                  </div>
                  <div className="form-check mb-2">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="rest_required"
                      name="rest_required"
                      checked={formData.rest_required}
                      onChange={handleChange}
                    />
                    <label className="form-check-label ms-2" htmlFor="rest_required">
                      Rest Required (Senior Pet - 16 years old)
                    </label>
                  </div>
                  <div className="form-inner">
                    <label>Rest Note:</label>
                    <textarea
                      rows="2"
                      name="rest_note"
                      value={formData.rest_note}
                      onChange={handleChange}
                      placeholder={formData.rest_required ? "Enter rest note..." : "Check Rest Required to enter note..."}
                      className="details-textarea"
                      disabled={!formData.rest_required}
                    />
                  </div>
                  <div className="row g-3 align-items-end assignment-grid">
                    <div className="col-md-6">
                      <div className="form-inner">
                        <label>Assign Staff (optional)</label>
                        <select name="assigned_staff" value={formData.assigned_staff} onChange={handleChange}>
                          <option value="">-- Select Staff --</option>
                          <option value="Tiny Tinney">Tiny Tinney</option>
                          <option value="Unassigned">Unassigned</option>
                        </select>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-inner">
                        <label>Estimated Price (incl. tax)*</label>
                        <div className="input-group estimated-price-group">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            name="estimated_price"
                            value={formData.estimated_price}
                            onChange={handleChange}
                            className="form-control"
                          />
                          <span className="input-group-text estimated-price-badge">
                            <span>USD</span>
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-inner">
                        <label>Date*</label>
                        <input type="date" name="date" value={formData.date} onChange={handleChange} />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-inner">
                        <label>Start Time*</label>
                        <div className="start-time-wrap">
                          <input
                            type="text"
                            name="start_time"
                            value={formData.start_time}
                            onChange={handleChange}
                            placeholder="HH:MM AM"
                            className="start-time-input"
                          />
                          <i className="bi bi-clock start-time-icon" aria-hidden="true"></i>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="form-inner mt-3">
                    <label>Notes</label>
                    <textarea
                      rows="3"
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      placeholder="Add any notes about the check-in process..."
                      className="notes-textarea"
                    />
                  </div>
                  <div className="alert alert-info border-0 mt-3 mb-0">
                    Estimated price (tax included) is required before continuing. Staff assignment can be added now or later.
                  </div>
                </div>
              </div>

                <div className="pre-checkin-panel mt-3 boarding-panel">
                  <div className="section-header d-flex justify-content-between align-items-center flex-wrap gap-2">
                    <div className="section-title mb-0">Boarding Agreement</div>
                  </div>
                  <div className="pre-checkin-panel">
                    <div className="agreement-box p-3 mb-3">
                      <p className="mb-2"><strong>Release and waiver:</strong> I understand boarding activities carry inherent risks and I release the facility, its owners, and staff from liability except where prohibited by law.</p>
                      <p className="mb-2"><strong>Authorization to treat:</strong> I authorize the facility to arrange reasonable care and treatment for my pet when needed during boarding.</p>
                      <p className="mb-2"><strong>Emergency care consent:</strong> If I cannot be reached promptly, I consent to emergency veterinary care deemed necessary for my pet's welfare.</p>
                      <p className="mb-0"><strong>Facility policy acknowledgement:</strong> I acknowledge and agree to follow the facility's boarding policies, pickup requirements, and payment terms.</p>
                    </div>
                    <div className="d-flex flex-wrap gap-4">
                      <label className="d-flex align-items-center gap-2">
                        <input
                          type="checkbox"
                          name="boarding_agreement"
                          checked={formData.boarding_agreement}
                          onChange={handleChange}
                        />
                        I have read and agree to the boarding agreement
                      </label>
                      <label className="d-flex align-items-center gap-2">
                        <input
                          type="checkbox"
                          name="agreement_treat_vet"
                          checked={formData.agreement_treat_vet}
                          onChange={handleChange}
                        />
                        I authorize the facility to seek veterinary treatment if needed
                      </label>
                    </div>

                    <div className="mt-3 pt-3 border-top">
                      <div className="form-inner owner-name-field">
                        <label>Owner full name:</label>
                        <input
                          name="signature_name"
                          value={formData.signature_name}
                          onChange={handleChange}
                          className="owner-name-input"
                          placeholder=""
                        />
                      </div>
                      <div className="form-inner mt-3">
                        <label>Signature:</label>
                        <div className="signature-canvas-wrap">
                          <canvas
                            ref={signatureCanvasRef}
                            width={900}
                            height={180}
                            className="signature-canvas"
                            onMouseDown={startSignatureDraw}
                            onMouseMove={drawSignature}
                            onMouseUp={endSignatureDraw}
                            onMouseLeave={endSignatureDraw}
                            onTouchStart={(event) => {
                              event.preventDefault();
                              startSignatureDraw(event);
                            }}
                            onTouchMove={(event) => {
                              event.preventDefault();
                              drawSignature(event);
                            }}
                            onTouchEnd={(event) => {
                              event.preventDefault();
                              endSignatureDraw();
                            }}
                          />
                        </div>
                        <div className="mt-2">
                          <button
                            type="button"
                            className="btn btn-outline-secondary"
                            onClick={clearSignature}
                          >
                            Clear Signature
                          </button>
                        </div>
                      </div>
                      <div className="form-inner mt-3">
                        <label>Date:</label>
                        <input
                          type="date"
                          name="signature_date"
                          value={formData.signature_date}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="form-inner mt-3">
                        <label>Appointment Status</label>
                        <select
                          name="appointment_status"
                          value={formData.appointment_status}
                          onChange={handleChange}
                        >
                          <option value="">-- Select Status --</option>
                          {statusOptions.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

              <div className="d-flex justify-content-end mt-4 pb-2">
                <button type="submit" className="btn btn-primary btn-lg px-4" disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save Pre Check-In"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PreCheckIn;