const QuestionnaireSecondaryInputs = (props) => {
  const { id, title, values, selectedValue, onChangeValue, classes } = props;
  return (
    <div className={`mb-4 ${classes}`}>
      <div className="form-inner mb-0">
        <label>{title}</label>
      </div>
      {values.map((value, idx) => (
        <div className="form-check payment-check mb-1 ms-3" key={idx}>
          <input
            className="form-check-input"
            type="radio"
            name={id}
            id={`${id}${idx}`}
            value={value}
            checked={selectedValue === value}
            onChange={(e) => onChangeValue(e.target.value)}
          />
          <label
            className="fw-normal"
            htmlFor={`${id}${idx}`}
            style={{ fontSize: "17px" }}
          >
            {value.charAt(0).toUpperCase() + value.slice(1)}
          </label>
        </div>
      ))}
    </div>
  );
};

export default QuestionnaireSecondaryInputs;
