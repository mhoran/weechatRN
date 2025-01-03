class BoundsObservableView: UIView {
  weak var delegate: ViewBoundsObserving?
  private var previousBounds: CGRect = .zero

  public override func layoutSubviews() {
    if bounds != previousBounds {
      delegate?.boundsDidChange(self, from: previousBounds)
      previousBounds = bounds
    }

    super.layoutSubviews()
  }
}
