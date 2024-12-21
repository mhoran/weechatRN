import ExpoModulesCore
import WebKit

// This view will be used as a native component. Make sure to inherit from `ExpoView`
// to apply the proper styling (e.g. border radius and shadows).
class KeyboardAvoidingView: ExpoView {
  private let container = UIView()
  private let measurer = UIView()
  let onKeyboardHeightChange = EventDispatcher()

  required init(appContext: AppContext? = nil) {
    super.init(appContext: appContext)

    addSubview(measurer)
    measurer.translatesAutoresizingMaskIntoConstraints = false
    measurer.isHidden = true

    NSLayoutConstraint.activate([
      measurer.topAnchor.constraint(equalTo: keyboardLayoutGuide.topAnchor),
      measurer.leadingAnchor.constraint(equalTo: leadingAnchor),
      measurer.trailingAnchor.constraint(equalTo: trailingAnchor),
      measurer.bottomAnchor.constraint(equalTo: bottomAnchor),
    ])
    measurer.addObserver(self, forKeyPath: "center", options: .new, context: nil)

    addSubview(container)
    container.translatesAutoresizingMaskIntoConstraints = false

    NSLayoutConstraint.activate([
      container.heightAnchor.constraint(equalTo: heightAnchor),
      container.leadingAnchor.constraint(equalTo: leadingAnchor),
      container.trailingAnchor.constraint(equalTo: trailingAnchor),
      container.bottomAnchor.constraint(equalTo: keyboardLayoutGuide.topAnchor),
    ])
  }

  @objc override public func observeValue(
    forKeyPath keyPath: String?,
    of object: Any?,
    change: [NSKeyValueChangeKey: Any]?,
    context _: UnsafeMutableRawPointer?
  ) {
    if keyPath == "center", object as? NSObject == measurer {
      onKeyboardHeightChange(["height": measurer.frame.height])
    }
  }

  override func mountChildComponentView(_ childComponentView: UIView, index: Int) {
    container.insertSubview(childComponentView, at: index)
  }

  override func unmountChildComponentView(_ childComponentView: UIView, index: Int) {
    childComponentView.removeFromSuperview()
  }
}
