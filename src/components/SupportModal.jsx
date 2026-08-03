import { useEffect, useRef, useState } from "react";
import {
  X,
  LifeBuoy,
  Paperclip,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Trash2,
} from "lucide-react";
import { supportApi, getErrorMessage } from "../services/api";
import "./SupportModal.css";

const CATEGORY_OPTIONS = [
  "Technical Issue",
  "Billing",
  "Sales",
  "Feature Request",
  "Bug Report",
  "General Inquiry",
  "Other",
];

const PRIORITY_OPTIONS = ["Low", "Medium", "High"];

const ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png", "pdf", "txt", "zip"];
const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024;
const MESSAGE_MIN = 20;
const MESSAGE_MAX = 2000;

const emptyForm = {
  name: "",
  email: "",
  company: "",
  subject: "",
  category: "",
  priority: "Medium",
  message: "",
};

function validateForm(form) {
  const errors = {};

  if (!form.name.trim()) errors.name = "Full name is required.";
  if (!form.email.trim()) {
    errors.email = "Email address is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    errors.email = "Enter a valid email address.";
  }
  if (!form.subject.trim()) errors.subject = "Subject is required.";
  if (!form.category) errors.category = "Please select a category.";

  const messageLength = form.message.trim().length;
  if (!messageLength) {
    errors.message = "Message is required.";
  } else if (messageLength < MESSAGE_MIN) {
    errors.message = `Message must be at least ${MESSAGE_MIN} characters (currently ${messageLength}).`;
  } else if (form.message.length > MESSAGE_MAX) {
    errors.message = `Message must be ${MESSAGE_MAX} characters or fewer.`;
  }

  return errors;
}

function validateAttachment(file) {
  if (!file) return "";
  const extension = file.name.split(".").pop()?.toLowerCase();
  if (!extension || !ALLOWED_EXTENSIONS.includes(extension)) {
    return `Unsupported file type. Allowed: ${ALLOWED_EXTENSIONS.join(", ")}.`;
  }
  if (file.size > MAX_ATTACHMENT_BYTES) {
    return "Attachment must be 10 MB or smaller.";
  }
  return "";
}

