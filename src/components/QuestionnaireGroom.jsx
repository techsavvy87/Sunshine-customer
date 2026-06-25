import { useState } from "react";
import toast from "react-hot-toast";
import QuestionnairePrimaryInputs from "./QuestionnairePrimaryInputs";
import QuestionnaireSecondaryInputs from "./QuestionnaireSecondaryInputs";
import { post } from "../utils/axios";

const QuestionnaireGroom = ({
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
  const [groomedBefore, setGroomedBefore] = useState(
    data?.groomed_before || ""
  );
  const [groomedBeforeDetail, setGroomedBeforeDetail] = useState(
    data?.groomed_before_detail || ""
  );
  const [socialPeople, setSocialPeople] = useState(data?.social_people || "");
  const [socialPets, setSocialPets] = useState(data?.social_pets || "");
  const [crateTrained, setCrateTrained] = useState(data?.crate_trained || "");
  const [physicalIssues, setPhysicalIssues] = useState(
    data?.physical_issues || ""
  );
  const [physicalIssuesDetail, setPhysicalIssuesDetail] = useState(
    data?.physical_issues_detail || ""
  );
  const [medications, setMedications] = useState(data?.medications || "");
  const [medicationsDetail, setMedicationsDetail] = useState(
    data?.medications_detail || ""
  );
  const [additionalNote, setAdditionalNote] = useState(
    data?.additional_note || ""
  );
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (
      !groomedBefore ||
      !socialPeople ||
      !socialPets ||
      !crateTrained ||
      !physicalIssues ||
      !medications
    ) {
      toast.error("Please fill in all required fields.");
      return;
    }

    const questionnaireData = {
      groomed_before: groomedBefore,
      groomed_before_detail: groomedBeforeDetail,
      social_people: socialPeople,
      social_pets: socialPets,
      crate_trained: crateTrained,
      physical_issues: physicalIssues,
      physical_issues_detail: physicalIssuesDetail,
      medications: medications,
      medications_detail: medicationsDetail,
      additional_note: additionalNote,
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
          <QuestionnairePrimaryInputs
            id="groomedBefore"
            title="1. Has your pet been groomed before? *"
            values={["yes", "no"]}
            selectedValue={groomedBefore}
            onChangeValue={setGroomedBefore}
            textTitle="If yes, tell us where you have groomed previously"
            textValue={groomedBeforeDetail}
            onChangeTextValue={setGroomedBeforeDetail}
          />
          <div className="form-inner mb-0">
            <label>2. Tell us more about your dog: </label>
          </div>
          <div className="row">
            <div className="col-md-4">
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
                classes="ms-4"
              />
            </div>
            <div className="col-md-4">
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
                classes="ms-4"
              />
            </div>
            <div className="col-md-4">
              <QuestionnaireSecondaryInputs
                id="crateTrained"
                title="My dog is crate trained *"
                values={["yes", "no"]}
                selectedValue={crateTrained}
                onChangeValue={setCrateTrained}
                classes="ms-4"
              />
            </div>
          </div>
          <QuestionnairePrimaryInputs
            id="physicalIssues"
            title="3. Are there any physical issues or concerns we should be aware of? *"
            values={["yes", "no"]}
            selectedValue={physicalIssues}
            onChangeValue={setPhysicalIssues}
            textTitle="If yes, please tell us about them"
            textValue={physicalIssuesDetail}
            onChangeTextValue={setPhysicalIssuesDetail}
          />
          <QuestionnairePrimaryInputs
            id="medications"
            title="4. Is your dog taking any medications? *"
            values={["yes", "no"]}
            selectedValue={medications}
            onChangeValue={setMedications}
            textTitle="If yes, what are they?"
            textValue={medicationsDetail}
            onChangeTextValue={setMedicationsDetail}
          />
          <div className="form-inner">
            <label>
              5. Is there anything else you want us to know about your dog?
            </label>
            <textarea
              value={additionalNote}
              onChange={(e) => setAdditionalNote(e.target.value)}
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

export default QuestionnaireGroom;
