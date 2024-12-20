import ExpoModulesCore

// This view will be used as a native component. Make sure to inherit from `ExpoView`
// to apply the proper styling (e.g. border radius and shadows).
class KeyboardAvoidingView: ExpoView {
  private let container = UIView()

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
