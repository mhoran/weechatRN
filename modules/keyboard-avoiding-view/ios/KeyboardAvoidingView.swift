import ExpoModulesCore

// This view will be used as a native component. Make sure to inherit from `ExpoView`
// to apply the proper styling (e.g. border radius and shadows).
class KeyboardAvoidingView: ExpoView, ViewBoundsObserving {
  private let measurer = BoundsObservableView()
  private let container = UIView()
  private var scrollViewComponent: ScrollViewComponentWrapper?
  private var onKeyboardHeightChanged = EventDispatcher()

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
      measurer.leadingAnchor.constraint(equalTo: leadingAnchor),
      measurer.trailingAnchor.constraint(equalTo: trailingAnchor),
      measurer.bottomAnchor.constraint(equalTo: bottomAnchor),
    ])

    NSLayoutConstraint.activate([
      container.heightAnchor.constraint(equalTo: heightAnchor),
      container.leadingAnchor.constraint(equalTo: leadingAnchor),
      container.trailingAnchor.constraint(equalTo: trailingAnchor),
      container.bottomAnchor.constraint(equalTo: bottomAnchor),
    ])

    let measurerTopToKeyboard = measurer.topAnchor.constraint(
      equalTo: keyboardLayoutGuide.topAnchor)
    measurerTopToKeyboard.identifier = "measurerTopToKeyboard"
    keyboardLayoutGuide.setConstraints(
      [measurerTopToKeyboard], activeWhenNearEdge: .bottom)

    let measurerTopToBottom = measurer.topAnchor.constraint(equalTo: bottomAnchor)
    measurerTopToBottom.identifier = "measurerTopToKeyboard"
    keyboardLayoutGuide.setConstraints(
      [measurerTopToBottom], activeWhenAwayFrom: .bottom)

    keyboardLayoutGuide.followsUndockedKeyboard = true

    if #available(iOS 17.0, *) {
      keyboardLayoutGuide.usesBottomSafeArea = false
    }
  }

  func boundsDidChange(_ view: BoundsObservableView, from previousBounds: CGRect) {
    let animation = view.layer.animation(forKey: "bounds.size")
    onKeyboardHeightChanged(
      ["height": view.bounds.height,
       "duration": (animation?.duration ?? 0) * 1000]
    )
  }

#if RCT_NEW_ARCH_ENABLED
  override func mountChildComponentView(_ childComponentView: UIView, index: Int) {
    container.insertSubview(childComponentView, at: index)
  }

  override func unmountChildComponentView(_ childComponentView: UIView, index: Int) {
    childComponentView.removeFromSuperview()
  }
#else
  override func insertReactSubview(_ subview: UIView!, at index: Int) {
    super.insertReactSubview(subview, at: index)

    container.insertSubview(subview, at: index)
  }

  override func removeReactSubview(_ subview: UIView!) {
    super.removeReactSubview(subview)

    subview.removeFromSuperview()
  }

  override func didUpdateReactSubviews() {
    // no-op
  }
#endif
}
