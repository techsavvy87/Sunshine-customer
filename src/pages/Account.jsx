import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Breadcrumb from "../components/Breadcrumb";
import PasswordSecurity from "../components/PasswordSecurity";
import Invoices from "../components/Invoices";
import MyPackages from "../components/MyPackages";

const Account = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "password";

  const handleTabChange = (tab) => {
    setSearchParams({ tab });
  };

  useEffect(() => {
    // Initialize with default tab if no tab parameter exists
    if (!searchParams.has("tab")) {
      setSearchParams({ tab: "password" }, { replace: true });
    }
  }, []);

  return (
    <div>
      <Breadcrumb pageName="Profile" pageTitle="My Profile" />
      <div className="services-details-area pt-120 mb-70">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div
                className="nav nav2 nav nav-pills"
                role="tablist"
                aria-orientation="vertical"
              >
                <button
                  className={`nav-link ${
                    activeTab === "password" ? "active" : ""
                  }`}
                  onClick={() => handleTabChange("password")}
                  type="button"
                  role="tab"
                  aria-controls="password-security"
                  aria-selected={activeTab === "password"}
                >
                  Password & Security
                </button>
                <button
                  className={`nav-link ${
                    activeTab === "invoices" ? "active" : ""
                  }`}
                  onClick={() => handleTabChange("invoices")}
                  type="button"
                  role="tab"
                  aria-controls="invoices"
                  aria-selected={activeTab === "invoices"}
                >
                  Invoices
                </button>
                <button
                  className={`nav-link ${
                    activeTab === "packages" ? "active" : ""
                  }`}
                  onClick={() => handleTabChange("packages")}
                  type="button"
                  role="tab"
                  aria-controls="pet-profiles"
                  aria-selected={activeTab === "packages"}
                >
                  My Packages
                </button>
              </div>
              <div className="tab-content tab-content2">
                <div
                  className={`tab-pane fade ${
                    activeTab === "password" ? "active show" : ""
                  }`}
                  id="password-security"
                  role="tabpanel"
                  aria-labelledby="password-security-tab"
                >
                  <PasswordSecurity />
                </div>
                <div
                  className={`tab-pane fade ${
                    activeTab === "invoices" ? "active show" : ""
                  }`}
                  id="invoices"
                  role="tabpanel"
                  aria-labelledby="invoices-tab"
                >
                  <Invoices />
                </div>
                <div
                  className={`tab-pane fade ${
                    activeTab === "packages" ? "active show" : ""
                  }`}
                  id="pet-profiles"
                  role="tabpanel"
                  aria-labelledby="pet-profiles-tab"
                >
                  <MyPackages />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Account;
