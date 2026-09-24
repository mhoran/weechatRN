import ExpoModulesCore

class KeyboardAvoidingView: ExpoView, ViewBoundsObserving {
  private let measurer = BoundsObservableView()
  private weak var contentView: KeyboardAvoidingContentView?
  private var contentHeight: CGFloat?

  required init(appContext: AppContext? = nil) {
    super.init(appContext: appContext)

    clipsToBounds = true

    measurer.translatesAutoresizingMaskIntoConstraints = false
    measurer.isHidden = true
    measurer.delegate = self
    addSubview(measurer)

    NSLayoutConstraint.activate([
      measurer.leadingAnchor.constraint(equalTo: leadingAnchor),
      measurer.trailingAnchor.constraint(equalTo: trailingAnchor),
      measurer.bottomAnchor.constraint(equalTo: bottomAnchor),
    ])

    let measurerTopToKeyboard = measurer.topAnchor.constraint(
      equalTo: keyboardLayoutGuide.topAnchor)
    measurerTopToKeyboard.identifier = "measurerTopToKeyboard"
    keyboardLayoutGuide.setConstraints([measurerTopToKeyboard], activeWhenNearEdge: .bottom)

    let measurerTopToBottom = measurer.topAnchor.constraint(equalTo: bottomAnchor)
    measurerTopToBottom.identifier = "measurerTopToBottom"
    keyboardLayoutGuide.setConstraints([measurerTopToBottom], activeWhenAwayFrom: .bottom)

    keyboardLayoutGuide.followsUndockedKeyboard = true

    if #available(iOS 17.0, *) {
      keyboardLayoutGuide.usesBottomSafeArea = false
    }
  }

  func boundsDidChange(_ view: BoundsObservableView, from previousBounds: CGRect) {
    updateContentHeight()
  }

  override func layoutSubviews() {
    super.layoutSubviews()
    updateContentHeight()
  }

  private func updateContentHeight() {
    guard let contentView, bounds.height > 0 else {
      return
    }

    let height = max(0, bounds.height - max(0, measurer.bounds.height))
    if height == contentHeight {
      return
    }
    contentHeight = height

    contentView.setStyleSize(nil, height: NSNumber(value: Float(height)))
  }

  override func mountChildComponentView(_ childComponentView: UIView, index: Int) {
    if let childComponentView = childComponentView as? KeyboardAvoidingContentView {
      contentView = childComponentView
      contentHeight = nil
      setNeedsLayout()
    }

    insertSubview(childComponentView, at: index)
  }

  override func unmountChildComponentView(_ childComponentView: UIView, index: Int) {
    if childComponentView === contentView {
      contentView = nil
      contentHeight = nil
    }

    childComponentView.removeFromSuperview()
  }
}
