import ExpoModulesCore

// This view will be used as a native component. Make sure to inherit from `ExpoView`
// to apply the proper styling (e.g. border radius and shadows).
class KeyboardAvoidingView: ExpoView, ViewBoundsObserving {
  private let measurer = BoundsObservableView()
  private let container = UIView()
  private var scrollViewComponent: ScrollViewComponentWrapper?

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
    ])

    let measurerTopToKeyboard = measurer.topAnchor.constraint(
      equalTo: keyboardLayoutGuide.topAnchor)
    measurerTopToKeyboard.identifier = "measurerTopToKeyboard"
    let containerBottomToKeyboard = container.bottomAnchor.constraint(
      equalTo: keyboardLayoutGuide.topAnchor)
    containerBottomToKeyboard.identifier = "containerBottomToKeyboard"
    keyboardLayoutGuide.setConstraints(
      [measurerTopToKeyboard, containerBottomToKeyboard], activeWhenNearEdge: .bottom)

    let measurerTopToBottom = measurer.topAnchor.constraint(equalTo: bottomAnchor)
    measurerTopToBottom.identifier = "measurerTopToKeyboard"
    let containerBottomToBottom = container.bottomAnchor.constraint(equalTo: bottomAnchor)
    containerBottomToBottom.identifier = "containerBottomToKeyboard"
    keyboardLayoutGuide.setConstraints(
      [measurerTopToBottom, containerBottomToBottom], activeWhenAwayFrom: .bottom)

    keyboardLayoutGuide.followsUndockedKeyboard = true

    if #available(iOS 17.0, *) {
      keyboardLayoutGuide.usesBottomSafeArea = false
    }
  }

  func boundsDidChange(_ view: BoundsObservableView, from previousBounds: CGRect) {
    self.scrollViewComponent?.setInsetsFromKeyboardHeight(view.bounds.height)
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
