import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Breadcrumb from "../components/Breadcrumb";
import PersonalProfile from "../components/PersonalProfile";
import AdditionalOwners from "../components/AdditionalOwners";
import PetProfiles from "../components/PetProfiles";

function Profile() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "personal";

  const handleTabChange = (tab) => {
    setSearchParams({ tab });
  };

  useEffect(() => {
    // Initialize with default tab if no tab parameter exists
    if (!searchParams.has("tab")) {
      setSearchParams({ tab: "personal" }, { replace: true });
    }
  }, []);

  return (
    <div>
      <Breadcrumb pageName="Profile" pageTitle="My Profile" />
      <div className="services-details-area pt-120 mb-120">
        <div className="container">
          <div className="row mb-120">
            <div className="col-lg-12">
              <div
                className="nav nav2 nav nav-pills"
                role="tablist"
                aria-orientation="vertical"
              >
                <button
                  className={`nav-link ${
                    activeTab === "personal" ? "active" : ""
                  }`}
                  onClick={() => handleTabChange("personal")}
                  type="button"
                  role="tab"
                  aria-controls="personal-profile"
                  aria-selected={activeTab === "personal"}
                >
                  Personal Profile
                </button>
                <button
                  className={`nav-link ${
                    activeTab === "owners" ? "active" : ""
                  }`}
                  onClick={() => handleTabChange("owners")}
                  type="button"
                  role="tab"
                  aria-controls="additional-owners"
                  aria-selected={activeTab === "owners"}
                >
                  Additional Owners
                </button>
                <button
                  className={`nav-link ${activeTab === "pets" ? "active" : ""}`}
                  onClick={() => handleTabChange("pets")}
                  type="button"
                  role="tab"
                  aria-controls="pet-profiles"
                  aria-selected={activeTab === "pets"}
                >
                  Pet Profiles
                </button>
              </div>
              <div className="tab-content tab-content2">
                <div
                  className={`tab-pane fade ${
                    activeTab === "personal" ? "active show" : ""
                  }`}
                  id="personal-profile"
                  role="tabpanel"
                  aria-labelledby="personal-profile-tab"
                >
                  <PersonalProfile />
                </div>
                <div
                  className={`tab-pane fade ${
                    activeTab === "owners" ? "active show" : ""
                  }`}
                  id="additional-owners"
                  role="tabpanel"
                  aria-labelledby="additional-owners-tab"
                >
                  <AdditionalOwners />
                </div>
                <div
                  className={`tab-pane fade ${
                    activeTab === "pets" ? "active show" : ""
                  }`}
                  id="pet-profiles"
                  role="tabpanel"
                  aria-labelledby="pet-profiles-tab"
                >
                  <PetProfiles />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
