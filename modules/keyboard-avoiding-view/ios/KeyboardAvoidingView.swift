import ExpoModulesCore

// This view will be used as a native component. Make sure to inherit from `ExpoView`
// to apply the proper styling (e.g. border radius and shadows).
class KeyboardAvoidingView: ExpoView {
  private let container = UIView()
  private var scrollView: ScrollViewWrapper?

  required init(appContext: AppContext? = nil) {
    super.init(appContext: appContext)

    addSubview(container)
    container.translatesAutoresizingMaskIntoConstraints = false

    NSLayoutConstraint.activate([
      container.heightAnchor.constraint(equalTo: heightAnchor),
      container.leadingAnchor.constraint(equalTo: leadingAnchor),
      container.trailingAnchor.constraint(equalTo: trailingAnchor),
      container.bottomAnchor.constraint(equalTo: keyboardLayoutGuide.topAnchor),
    ])

    NotificationCenter.default.addObserver(
      self,
      selector: #selector(keyboardWillShow),
      name: UIResponder.keyboardWillShowNotification,
      object: nil
    )

    NotificationCenter.default.addObserver(
      self,
      selector: #selector(keyboardWillHide),
      name: UIResponder.keyboardWillHideNotification,
      object: nil
    )
  }

  @objc private func keyboardWillShow(_ notification: Notification) {
    keyboardLayoutGuide.followsUndockedKeyboard = true
    updateInsets(notification)
  }

  private func updateInsets(_ notification: Notification, closing: Bool = false) {
    let userInfo = notification.userInfo

    guard let animationCurve = userInfo?[UIResponder.keyboardAnimationCurveUserInfoKey] as? UInt,
      let animationDuration = userInfo?[UIResponder.keyboardAnimationDurationUserInfoKey]
        as? Double,
      let frameEnd = userInfo?[UIResponder.keyboardFrameEndUserInfoKey] as? NSValue,
      let fromCoordinateSpace = window?.screen.coordinateSpace
    else { return }

    let animationOptions = UIView.AnimationOptions(rawValue: animationCurve << 16)

    let absoluteOrigin = convert(bounds, to: fromCoordinateSpace)
    let keyboardHeight =
      closing ? 0 : fmax(CGRectGetMaxY(absoluteOrigin) - frameEnd.cgRectValue.origin.y, 0)

    UIView.animate(withDuration: animationDuration, delay: 0.0, options: animationOptions) {
      self.scrollView?.setInsetsFromKeyboardHeight(keyboardHeight)
    }
  }

  @objc private func keyboardWillHide(_ notification: Notification) {
    keyboardLayoutGuide.followsUndockedKeyboard = false
    updateInsets(notification, closing: true)
  }

#if RCT_NEW_ARCH_ENABLED
  override func mountChildComponentView(_ childComponentView: UIView, index: Int) {
    // FIXME: Use a nativeID to find the ScrollView
    if index == 0 {
      scrollView = ScrollViewWrapper(view: childComponentView)
    }
    container.insertSubview(childComponentView, at: index)
  }

  override func unmountChildComponentView(_ childComponentView: UIView, index: Int) {
    if childComponentView === scrollView?.view() {
      scrollView = nil
    }
    childComponentView.removeFromSuperview()
  }
#else
  override func insertReactSubview(_ subview: UIView!, at index: Int) {
    super.insertReactSubview(subview, at: index)

    // FIXME: Use a nativeID to find the ScrollView
    if index == 0 {
      scrollView = ScrollViewWrapper(view: subview)
    }
    container.insertSubview(subview, at: index)
  }

  override func removeReactSubview(_ subview: UIView!) {
    super.removeReactSubview(subview)

    if subview === scrollView?.view() {
      scrollView = nil
    }
    subview.removeFromSuperview()
  }

  override func didUpdateReactSubviews() {
    // no-op
  }
#endif
}
