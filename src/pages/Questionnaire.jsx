import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { post } from "../utils/axios";
import PageLoader from "../components/PageLoader";
import QuestionnaireGroom from "../components/QuestionnaireGroom";
import QuestionnaireTraining from "../components/QuestionnaireTraining";
import QuestionnaireDaycare from "../components/QuestionnaireDaycare";
import Breadcrumb from "../components/Breadcrumb";

const Questionnaire = () => {
  const { petId } = useParams();
  const navigate = useNavigate();

  const [questionnaires, setQuestionnaires] = useState([]);
  const [pet, setPet] = useState(null);
  const [serviceCategories, setServiceCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);

  useEffect(() => {
    getQuestionnaire();
  }, [petId]);

  const getQuestionnaire = async () => {
    const data = {
      pet_id: petId,
    };

    setIsLoading(true);
    try {
      const res = await post("/questionnaire/detail", data);
      if (res.data.status) {
        const resultData = res.data.result;
        setQuestionnaires(resultData.questionnaires || []);
        setPet(resultData.pet || null);
        setServiceCategories(resultData.service_categories || []);
        setSelectedCategoryId(resultData.service_categories[0]?.id || null);
      }
    } catch (err) {
      console.error("Error fetching service details:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <Breadcrumb pageName="Questionnaire" pageTitle="Questionnaire" />
      {isLoading ? (
        <PageLoader />
      ) : (
        <div className="gallery-pages pt-70 mb-120">
          <div className="container-fluid">
            <div className="row">
              <div className="col-lg-12 d-flex justify-content-center">
                <div className="filters filter-button-group">
                  <ul className="d-flex justify-content-center flex-wrap">
                    {serviceCategories.map((category) => (
                      <li
                        key={category.id}
                        className={
                          selectedCategoryId === category.id ? "active" : ""
                        }
                        onClick={() => setSelectedCategoryId(category.id)}
                      >
                        {category.name}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-lg-11">
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
              </div>
            </div>
            {serviceCategories.find(
              (category) => category.id === selectedCategoryId
            )?.name === "Grooming" && (
              <QuestionnaireGroom
                questionnaire={questionnaires.find(
                  (q) => q.service_category_id === selectedCategoryId
                )}
                pet={pet}
                serviceCategoryId={selectedCategoryId}
                refresh={() => getQuestionnaire()}
              />
            )}
            {serviceCategories.find(
              (category) => category.id === selectedCategoryId
            )?.name === "Daycare" && (
              <QuestionnaireDaycare
                questionnaire={questionnaires.find(
                  (q) => q.service_category_id === selectedCategoryId
                )}
                pet={pet}
                serviceCategoryId={selectedCategoryId}
                refresh={() => getQuestionnaire()}
              />
            )}
            {serviceCategories.find(
              (category) => category.id === selectedCategoryId
            )?.name === "Boarding" && (
              <QuestionnaireDaycare
                questionnaire={questionnaires.find(
                  (q) => q.service_category_id === selectedCategoryId
                )}
                pet={pet}
                serviceCategoryId={selectedCategoryId}
                refresh={() => getQuestionnaire()}
              />
            )}
            {serviceCategories.find(
              (category) => category.id === selectedCategoryId
            )?.name === "Training" && (
              <QuestionnaireTraining
                questionnaire={questionnaires.find(
                  (q) => q.service_category_id === selectedCategoryId
                )}
                pet={pet}
                serviceCategoryId={selectedCategoryId}
                refresh={() => getQuestionnaire()}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Questionnaire;
