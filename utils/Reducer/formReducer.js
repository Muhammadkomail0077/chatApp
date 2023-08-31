export const reducer = (state, action) => {
  const {validationResult, inputId, inputValue} = action;

  const updateValues = {
    ...state.inputValues,
    [inputId]: inputValue,
  };

  const updateValidities = {
    ...state.inputValidities,
    [inputId]: validationResult,
  };

  let updatedFormIsValid = true;
  for (const key in updateValidities) {
    if (updateValidities[key] !== undefined) {
      updatedFormIsValid = false;
      break;
    }
  }

  return {
    inputValues: updateValues,
    inputValidities: updateValidities,
    formIsValid: updatedFormIsValid,
  };
};
