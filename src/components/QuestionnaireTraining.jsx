import { useState } from "react";
import toast from "react-hot-toast";
import QuestionnairePrimaryInputs from "./QuestionnairePrimaryInputs";
import { post } from "../utils/axios";

const QuestionnaireTraining = ({
  questionnaire,
  pet,
  serviceCategoryId,
  refresh,
}) => {
  const questionnaireStatus = questionnaire?.status || "missing";
  const data = questionnaire
    ? JSON.parse(questionnaire.questions_answers)
    : null;

  const [questionnaireId, setQuestionnaireId] = useState(questionnaire?.id);
  const [primaryIssue, setPrimaryIssue] = useState(data?.primary_issue || "");
  const [whenOccurs, setWhenOccurs] = useState(data?.when_occurs || "");
  const [consistent, setConsistent] = useState(data?.consistent || "");
  const [receivedTraining, setReceivedTraining] = useState(
    data?.received_training || []
  );
  const [improvementAfterTraining, setImprovementAfterTraining] = useState(
    data?.improvement_after_training || ""
  );
  const [ageWhenReceived, setAgeWhenReceived] = useState(
    data?.age_when_received || ""
  );
  const [howAcquired, setHowAcquired] = useState(data?.how_acquired || "");
  const [whereSleeps, setWhereSleeps] = useState(data?.where_sleeps || "");
  const [wakeUpTime, setWakeUpTime] = useState(data?.wake_up_time || "");
  const [bathroomTime, setBathroomTime] = useState(data?.bathroom_time || "");
  const [takesWalks, setTakesWalks] = useState(data?.takes_walks || "");
  const [fencedYard, setFencedYard] = useState(data?.fenced_yard || "");
  const [exerciseType, setExerciseType] = useState(data?.exercise_type || "");
  const [eatingTimes, setEatingTimes] = useState(data?.eating_times || []);
  const [eatingStyle, setEatingStyle] = useState(data?.eating_style || "");
  const [householdMembers, setHouseholdMembers] = useState(
    data?.household_members || []
  );
  const [gettingAlong, setGettingAlong] = useState(data?.getting_along || "");
  const [whoCaresForPet, setWhoCaresForPet] = useState(
    data?.who_cares_for_pet || ""
  );
  const [doYouWork, setDoYouWork] = useState(data?.do_you_work || "");
  const [petDailyActivities, setPetDailyActivities] = useState(
    data?.pet_daily_activities || ""
  );
  const [whoLetsOut, setWhoLetsOut] = useState(data?.who_lets_out || "");
  const [withUnknownPeople, setWithUnknownPeople] = useState(
    data?.with_unknown_people || ""
  );
  const [everBittenSomeone, setEverBittenSomeone] = useState(
    data?.ever_bitten_someone || ""
  );
  const [triedToBite, setTriedToBite] = useState(data?.tried_to_bite || "");
  const [withUnknownDogs, setWithUnknownDogs] = useState(
    data?.with_unknown_dogs || ""
  );
  const [foughtWithDogs, setFoughtWithDogs] = useState(
    data?.fought_with_dogs || ""
  );
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!primaryIssue) {
      toast.error("Please fill in all required fields.");
      return;
    }

    const questionnaireData = {
      primary_issue: primaryIssue,
      when_occurs: whenOccurs,
      consistent: consistent,
      received_training: receivedTraining,
      improvement_after_training: improvementAfterTraining,
      age_when_received: ageWhenReceived,
      how_acquired: howAcquired,
      where_sleeps: whereSleeps,
      wake_up_time: wakeUpTime,
      bathroom_time: bathroomTime,
      takes_walks: takesWalks,
      fenced_yard: fencedYard,
      exercise_type: exerciseType,
      eating_times: eatingTimes,
      eating_style: eatingStyle,
      household_members: householdMembers,
      getting_along: gettingAlong,
      who_cares_for_pet: whoCaresForPet,
      do_you_work: doYouWork,
      pet_daily_activities: petDailyActivities,
      who_lets_out: whoLetsOut,
      with_unknown_people: withUnknownPeople,
      ever_bitten_someone: everBittenSomeone,
      tried_to_bite: triedToBite,
      with_unknown_dogs: withUnknownDogs,
      fought_with_dogs: foughtWithDogs,
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
          <div className="row">
            <div className="col-md-6">
              <div className="form-inner mb-0">
                <label>What is the primary issue? *</label>
              </div>
              <div className="form-inner ms-2">
                <input
                  type="text"
                  value={primaryIssue}
                  onChange={(e) => setPrimaryIssue(e.target.value)}
                  placeholder="Type here"
                  className="w-100"
                />
              </div>
            </div>
            <div className="col-md-6">
              <div className="form-inner mb-0">
                <label>When does it occur?</label>
              </div>
              <div className="form-inner ms-2">
                <input
                  type="text"
                  value={whenOccurs}
                  onChange={(e) => setWhenOccurs(e.target.value)}
                  placeholder="Type here"
                  className="w-100"
                />
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-md-3">
              <QuestionnairePrimaryInputs
                id="consistent"
                title="Does it happen consistently?"
                values={["yes", "no"]}
                selectedValue={consistent}
                onChangeValue={setConsistent}
                textTitle=""
                textValue=""
                onChangeTextValue={() => {}}
              />
            </div>
            <div className="col-md-5">
              <div className="form-inner mb-0">
                <label>Has your dog received any training?</label>
              </div>
              <div className="form-inner ms-2 d-flex gap-4 flex-wrap">
                <div className="d-flex align-items-center">
                  <input
                    type="checkbox"
                    id="received_training_private"
                    value="private"
                    checked={receivedTraining.includes("private")}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setReceivedTraining([...receivedTraining, "private"]);
                      } else {
                        setReceivedTraining(
                          receivedTraining.filter((item) => item !== "private")
                        );
                      }
                    }}
                    style={{
                      marginRight: "8px",
                      width: "18px",
                      height: "18px",
                      flexShrink: 0,
                      accentColor: "#848484",
                    }}
                  />
                  <label
                    htmlFor="received_training_private"
                    style={{ marginBottom: 0 }}
                  >
                    Private
                  </label>
                </div>
                <div className="d-flex align-items-center">
                  <input
                    type="checkbox"
                    id="received_training_group"
                    value="group classes"
                    checked={receivedTraining.includes("group classes")}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setReceivedTraining([
                          ...receivedTraining,
                          "group classes",
                        ]);
                      } else {
                        setReceivedTraining(
                          receivedTraining.filter(
                            (item) => item !== "group classes"
                          )
                        );
                      }
                    }}
                    style={{
                      marginRight: "8px",
                      width: "18px",
                      height: "18px",
                      flexShrink: 0,
                      accentColor: "#848484",
                    }}
                  />
                  <label
                    htmlFor="received_training_group"
                    style={{ marginBottom: 0 }}
                  >
                    Group Classes
                  </label>
                </div>
                <div className="d-flex align-items-center">
                  <input
                    type="checkbox"
                    id="received_training_board"
                    value="board"
                    checked={receivedTraining.includes("board")}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setReceivedTraining([...receivedTraining, "board"]);
                      } else {
                        setReceivedTraining(
                          receivedTraining.filter((item) => item !== "board")
                        );
                      }
                    }}
                    style={{
                      marginRight: "8px",
                      width: "18px",
                      height: "18px",
                      flexShrink: 0,
                      accentColor: "#848484",
                    }}
                  />
                  <label
                    htmlFor="received_training_board"
                    style={{ marginBottom: 0 }}
                  >
                    Board
                  </label>
                </div>
                <div className="d-flex align-items-center">
                  <input
                    type="checkbox"
                    id="received_training_train"
                    value="train"
                    checked={receivedTraining.includes("train")}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setReceivedTraining([...receivedTraining, "train"]);
                      } else {
                        setReceivedTraining(
                          receivedTraining.filter((item) => item !== "train")
                        );
                      }
                    }}
                    style={{
                      marginRight: "8px",
                      width: "18px",
                      height: "18px",
                      flexShrink: 0,
                      accentColor: "#848484",
                    }}
                  />
                  <label
                    htmlFor="received_training_train"
                    style={{ marginBottom: 0 }}
                  >
                    Train
                  </label>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <QuestionnairePrimaryInputs
                id="improvementAfterTraining"
                title="Did you see improvement after training?"
                values={["yes", "no"]}
                selectedValue={improvementAfterTraining}
                onChangeValue={setImprovementAfterTraining}
                textTitle=""
                textValue=""
                onChangeTextValue={() => {}}
              />
            </div>
          </div>
          <div className="row">
            <div className="col-md-6">
              <div className="form-inner mb-0">
                <label>How old was your pet when you received them?</label>
              </div>
              <div className="form-inner ms-2">
                <input
                  type="number"
                  value={ageWhenReceived}
                  onChange={(e) => setAgeWhenReceived(e.target.value)}
                  placeholder="Type here"
                  className="w-100"
                  min="0"
                  step="1"
                />
              </div>
            </div>
            <div className="col-md-6">
              <div className="form-inner mb-0">
                <label>How were they acquired?</label>
              </div>
              <div className="form-inner ms-2">
                <input
                  type="text"
                  value={howAcquired}
                  onChange={(e) => setHowAcquired(e.target.value)}
                  placeholder="Type here"
                  className="w-100"
                />
              </div>
            </div>
          </div>

          <div className="divider my-4">
            <span className="fs-5 fw-semibold">Daily schedule</span>
          </div>

          <div className="row">
            <div className="col-md-4">
              <div className="form-inner mb-0">
                <label>Where does your pet sleep?</label>
              </div>
              <div className="form-inner ms-2">
                <input
                  type="text"
                  value={whereSleeps}
                  onChange={(e) => setWhereSleeps(e.target.value)}
                  placeholder="Type here"
                  className="w-100"
                />
              </div>
            </div>
            <div className="col-md-4">
              <div className="form-inner mb-0">
                <label>What time does your pet wake up in the morning?</label>
              </div>
              <div className="form-inner ms-2">
                <input
                  type="time"
                  value={wakeUpTime}
                  onChange={(e) => setWakeUpTime(e.target.value)}
                  className="w-100"
                />
              </div>
            </div>
            <div className="col-md-4">
              <div className="form-inner mb-0">
                <label>When do they go out to the bathroom?</label>
              </div>
              <div className="form-inner ms-2">
                <input
                  type="text"
                  value={bathroomTime}
                  onChange={(e) => setBathroomTime(e.target.value)}
                  placeholder="Type here"
                  className="w-100"
                />
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-md-4">
              <QuestionnairePrimaryInputs
                id="takesWalks"
                title="Do you take your pet for walks?"
                values={["yes", "no"]}
                selectedValue={takesWalks}
                onChangeValue={setTakesWalks}
                textTitle=""
                textValue=""
                onChangeTextValue={() => {}}
              />
            </div>
            <div className="col-md-4">
              <QuestionnairePrimaryInputs
                id="fencedYard"
                title="Does your pet have a fenced yard?"
                values={["yes", "no"]}
                selectedValue={fencedYard}
                onChangeValue={setFencedYard}
                textTitle=""
                textValue=""
                onChangeTextValue={() => {}}
              />
            </div>
          </div>
          <div className="row mt-2">
            <div className="col-md-6">
              <div className="form-inner mb-0">
                <label>
                  What other type of exercise does your pet receive?
                </label>
              </div>
              <div className="form-inner ms-2">
                <input
                  type="text"
                  value={exerciseType}
                  onChange={(e) => setExerciseType(e.target.value)}
                  placeholder="Type here"
                  className="w-100"
                />
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-md-4">
              <div className="form-inner mb-0">
                <label>When do they eat (AM, PM, both)?</label>
              </div>
              <div className="form-inner ms-4 d-flex gap-4">
                <div className="d-flex align-items-center">
                  <input
                    type="checkbox"
                    id="eating_times_AM"
                    value="AM"
                    checked={eatingTimes.includes("AM")}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setEatingTimes([...eatingTimes, "AM"]);
                      } else {
                        setEatingTimes(
                          eatingTimes.filter((item) => item !== "AM")
                        );
                      }
                    }}
                    style={{
                      marginRight: "8px",
                      width: "18px",
                      height: "18px",
                      flexShrink: 0,
                      accentColor: "#848484",
                    }}
                  />
                  <label htmlFor="eating_times_AM" style={{ marginBottom: 0 }}>
                    AM
                  </label>
                </div>
                <div className="d-flex align-items-center">
                  <input
                    type="checkbox"
                    id="eating_times_PM"
                    value="PM"
                    checked={eatingTimes.includes("PM")}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setEatingTimes([...eatingTimes, "PM"]);
                      } else {
                        setEatingTimes(
                          eatingTimes.filter((item) => item !== "PM")
                        );
                      }
                    }}
                    style={{
                      marginRight: "8px",
                      width: "18px",
                      height: "18px",
                      flexShrink: 0,
                      accentColor: "#848484",
                    }}
                  />
                  <label htmlFor="eating_times_PM" style={{ marginBottom: 0 }}>
                    PM
                  </label>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="form-inner mb-0">
                <label>How do they eat (all at once or graze)?</label>
              </div>
              <div className="d-flex gap-4 ms-4">
                <div className="form-check payment-check mb-1">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="eatingStyle"
                    id="eatingStyle1"
                    value="all at once"
                    checked={eatingStyle === "all at once"}
                    onChange={(e) => setEatingStyle(e.target.value)}
                  />
                  <label className="fs-5 fw-normal" htmlFor="eatingStyle1">
                    All at once
                  </label>
                </div>
                <div className="form-check payment-check mb-1">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="eatingStyle"
                    id="eatingStyle2"
                    value="graze"
                    checked={eatingStyle === "graze"}
                    onChange={(e) => setEatingStyle(e.target.value)}
                  />
                  <label className="fs-5 fw-normal" htmlFor="eatingStyle2">
                    Graze
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="divider my-4">
            <span className="fs-5 fw-semibold">Household</span>
          </div>

          <div className="row">
            <div className="col-md-12">
              <div className="form-inner mb-0">
                <label>Who else lives in the house?</label>
              </div>
              <div className="form-inner ms-4 d-flex gap-4 flex-wrap">
                <div className="d-flex align-items-center">
                  <input
                    type="checkbox"
                    id="household_members_adults"
                    value="adults"
                    checked={householdMembers.includes("adults")}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setHouseholdMembers([...householdMembers, "adults"]);
                      } else {
                        setHouseholdMembers(
                          householdMembers.filter((item) => item !== "adults")
                        );
                      }
                    }}
                    style={{
                      marginRight: "8px",
                      width: "18px",
                      height: "18px",
                      flexShrink: 0,
                      accentColor: "#848484",
                    }}
                  />
                  <label
                    htmlFor="household_members_adults"
                    style={{ marginBottom: 0 }}
                  >
                    Adults
                  </label>
                </div>
                <div className="d-flex align-items-center">
                  <input
                    type="checkbox"
                    id="household_members_children"
                    value="children"
                    checked={householdMembers.includes("children")}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setHouseholdMembers([...householdMembers, "children"]);
                      } else {
                        setHouseholdMembers(
                          householdMembers.filter((item) => item !== "children")
                        );
                      }
                    }}
                    style={{
                      marginRight: "8px",
                      width: "18px",
                      height: "18px",
                      flexShrink: 0,
                      accentColor: "#848484",
                    }}
                  />
                  <label
                    htmlFor="household_members_children"
                    style={{ marginBottom: 0 }}
                  >
                    Children
                  </label>
                </div>
                <div className="d-flex align-items-center">
                  <input
                    type="checkbox"
                    id="household_members_other_pets"
                    value="other pets"
                    checked={householdMembers.includes("other pets")}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setHouseholdMembers([
                          ...householdMembers,
                          "other pets",
                        ]);
                      } else {
                        setHouseholdMembers(
                          householdMembers.filter(
                            (item) => item !== "other pets"
                          )
                        );
                      }
                    }}
                    style={{
                      marginRight: "8px",
                      width: "18px",
                      height: "18px",
                      flexShrink: 0,
                      accentColor: "#848484",
                    }}
                  />
                  <label
                    htmlFor="household_members_other_pets"
                    style={{ marginBottom: 0 }}
                  >
                    Other Pets
                  </label>
                </div>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-md-6">
              <div className="form-inner mb-0">
                <label>How do they get along?</label>
              </div>
              <div className="form-inner ms-2">
                <input
                  type="text"
                  value={gettingAlong}
                  onChange={(e) => setGettingAlong(e.target.value)}
                  placeholder="Type here"
                  className="w-100"
                />
              </div>
            </div>
            <div className="col-md-6">
              <div className="form-inner mb-0">
                <label>Who else cares for the pet?</label>
              </div>
              <div className="form-inner ms-2">
                <input
                  type="text"
                  value={whoCaresForPet}
                  onChange={(e) => setWhoCaresForPet(e.target.value)}
                  placeholder="Type here"
                  className="w-100"
                />
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-md-4">
              <QuestionnairePrimaryInputs
                id="doYouWork"
                title="Do you work?"
                values={["yes", "no"]}
                selectedValue={doYouWork}
                onChangeValue={setDoYouWork}
                textTitle=""
                textValue=""
                onChangeTextValue={() => {}}
              />
            </div>
          </div>
          <div className="row mt-2">
            <div className="col-md-6">
              <div className="form-inner mb-0">
                <label>What does your pet do throughout the day?</label>
              </div>
              <div className="form-inner ms-2">
                <input
                  type="text"
                  value={petDailyActivities}
                  onChange={(e) => setPetDailyActivities(e.target.value)}
                  placeholder="Type here"
                  className="w-100"
                />
              </div>
            </div>
            <div className="col-md-6">
              <div className="form-inner mb-0">
                <label>Who lets your pet out during the day?</label>
              </div>
              <div className="form-inner ms-2">
                <input
                  type="text"
                  value={whoLetsOut}
                  onChange={(e) => setWhoLetsOut(e.target.value)}
                  placeholder="Type here"
                  className="w-100"
                />
              </div>
            </div>
          </div>

          <div className="divider my-4">
            <span className="fs-5 fw-semibold">Sociability/behavior</span>
          </div>
          <div className="row">
            <div className="col-md-6">
              <div className="form-inner mb-0">
                <label>How is your pet with people they don't know?</label>
              </div>
              <div className="form-inner ms-2">
                <input
                  type="text"
                  value={withUnknownPeople}
                  onChange={(e) => setWithUnknownPeople(e.target.value)}
                  placeholder="Type here"
                  className="w-100"
                />
              </div>
            </div>
            <div className="col-md-6">
              <div className="form-inner mb-0">
                <label>How is your pet with dogs they don't know?</label>
              </div>
              <div className="form-inner ms-2">
                <input
                  type="text"
                  value={withUnknownDogs}
                  onChange={(e) => setWithUnknownDogs(e.target.value)}
                  placeholder="Type here"
                  className="w-100"
                />
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-md-4">
              <QuestionnairePrimaryInputs
                id="everBittenSomeone"
                title="Has your pet ever bit someone?"
                values={["yes", "no"]}
                selectedValue={everBittenSomeone}
                onChangeValue={setEverBittenSomeone}
                textTitle=""
                textValue=""
                onChangeTextValue={() => {}}
              />
            </div>
            <div className="col-md-4">
              <QuestionnairePrimaryInputs
                id="triedToBite"
                title="Has your dog tried to bite someone?"
                values={["yes", "no"]}
                selectedValue={triedToBite}
                onChangeValue={setTriedToBite}
                textTitle=""
                textValue=""
                onChangeTextValue={() => {}}
              />
            </div>
            <div className="col-md-4">
              <QuestionnairePrimaryInputs
                id="foughtWithDogs"
                title="Has your pet ever fought with another dog?"
                values={["yes", "no"]}
                selectedValue={foughtWithDogs}
                onChangeValue={setFoughtWithDogs}
                textTitle=""
                textValue=""
                onChangeTextValue={() => {}}
              />
            </div>
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

export default QuestionnaireTraining;
