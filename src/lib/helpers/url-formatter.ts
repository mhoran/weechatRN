export const formatUrl = (type, text) => {
  switch (type) {
    case "url":
      return text;
    case "email":
      return "mailto:" + text;
    case "phone":
      return "tel:" + text;
  }
};
