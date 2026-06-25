const QuestionnairePrimaryInputs = (props) => {
  const {
    id,
    title,
    values,
    selectedValue,
    onChangeValue,
    textTitle,
    textValue,
    onChangeTextValue,
  } = props;
  return (
    <div>
      <div className="form-inner mb-0">
        <label>{title}</label>
      </div>
      <div className="d-flex gap-4 ms-4">
        <div className="form-check payment-check mb-1">
          <input
            className="form-check-input"
            type="radio"
            name={id}
            id={`${id}1`}
            value={values[0]}
            checked={selectedValue === values[0]}
            onChange={(e) => onChangeValue(e.target.value)}
          />
          <label className="fs-5 fw-normal" htmlFor={`${id}1`}>
            {values[0].charAt(0).toUpperCase() + values[0].slice(1)}
          </label>
        </div>
        <div className="form-check payment-check mb-1">
          <input
            className="form-check-input"
            type="radio"
            name={id}
            id={`${id}2`}
            value={values[1]}
            checked={selectedValue === values[1]}
            onChange={(e) => onChangeValue(e.target.value)}
          />
          <label className="fs-5 fw-normal" htmlFor={`${id}2`}>
            {values[1].charAt(0).toUpperCase() + values[1].slice(1)}
          </label>
        </div>
      </div>
      {textTitle && (
        <div className="form-inner ms-4">
          <label className="fw-normal">{textTitle}</label>
          <textarea
            name="groomedBeforeDetail"
            value={selectedValue !== values[1] ? textValue : ""}
            onChange={(e) => onChangeTextValue(e.target.value)}
            disabled={selectedValue === values[1]}
          />
        </div>
      )}
    </div>
  );
};

export default QuestionnairePrimaryInputs;
