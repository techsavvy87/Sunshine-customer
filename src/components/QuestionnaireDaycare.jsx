import { useState } from "react";
import toast from "react-hot-toast";
import QuestionnairePrimaryInputs from "./QuestionnairePrimaryInputs";
import QuestionnaireSecondaryInputs from "./QuestionnaireSecondaryInputs";
import { post } from "../utils/axios";

const QuestionnaireDaycare = ({
  questionnaire,
  pet,
  serviceCategoryId,
  refresh,
}) => {
  const data = questionnaire
    ? JSON.parse(questionnaire.questions_answers)
    : null;

  const [questionnaireId, setQuestionnaireId] = useState(questionnaire?.id);
  const questionnaireStatus = questionnaire?.status || "missing";
  const [socialPeople, setSocialPeople] = useState(data?.social_people || "");
  const [socialPets, setSocialPets] = useState(data?.social_pets || "");
  const [crateTrained, setCrateTrained] = useState(data?.crate_trained || "");
  const [visitParks, setVisitParks] = useState(data?.visit_parks || "");
  const [boarded, setBoarded] = useState(data?.boarded || "");
  const [attended, setAttended] = useState(data?.attended || "");
  const [additionalComments, setAdditionalComments] = useState(
    data?.additional_comments || ""
  );
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (
      !socialPeople ||
      !socialPets ||
      !crateTrained ||
      !visitParks ||
      !boarded ||
      !attended
    ) {
      toast.error("Please fill in all required fields.");
      return;
    }

    const questionnaireData = {
      social_people: socialPeople,
      social_pets: socialPets,
      crate_trained: crateTrained,
      visit_parks: visitParks,
      boarded: boarded,
      attended: attended,
      additional_comments: additionalComments,
    };

    const data = {
      questionnaire_id: questionnaireId,
      pet_id: pet.id,
      service_category_id: serviceCategoryId,
      questions_answers: JSON.stringify(questionnaireData),
    };

    setLoading(true);
    try {
      const res = await post("/questionnaire/save", data);
      if (res.data.status) {
        toast.success(
          questionnaireId
            ? "Questionnaire has been updated!"
            : "Questionnaire has been submitted!"
        );
        setQuestionnaireId(res.data.result.id);
        refresh();
      } else {
        toast.error("Questionnaire failed. Please try again.");
      }
    } catch (err) {
      console.error("Error submitting questionnaire:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container checkout-section">
      <div className="payment-form">
        <div className="form-wrap box--shadow payment-methods">
          <div className="d-flex justify-content-between align-items-center">
            <div className="form-inner">
              <label>Pet Name</label>
              <span className="fs-4 ms-3">{pet?.name}</span>
            </div>
            <div className="form-inner me-4">
              <h4 className="text-warning fw-bolder">
                {questionnaireStatus.charAt(0).toLocaleUpperCase() +
                  questionnaireStatus.slice(1)}
              </h4>
            </div>
          </div>
          <div className="form-inner mb-0">
            <label>Tell us more about your dog: </label>
          </div>
          <div className="row px-3 pt-2">
            <div className="col-md-6">
              <QuestionnaireSecondaryInputs
                id="socialPeople"
                title="Around people *"
                values={[
                  "My dog loves people",
                  "My dog can be shy around new people",
                  "My dog prefers not to meet people",
                ]}
                selectedValue={socialPeople}
                onChangeValue={setSocialPeople}
              />
            </div>
            <div className="col-md-6">
              <QuestionnaireSecondaryInputs
                id="socialPets"
                title="Around other pets *"
                values={[
                  "My dog loves other pets",
                  "Can be selective about making new friends",
                  "Prefers to be alone",
                ]}
                selectedValue={socialPets}
                onChangeValue={setSocialPets}
              />
            </div>
            <div className="col-md-6 mb-3">
              <QuestionnairePrimaryInputs
                id="crateTrained"
                title="My dog is crate trained *"
                values={["yes", "no"]}
                selectedValue={crateTrained}
                onChangeValue={setCrateTrained}
                classes="ms-4"
              />
            </div>
            <div className="col-md-6 mb-3">
              <QuestionnairePrimaryInputs
                id="visitParks"
                title="My dog visits dog parks *"
                values={["yes", "no"]}
                selectedValue={visitParks}
                onChangeValue={setVisitParks}
                classes="ms-4"
              />
            </div>
            <div className="col-md-6">
              <QuestionnairePrimaryInputs
                id="boarded"
                title="My dog has boarded at another facility *"
                values={["yes", "no"]}
                selectedValue={boarded}
                onChangeValue={setBoarded}
                classes="ms-4"
              />
            </div>
            <div className="col-md-6">
              <QuestionnairePrimaryInputs
                id="attended"
                title="My dog has attended daycare at another facility *"
                values={["yes", "no"]}
                selectedValue={attended}
                onChangeValue={setAttended}
                classes="ms-4"
              />
            </div>
          </div>
          <div className="form-inner my-3">
            <label>Addtional Comments (optional):</label>
            <textarea
              value={additionalComments}
              onChange={(e) => setAdditionalComments(e.target.value)}
              rows={3}
            />
          </div>
          {(questionnaireStatus === "missing" ||
            questionnaireStatus === "rejected") && (
            <div className="text-center mt-4">
              <div className="reservation-btn">
                <button
                  className="primary-btn1 form-btn"
                  style={{ padding: "8px 36px" }}
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading && (
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                      style={{ marginBottom: 2 }}
                    ></span>
                  )}
                  {loading
                    ? "Loading..."
                    : questionnaireId
                    ? "Update"
                    : "Submit"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuestionnaireDaycare;
