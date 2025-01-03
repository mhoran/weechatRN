import ExpoModulesCore

// This view will be used as a native component. Make sure to inherit from `ExpoView`
// to apply the proper styling (e.g. border radius and shadows).
class KeyboardAvoidingView: ExpoView, ViewBoundsObserving {
  private let measurer = BoundsObservableView()
  private let container = UIView()
  private var scrollViewComponent: ScrollViewComponentWrapper?
  private lazy var containerBottomAnchorConstraint =
    container.bottomAnchor.constraint(equalTo: bottomAnchor)
  private var isKeyboardShown = false

  required init(appContext: AppContext? = nil) {
    super.init(appContext: appContext)

    clipsToBounds = true

    measurer.translatesAutoresizingMaskIntoConstraints = false
    measurer.isHidden = true
    measurer.delegate = self
    addSubview(measurer)

    container.translatesAutoresizingMaskIntoConstraints = false
    addSubview(container)

    NSLayoutConstraint.activate([
      measurer.topAnchor.constraint(equalTo: keyboardLayoutGuide.topAnchor),
      measurer.leadingAnchor.constraint(equalTo: leadingAnchor),
      measurer.trailingAnchor.constraint(equalTo: trailingAnchor),
      measurer.bottomAnchor.constraint(equalTo: bottomAnchor),
    ])

    NSLayoutConstraint.activate([
      container.heightAnchor.constraint(equalTo: heightAnchor),
      container.leadingAnchor.constraint(equalTo: leadingAnchor),
      container.trailingAnchor.constraint(equalTo: trailingAnchor),
      containerBottomAnchorConstraint,
    ])

    NotificationCenter.default.addObserver(
      self,
      selector: #selector(keyboardWillShow),
      name: UIResponder.keyboardWillShowNotification,
      object: nil
    )

    NotificationCenter.default.addObserver(
      self,
      selector: #selector(keyboardDidShow),
      name: UIResponder.keyboardDidShowNotification,
      object: nil
    )

    NotificationCenter.default.addObserver(
      self,
      selector: #selector(keyboardWillChangeFrame),
      name: UIResponder.keyboardWillChangeFrameNotification,
      object: nil
    )

    NotificationCenter.default.addObserver(
      self,
      selector: #selector(keyboardWillHide),
      name: UIResponder.keyboardWillHideNotification,
      object: nil
    )

    if #available(iOS 17.0, *) {
      keyboardLayoutGuide.usesBottomSafeArea = false
    }
  }

  @objc private func keyboardWillShow(_ notification: Notification) {
    guard notification.isLocalKeyboard else { return }

    updateInsets(notification)
  }

  @objc private func keyboardDidShow(_ notification: Notification) {
    guard notification.isLocalKeyboard else { return }

    isKeyboardShown = true
  }

  @objc private func keyboardWillChangeFrame(_ notification: Notification) {
    guard notification.isLocalKeyboard && isKeyboardShown else { return }

    updateInsets(notification)
  }

  private func updateInsets(_ notification: Notification, closing: Bool = false) {
    guard let animationCurve = notification.animationCurve,
      let animationDuration = notification.animationDuration,
      let keyboardFrameEnd = notification.keyboardFrameEnd,
      let fromCoordinateSpace = window?.screen.coordinateSpace
    else { return }

    let animationOptions = UIView.AnimationOptions(rawValue: animationCurve << 16)

    let convertedFrameEnd = convert(keyboardFrameEnd, from: fromCoordinateSpace)
    let viewIntersection = bounds.intersection(convertedFrameEnd)
    let keyboardHeight =
      closing || viewIntersection.isEmpty ? 0 : bounds.maxY - viewIntersection.minY

    UIView.animate(
      withDuration: animationDuration, delay: 0.0,
      options: [animationOptions, .beginFromCurrentState]
    ) {
      self.scrollViewComponent?.setInsetsFromKeyboardHeight(keyboardHeight)
      self.containerBottomAnchorConstraint.constant = -keyboardHeight
      self.layoutIfNeeded()
    }
  }

  @objc private func keyboardWillHide(_ notification: Notification) {
    guard notification.isLocalKeyboard else { return }

    isKeyboardShown = false
    updateInsets(notification, closing: true)
  }

  func boundsDidChange(_ view: BoundsObservableView, from previousBounds: CGRect) {
    guard isKeyboardShown && scrollViewComponent?.isScrollViewPanning == true else { return }

    self.scrollViewComponent?.setInsetsFromKeyboardHeight(view.bounds.height)
    self.containerBottomAnchorConstraint.constant = -view.bounds.height
    self.layoutIfNeeded()
}

#if RCT_NEW_ARCH_ENABLED
  override func mountChildComponentView(_ childComponentView: UIView, index: Int) {
    // FIXME: Use a nativeID to find the ScrollView
    if index == 0 {
      scrollViewComponent = ScrollViewComponentWrapper(view: childComponentView)
    }
    container.insertSubview(childComponentView, at: index)
  }

  override func unmountChildComponentView(_ childComponentView: UIView, index: Int) {
    if childComponentView === scrollViewComponent?.view {
      scrollViewComponent = nil
    }
    childComponentView.removeFromSuperview()
  }
#else
  override func insertReactSubview(_ subview: UIView!, at index: Int) {
    super.insertReactSubview(subview, at: index)

    // FIXME: Use a nativeID to find the ScrollView
    if index == 0 {
      scrollViewComponent = ScrollViewComponentWrapper(view: subview)
    }
    container.insertSubview(subview, at: index)
  }

  override func removeReactSubview(_ subview: UIView!) {
    super.removeReactSubview(subview)

    if subview === scrollViewComponent?.view {
      scrollViewComponent = nil
    }
    subview.removeFromSuperview()
  }

  override func didUpdateReactSubviews() {
    // no-op
  }
#endif
}
