extension Notification {
  var animationCurve: UInt? {
    return userInfo?[UIResponder.keyboardAnimationCurveUserInfoKey] as? UInt
  }

  var animationDuration: Double? {
    return userInfo?[UIResponder.keyboardAnimationDurationUserInfoKey] as? Double
  }

  var keyboardFrameEnd: CGRect? {
    return userInfo?[UIResponder.keyboardFrameEndUserInfoKey] as? CGRect
  }

  var isLocalKeyboard: Bool {
    return userInfo?[UIResponder.keyboardIsLocalUserInfoKey] as? Bool ?? false
  }
}
