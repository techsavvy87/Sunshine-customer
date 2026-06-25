import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import Breadcrumb from "../components/Breadcrumb";
import PageLoader from "../components/PageLoader";
import { post } from "../utils/axios";
import DefaultUserAvatar from "/assets/images/pp-default-user-avatar.jpg";

function Notifications() {
  const user = useSelector((state) => state.auth.user);
  const [isLoading, setIsLoading] = useState(true);
  const [isTogglingId, setIsTogglingId] = useState(null);
  const [isDeletingId, setIsDeletingId] = useState(null);
  const [allNotifications, setAllNotifications] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 5,
    total: 0,
  });

  const fetchNotifications = async (
    targetPage = 1,
    targetLimit = 10,
    options = {}
  ) => {
    const { silent = false } = options;

    if (!user?.id) {
      setAllNotifications([]);
      setPagination({ page: targetPage, limit: targetLimit, total: 0 });
      setIsLoading(false);
      return;
    }

    if (!silent) {
      setIsLoading(true);
    }
    try {
      const response = await post("/notifications/all", {
        user_id: user.id,
        page: targetPage,
        limit: targetLimit,
      });

      const notifications = response?.data?.notifications;
      const paginationData = response?.data?.pagination;
      const normalizedNotifications = Array.isArray(notifications)
        ? notifications
        : [];

      setAllNotifications(normalizedNotifications);
      setPagination({
        page: paginationData?.page || targetPage,
        limit: paginationData?.limit || targetLimit,
        total:
          typeof paginationData?.total === "number"
            ? paginationData.total
            : normalizedNotifications.length,
      });
    } catch (error) {
      console.error("Failed to load notifications:", error);
      setAllNotifications([]);
      setPagination({ page: targetPage, limit: targetLimit, total: 0 });
    } finally {
      if (!silent) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchNotifications(pagination.page, pagination.limit);
  }, [user?.id, pagination.page, pagination.limit]);

  useEffect(() => {
    const handleRefreshPage = () => {
      fetchNotifications(pagination.page, pagination.limit, { silent: true });
    };

    window.addEventListener("notifications:refresh-page", handleRefreshPage);

    return () => {
      window.removeEventListener(
        "notifications:refresh-page",
        handleRefreshPage
      );
    };
  }, [user?.id, pagination.page, pagination.limit]);

  const formatDate = (value) => {
    if (!value) return "-";
    // Backend sends UTC timestamps as "YYYY-MM-DD HH:mm:ss"; append "Z" so the
    // browser parses as UTC and converts to the user's local timezone correctly.
    const normalized =
      typeof value === "string" && value.includes(" ")
        ? value.replace(" ", "T") + "Z"
        : value;
    const date = new Date(normalized);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const isNotificationRead = (item) =>
    item?.is_read === true ||
    item?.isRead === true ||
    item?.read === true ||
    item?.status === "read";

  const getStatusLabel = (item) => {
    const isRead = isNotificationRead(item);

    return isRead ? "Read" : "Unread";
  };

  const getSenderImage = (item) => {
    const image =
      item?.sender_image ||
      item?.sender?.image ||
      item?.sender?.avatar ||
      item?.admin_image ||
      "";

    if (!image || image === "null" || image === "undefined") {
      return DefaultUserAvatar;
    }

    return image;
  };

  const filteredNotifications = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    if (!normalizedQuery) {
      return allNotifications;
    }

    return allNotifications.filter((item) => {
      const status = getStatusLabel(item).toLowerCase();
      const searchableText = [
        item?.sender || "",
        item?.message || "",
        item?.created_at || "",
        formatDate(item?.created_at),
        status,
      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(normalizedQuery);
    });
  }, [allNotifications, searchQuery]);

  const totalPages = Math.max(
    1,
    Math.ceil((pagination.total || 0) / (pagination.limit || 10))
  );

  const handlePageChange = (nextPage) => {
    if (nextPage < 1 || nextPage > totalPages || nextPage === pagination.page) {
      return;
    }

    setPagination((prev) => ({ ...prev, page: nextPage }));
  };

  const handleToggleNotificationStatus = async (item) => {
    if (
      !item?.id ||
      !user?.id ||
      isTogglingId === item.id ||
      isDeletingId === item.id
    ) {
      return;
    }

    setIsTogglingId(item.id);
    try {
      await post("/notifications/toggle-status", {
        notification_id: item.id,
        id: item.id,
        user_id: user.id,
      });

      await fetchNotifications(pagination.page, pagination.limit, {
        silent: true,
      });

      window.dispatchEvent(new Event("notifications:refresh-menu"));
    } catch (error) {
      console.error("Failed to toggle notification status:", error);
    } finally {
      setIsTogglingId(null);
    }
  };

  const handleDeleteNotification = async (item) => {
    if (!item?.id || !user?.id || isDeletingId === item.id) {
      return;
    }

    setIsDeletingId(item.id);

    try {
      await post("/notifications/delete", {
        notification_id: item.id
      });

      setAllNotifications((prev) =>
        prev.filter((notification) => notification.id !== item.id)
      );
      setPagination((prev) => ({
        ...prev,
        total: Math.max(0, (prev.total || 0) - 1),
      }));

      await fetchNotifications(pagination.page, pagination.limit, {
        silent: true,
      });

      window.dispatchEvent(new Event("notifications:refresh-menu"));
    } catch (error) {
      console.error("Failed to delete notification:", error);
    } finally {
      setIsDeletingId(null);
    }
  };

  return (
    <div>
      <Breadcrumb pageName="Notifications" pageTitle="Notifications" />
      {isLoading ? (
        <PageLoader />
      ) : (
        <div className="notifications-page pt-120 mb-120">
          <div className="container">
            <div className="notifications-table-wrap">
              <div className="notifications-toolbar">
                <div className="notifications-search">
                  <span className="notifications-search-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none">
                      <path
                        d="M21 21L16.65 16.65M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  <input
                    type="search"
                    className="notifications-search-input"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                  />
                  {searchQuery.trim() && (
                    <button
                      type="button"
                      className="notifications-search-clear"
                      onClick={() => setSearchQuery("")}
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              <div className="notification-table-responsive table-responsive">
                <table className="table notifications-table align-middle mb-0">
                  <thead>
                    <tr>
                      <th>No</th>
                      <th>Sender</th>
                      <th>Message</th>
                      <th>Created Date</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredNotifications.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="text-center py-5">
                          <div className="notifications-empty-state">
                            <h6>No notifications found.</h6>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredNotifications.map((item, index) => {
                        const isRead = isNotificationRead(item);
                        const isRowBusy =
                          isTogglingId === item.id || isDeletingId === item.id;
                        const statusText = isRead ? "Read" : "Unread";
                        return (
                          <tr
                            key={item.id || index}
                            className={isRowBusy ? "notification-row-loading" : ""}
                          >
                            <td className="notification-serial">
                              {(pagination.page - 1) * pagination.limit + index + 1}
                            </td>
                            <td>
                              <div className="notification-sender-cell">
                                <img
                                  src={getSenderImage(item)}
                                  alt="Sender Avatar"
                                  className="notification-sender-thumb"
                                  onError={(event) => {
                                    event.currentTarget.src = DefaultUserAvatar;
                                  }}
                                />
                                <span>{item.sender || "-"}</span>
                              </div>
                            </td>
                            <td className="notification-message-cell">{item.message || "-"}</td>
                            <td className="notification-date-cell">{formatDate(item.created_at)}</td>
                            <td className="notification-status-cell">
                              <span
                                className={`notification-status-text ${
                                  isRead
                                    ? "notification-status-read-text"
                                    : "notification-status-unread-text"
                                }`}
                              >
                                {statusText}
                              </span>
                            </td>
                            <td className="notification-actions-cell">
                              <div className="notification-actions-wrap">
                                <button
                                  type="button"
                                  className={`notification-action-icon notification-eye-icon ${
                                    isRead
                                      ? "notification-eye-icon-read"
                                      : "notification-eye-icon-unread"
                                  }`}
                                  disabled={isRowBusy}
                                  onClick={() => handleToggleNotificationStatus(item)}
                                  aria-label={
                                    isRead
                                      ? "Mark notification as unread"
                                      : "Mark notification as read"
                                  }
                                  title={
                                    isRead
                                      ? "Mark as unread"
                                      : "Mark as read"
                                  }
                                >
                                  <i
                                    className={`bi ${
                                      isRead ? "bi-eye-slash" : "bi-eye"
                                    }`}
                                  />
                                </button>
                                <button
                                  type="button"
                                  className="notification-action-icon notification-delete-icon"
                                  disabled={isRowBusy}
                                  onClick={() => handleDeleteNotification(item)}
                                  aria-label="Delete notification"
                                  title="Delete"
                                >
                                  <i className="bi bi-trash" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              <div className="notification-pagination-wrap">
                <button
                  type="button"
                  className="notification-pagination-btn"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                >
                  Previous
                </button>

                <span className="notification-pagination-text">
                  Page {pagination.page} of {totalPages}
                </span>

                <button
                  type="button"
                  className="notification-pagination-btn"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= totalPages}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Notifications;
