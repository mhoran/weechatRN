#import "ScrollViewComponentWrapper.h"

#ifdef RCT_NEW_ARCH_ENABLED
#import <React/RCTScrollViewComponentView.h>
#define ReactScrollViewBase RCTScrollViewComponentView
#else
#import <React/RCTScrollView.h>
#define ReactScrollViewBase RCTScrollView
#endif

@implementation ScrollViewComponentWrapper {
  __weak ReactScrollViewBase *_scrollViewComponentView;
}

- (instancetype)initWithView:(UIView *)view {
  if (![view isKindOfClass:[ReactScrollViewBase class]]) {
    return nil;
  }

  self = [super init];
  _scrollViewComponentView = (ReactScrollViewBase *)view;
  return self;
}

- (void)setInsetsFromKeyboardHeight:(CGFloat)keyboardHeight {
  if (!_scrollViewComponentView) {
    return;
  }

  UIEdgeInsets newEdgeInsets = _scrollViewComponentView.scrollView.contentInset;
  if ([self isInverted]) {
    newEdgeInsets.bottom = keyboardHeight;
  } else {
    newEdgeInsets.top = keyboardHeight;
  }

  _scrollViewComponentView.scrollView.contentInset = newEdgeInsets;
  _scrollViewComponentView.scrollView.scrollIndicatorInsets = newEdgeInsets;
}

- (bool)isInverted {
  // Look into the entry at position 2,2 to check if scaleY is applied
  return _scrollViewComponentView.layer.transform.m22 == -1;
}

- (nullable UIView *)view {
  return (UIView *)_scrollViewComponentView;
}

@end
