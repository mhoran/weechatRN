#import "ScrollViewComponentWrapper.h"

#import <React/RCTScrollViewComponentView.h>
#define ReactScrollViewBase RCTScrollViewComponentView

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

- (void)setInsetsFromKeyboardHeight:(CGFloat)keyboardHeight
                       updateOffset:(BOOL)updateOffset {
  if (!_scrollViewComponentView) {
    return;
  }

  CGPoint contentOffset = _scrollViewComponentView.scrollView.contentOffset;
  UIEdgeInsets currentContentInset =
      _scrollViewComponentView.scrollView.contentInset;
  UIEdgeInsets newContentInset =
      _scrollViewComponentView.scrollView.contentInset;

  bool isInverted = [self isInverted];
  if (isInverted) {
    newContentInset.bottom = keyboardHeight;
  } else {
    newContentInset.top = keyboardHeight;
  }

  if (UIEdgeInsetsEqualToEdgeInsets(newContentInset, currentContentInset)) {
    return;
  }

  _scrollViewComponentView.scrollView.contentInset = newContentInset;
  _scrollViewComponentView.scrollView.scrollIndicatorInsets = newContentInset;

  if (updateOffset) {
    contentOffset.y -= isInverted ? 0 : keyboardHeight;
    _scrollViewComponentView.scrollView.contentOffset = contentOffset;
  }
}

- (bool)isInverted {
  // Look into the entry at position 2,2 to check if scaleY is applied
  return _scrollViewComponentView.layer.transform.m22 == -1;
}

- (nullable UIView *)view {
  return (UIView *)_scrollViewComponentView;
}

@end