export default function SupportModal({ isOpen, onClose }) {
  const [form, setForm] = useState(emptyForm);
  const [attachment, setAttachment] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [submitError, setSubmitError] = useState("");
  const [result, setResult] = useState(null);

  const dialogRef = useRef(null);
  const firstFieldRef = useRef(null);
  const fileInputRef = useRef(null);

  const resetForm = () => {
    setForm(emptyForm);
    setAttachment(null);
    setFieldErrors({});
    setTouched({});
    setSubmitError("");
    setUploadProgress(0);
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleClose = () => {
    if (submitting) return;
    onClose?.();
    window.setTimeout(resetForm, 250);
  };

  // Focus first field on open, restore body scroll on close.
  useEffect(() => {
    if (!isOpen) return undefined;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.setTimeout(() => firstFieldRef.current?.focus(), 60);
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  // ESC to close.
  useEffect(() => {
    if (!isOpen) return undefined;
    function handleKeyDown(event) {
      if (event.key === "Escape") {
        handleClose();
      }
      if (event.key === "Tab") {
        trapFocus(event);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, submitting]);

  function trapFocus(event) {
    const focusableSelectors =
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    const container = dialogRef.current;
    if (!container) return;
    const focusable = Array.from(container.querySelectorAll(focusableSelectors)).filter(
      (el) => !el.disabled && el.offsetParent !== null
    );
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  if (!isOpen) return null;

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function markTouched(field) {
    setTouched((current) => ({ ...current, [field]: true }));
    setFieldErrors(validateForm({ ...form }));
  }

  function handleAttachmentChange(event) {
    const file = event.target.files?.[0] || null;
    const error = validateAttachment(file);
    if (error) {
      setFieldErrors((current) => ({ ...current, attachment: error }));
      setAttachment(null);
      event.target.value = "";
      return;
    }
    setFieldErrors((current) => ({ ...current, attachment: "" }));
    setAttachment(file);
  }

  function removeAttachment() {
    setAttachment(null);
    setFieldErrors((current) => ({ ...current, attachment: "" }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (submitting) return;

    const errors = validateForm(form);
    setFieldErrors((current) => ({ ...current, ...errors }));
    setTouched({ name: true, email: true, subject: true, category: true, message: true });

    if (Object.keys(errors).length > 0) return;

    setSubmitting(true);
    setSubmitError("");
    setUploadProgress(0);

    try {
      const data = await supportApi.submitSupportTicket(form, attachment, setUploadProgress);
      setResult({ ticketNumber: data?.ticketNumber || "—" });
    } catch (error) {
      const backendFieldErrors = error?.response?.data?.errors;
      if (backendFieldErrors && typeof backendFieldErrors === "object") {
        setFieldErrors((current) => ({
          ...current,
          ...Object.fromEntries(
            Object.entries(backendFieldErrors).map(([key, value]) => [
              key,
              typeof value === "string" ? value : value?.message || "Invalid value.",
            ])
          ),
        }));
      }
      setSubmitError(
        !error?.response
          ? "Network error — please check your connection and try again."
          : getErrorMessage(error, "Something went wrong while submitting your ticket.")
      );
    } finally {
      setSubmitting(false);
    }
  }

  const messageLength = form.message.length;
  const showError = (field) => touched[field] && fieldErrors[field];

  return (
    <div
      className="support-modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) handleClose();
      }}
    >
      <div
        className="support-modal"
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="support-modal-title"
      >
        <button
          type="button"
          className="support-modal-close"
          onClick={handleClose}
          aria-label="Close support form"
          disabled={submitting}
        >
          <X size={18} />
        </button>

        {!result ? (
          <>
            <div className="support-modal-header">
              <span className="support-modal-icon">
                <LifeBuoy size={22} />
              </span>
              <div>
                <h2 id="support-modal-title">Need Help?</h2>
                <p>Our support team usually replies within 24 hours.</p>
              </div>
            </div>

            <form className="support-modal-form" onSubmit={handleSubmit} noValidate>
              <div className="support-form-grid">
                <label className="support-field">
                  <span>
                    Full Name <em>*</em>
                  </span>
                  <input
                    ref={firstFieldRef}
                    type="text"
                    value={form.name}
                    disabled={submitting}
                    onChange={(event) => updateField("name", event.target.value)}
                    onBlur={() => markTouched("name")}
                    aria-invalid={Boolean(showError("name"))}
                  />
                  {showError("name") && <small className="support-field-error">{fieldErrors.name}</small>}
                </label>

                <label className="support-field">
                  <span>
                    Email Address <em>*</em>
                  </span>
                  <input
                    type="email"
                    value={form.email}
                    disabled={submitting}
                    onChange={(event) => updateField("email", event.target.value)}
                    onBlur={() => markTouched("email")}
                    aria-invalid={Boolean(showError("email"))}
                  />
                  {showError("email") && <small className="support-field-error">{fieldErrors.email}</small>}
                </label>

                <label className="support-field">
                  <span>Company / Organization</span>
                  <input
                    type="text"
                    value={form.company}
                    disabled={submitting}
                    onChange={(event) => updateField("company", event.target.value)}
                  />
                </label>

                <label className="support-field">
                  <span>
                    Subject <em>*</em>
                  </span>
                  <input
                    type="text"
                    value={form.subject}
                    disabled={submitting}
                    onChange={(event) => updateField("subject", event.target.value)}
                    onBlur={() => markTouched("subject")}
                    aria-invalid={Boolean(showError("subject"))}
                  />
                  {showError("subject") && <small className="support-field-error">{fieldErrors.subject}</small>}
                </label>

                <label className="support-field">
                  <span>
                    Category <em>*</em>
                  </span>
                  <select
                    value={form.category}
                    disabled={submitting}
                    onChange={(event) => updateField("category", event.target.value)}
                    onBlur={() => markTouched("category")}
                    aria-invalid={Boolean(showError("category"))}
                  >
                    <option value="">Select a category</option>
                    {CATEGORY_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  {showError("category") && (
                    <small className="support-field-error">{fieldErrors.category}</small>
                  )}
                </label>

                <label className="support-field">
                  <span>Priority</span>
                  <select
                    value={form.priority}
                    disabled={submitting}
                    onChange={(event) => updateField("priority", event.target.value)}
                  >
                    {PRIORITY_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="support-field support-field-wide">
                <span>
                  Message <em>*</em>
                  <i className="support-char-count">
                    {messageLength}/{MESSAGE_MAX}
                  </i>
                </span>
                <textarea
                  rows={5}
                  value={form.message}
                  disabled={submitting}
                  maxLength={MESSAGE_MAX}
                  onChange={(event) => updateField("message", event.target.value)}
                  onBlur={() => markTouched("message")}
                  aria-invalid={Boolean(showError("message"))}
                  placeholder="Tell us what's going on (minimum 20 characters)..."
                />
                {showError("message") && <small className="support-field-error">{fieldErrors.message}</small>}
              </label>

              <label className="support-field support-field-wide">
                <span>Attachment (optional)</span>
                {!attachment ? (
                  <div className="support-attachment-dropzone">
                    <Paperclip size={16} />
                    <span>JPG, PNG, PDF, TXT, or ZIP — up to 10MB</span>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".jpg,.jpeg,.png,.pdf,.txt,.zip"
                      disabled={submitting}
                      onChange={handleAttachmentChange}
                    />
                  </div>
                ) : (
                  <div className="support-attachment-preview">
                    <Paperclip size={16} />
                    <span>{attachment.name}</span>
                    <small>{(attachment.size / (1024 * 1024)).toFixed(2)} MB</small>
                    <button type="button" onClick={removeAttachment} disabled={submitting} aria-label="Remove attachment">
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
                {fieldErrors.attachment && (
                  <small className="support-field-error">{fieldErrors.attachment}</small>
                )}
              </label>

              {submitting && (
                <div className="support-progress-track">
                  <div className="support-progress-fill" style={{ width: `${uploadProgress}%` }} />
                </div>
              )}

              {submitError && (
                <div className="support-submit-error">
                  <AlertTriangle size={16} />
                  <span>{submitError}</span>
                </div>
              )}

              <div className="support-modal-actions">
                <button type="button" className="support-btn-secondary" onClick={handleClose} disabled={submitting}>
                  Cancel
                </button>
                <button type="submit" className="support-btn-primary" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 size={16} className="support-spin" /> Submitting...
                    </>
                  ) : (
                    "Submit Ticket"
                  )}
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="support-success">
            <span className="support-success-icon">
              <CheckCircle2 size={40} />
            </span>
            <h2>Support Ticket Submitted Successfully</h2>
            <p>Your ticket has been received.</p>
            <div className="support-ticket-number">
              <small>Ticket Number</small>
              <strong>{result.ticketNumber}</strong>
            </div>
            <p className="support-success-note">We will contact you soon.</p>
            <div className="support-modal-actions">
              <button type="button" className="support-btn-secondary" onClick={handleClose}>
                Close
              </button>
              <button type="button" className="support-btn-primary" onClick={resetForm}>
                Submit Another Ticket
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}