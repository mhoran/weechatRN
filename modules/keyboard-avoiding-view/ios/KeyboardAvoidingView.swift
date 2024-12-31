import ExpoModulesCore

// This view will be used as a native component. Make sure to inherit from `ExpoView`
// to apply the proper styling (e.g. border radius and shadows).
class KeyboardAvoidingView: ExpoView, UIGestureRecognizerDelegate {
  private let measurer = UIView()
  private let container = UIView()
  private var scrollView: ScrollViewWrapper?
  private var measurerHasObserver = false
  private lazy var panGestureRecognizer: UIPanGestureRecognizer = {
    let panGestureRecognizer = UIPanGestureRecognizer(
      target: self, action: #selector(scrollViewPanned))
    panGestureRecognizer.delegate = self
    return panGestureRecognizer
  }()
  private var isScrollViewPanning = false
  private lazy var containerBottomAnchorConstraint: NSLayoutConstraint = {
    return container.bottomAnchor.constraint(equalTo: bottomAnchor)
  }()
  private var keyboardHidden = true

  required init(appContext: AppContext? = nil) {
    super.init(appContext: appContext)

    clipsToBounds = true

    addSubview(measurer)
    measurer.translatesAutoresizingMaskIntoConstraints = false
    measurer.isHidden = true

    addSubview(container)
    container.translatesAutoresizingMaskIntoConstraints = false

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

  deinit {
    if measurerHasObserver {
      measurer.removeObserver(self, forKeyPath: "center")
    }
  }

  @objc private func keyboardWillShow(_ notification: Notification) {
    updateInsets(notification)
  }

  @objc private func keyboardDidShow(_ notification: Notification) {
    // FIXME: don't use KVO
    if !measurerHasObserver {
      measurer.addObserver(self, forKeyPath: "center", options: .new, context: nil)
      measurerHasObserver = true
    }
    keyboardHidden = false
  }

  @objc private func keyboardWillChangeFrame(_ notification: Notification) {
    if (keyboardHidden) {
      return
    }
    updateInsets(notification)
  }

  private func updateInsets(_ notification: Notification, closing: Bool = false) {
    let userInfo = notification.userInfo

    guard let animationCurve = userInfo?[UIResponder.keyboardAnimationCurveUserInfoKey] as? UInt,
      let animationDuration = userInfo?[UIResponder.keyboardAnimationDurationUserInfoKey]
        as? Double,
      let frameEnd = userInfo?[UIResponder.keyboardFrameEndUserInfoKey] as? CGRect,
      let fromCoordinateSpace = window?.screen.coordinateSpace
    else { return }

    let animationOptions = UIView.AnimationOptions(rawValue: animationCurve << 16)

    let convertedFrameEnd = convert(frameEnd, from: fromCoordinateSpace)
    let viewIntersection = bounds.intersection(convertedFrameEnd)
    let keyboardHeight =
      closing || viewIntersection.isEmpty ? 0 : bounds.maxY - viewIntersection.minY

    UIView.animate(
      withDuration: animationDuration, delay: 0.0,
      options: [animationOptions, .beginFromCurrentState]
    ) {
      self.scrollView?.setInsetsFromKeyboardHeight(keyboardHeight)
      self.containerBottomAnchorConstraint.constant = -keyboardHeight
      self.layoutIfNeeded()
    }
  }

  @objc private func keyboardWillHide(_ notification: Notification) {
    if measurerHasObserver {
      measurer.removeObserver(self, forKeyPath: "center")
      measurerHasObserver = false
    }
    keyboardHidden = true
    updateInsets(notification, closing: true)
  }

  @objc override public func observeValue(
    forKeyPath keyPath: String?,
    of object: Any?,
    change: [NSKeyValueChangeKey: Any]?,
    context _: UnsafeMutableRawPointer?
  ) {
    if keyPath == "center", object as? NSObject == measurer {
      if !isScrollViewPanning {
        return
      }
      self.scrollView?.setInsetsFromKeyboardHeight(measurer.frame.height)
      self.containerBottomAnchorConstraint.constant = -measurer.frame.height
      self.layoutIfNeeded()
    }
  }

  func gestureRecognizer(
    _ gestureRecognizer: UIGestureRecognizer,
    shouldRecognizeSimultaneouslyWith otherGestureRecognizer: UIGestureRecognizer
  ) -> Bool {
    return gestureRecognizer.view == otherGestureRecognizer.view
  }

  @objc func scrollViewPanned(gesture: UIPanGestureRecognizer) {
    if gesture.state == .began {
      isScrollViewPanning = true
    } else if gesture.state == .ended {
      isScrollViewPanning = false
    }
  }

#if RCT_NEW_ARCH_ENABLED
  override func mountChildComponentView(_ childComponentView: UIView, index: Int) {
    // FIXME: Use a nativeID to find the ScrollView
    if index == 0 {
      scrollView = ScrollViewWrapper(view: childComponentView)
      scrollView?.addGestureRecognizer(panGestureRecognizer)
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
      scrollView?.addGestureRecognizer(panGestureRecognizer)
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
