export const formatUrl = (type: string, text: string): string => {
  switch (type) {
    case 'url':
      return text;
    case 'email':
      return 'mailto:' + text;
    case 'phone':
      return 'tel:' + text;
    default:
      return text;
  }
};
