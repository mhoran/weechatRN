export const CHANGE_CURRENT_BUFFER = "CHANGE_CURRENT_BUFFER";

export const changeCurrentBuffer = bufferName => ({
  type: CHANGE_CURRENT_BUFFER,
  bufferName
});
