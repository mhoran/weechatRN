protocol ViewBoundsObserving: AnyObject {
  func boundsDidChange(_ view: BoundsObservableView, from previousBounds: CGRect)
}
