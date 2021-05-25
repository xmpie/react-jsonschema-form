export function removeEmptyArrays(formData) {
  for (var key in formData) {
    var arr = formData[key];

    if (Array.isArray(arr)) {
      // Iterate through all elements and remove empty arrays
      var nonEmptyArr = [];
      for (var i = 0; i < arr.length; ++i) {
        // Recursive call if it's an object inside an array
        if (typeof arr[i] === "object") {
          removeEmptyArrays(arr);
        }

        // Save all non-empty arrays or objects inside this one
        if (
          (Array.isArray(arr[i]) && arr[i].length > 0) ||
          !Array.isArray(arr[i])
        ) {
          nonEmptyArr.push(arr[i]);
        }
      }

      formData[key] = nonEmptyArr;
      return;
    }

    // Recursive call if it's an object
    if (typeof arr === "object") {
      removeEmptyArrays(arr);
    }
  }
}
export function filterErrors(
  errors,
  errorSchema,
  formDataFromEvent,
  toErrorSchema
) {
  var formDataDirectKeys = Object.keys(flattenObject(formDataFromEvent, ""));
  var filteredErrors = [];
  errors.forEach(error => {
    if (formDataDirectKeys.find(key => error.property == key)) {
      filteredErrors.push(error);
    }
  });
  errors = filteredErrors;
  errorSchema = toErrorSchema(filteredErrors);
  return { errors, errorSchema };
}

function flattenObject(obj, previousKey) {
  const flattened = {};
  if (typeof obj !== "object") {
    flattened[previousKey] = obj;
  } else {
    Object.keys(obj).forEach(key => {
      if (typeof obj[key] === "object" && obj[key] !== null) {
        if (Array.isArray(obj[key])) {
          if (obj[key].length == 0) {
            flattened[previousKey + "." + key] = [];
          } else {
            obj[key].map((objArray, index) =>
              Object.assign(
                flattened,
                flattenObject(
                  objArray,
                  previousKey != null
                    ? previousKey + "." + key + "[" + index + "]"
                    : key + "[" + index + "]"
                )
              )
            );
          }
        } else {
          Object.assign(
            flattened,
            flattenObject(
              obj[key],
              previousKey != null ? previousKey + "." + key : key
            )
          );
        }
      } else {
        flattened[previousKey != null ? previousKey + "." + key : key] =
          obj[key];
      }
    });
  }
  return flattened;
}

export function searchFormDataForErrorSchema(
  newErrorSchemaFragement,
  formDataFragement,
  errorSchemaFragement
) {
  Object.keys(errorSchemaFragement).forEach(key => {
    if (key != "__errors" && formDataFragement[key] !== undefined) {
      newErrorSchemaFragement[key] = {
        __errors: errorSchemaFragement[key]["__errors"],
      };
      searchFormDataForErrorSchema(
        newErrorSchemaFragement[key],
        formDataFragement[key],
        errorSchemaFragement[key]
      );
    }
  });
}
