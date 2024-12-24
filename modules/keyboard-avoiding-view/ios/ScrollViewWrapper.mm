#include "ScrollViewWrapper.h"

#ifdef RCT_NEW_ARCH_ENABLED
#include <React/RCTScrollViewComponentView.h>
#define ReactScrollViewBase RCTScrollViewComponentView
#else
#include <React/RCTScrollView.h>
#define ReactScrollViewBase RCTScrollView
#endif

@implementation ScrollViewWrapper {
  __weak ReactScrollViewBase *_scrollView;
}

- (instancetype)initWithView:(UIView *)view {
  self = [super init];
  if ([view isKindOfClass:[ReactScrollViewBase class]]) {
    _scrollView = (ReactScrollViewBase *)view;
  }
  return self;
}

- (void)setInsetsFromKeyboardHeight:(CGFloat)keyboardHeight {
  if (!_scrollView) {
    return;
  }

  UIEdgeInsets newEdgeInsets = _scrollView.scrollView.contentInset;
  if ([self isInverted]) {
    newEdgeInsets.bottom = keyboardHeight;
  } else {
    newEdgeInsets.top = keyboardHeight;
  }

  _scrollView.scrollView.contentInset = newEdgeInsets;
  _scrollView.scrollView.scrollIndicatorInsets = newEdgeInsets;
}

- (bool)isInverted {
  // Look into the entry at position 2,2 to check if scaleY is applied
  return _scrollView.layer.transform.m22 == -1;
}

- (UIView *)view {
  return (UIView *)_scrollView;
}

@end
