#include "ScrollViewComponentWrapper.h"

#ifdef RCT_NEW_ARCH_ENABLED
#include <React/RCTScrollViewComponentView.h>
#define ReactScrollViewBase RCTScrollViewComponentView
#else
#include <React/RCTScrollView.h>
#define ReactScrollViewBase RCTScrollView
#endif

@interface ScrollViewComponentWrapper ()

@property (nonatomic, readwrite, assign) BOOL isScrollViewPanning;

@end

@implementation ScrollViewComponentWrapper {
  __weak ReactScrollViewBase *_scrollViewComponentView;
}

@synthesize isScrollViewPanning;

- (instancetype)initWithView:(UIView *)view {
  if (![view isKindOfClass:[ReactScrollViewBase class]]) {
    return nil;
  }

  self = [super init];
  _scrollViewComponentView = (ReactScrollViewBase *)view;
  isScrollViewPanning = false;
  [_scrollViewComponentView.scrollView.panGestureRecognizer
      addTarget:self
          action:@selector(scrollViewPanned:)];
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

- (void)scrollViewPanned:(UIPanGestureRecognizer *)gesture {
  if (gesture.state == UIGestureRecognizerStateBegan) {
    isScrollViewPanning = YES;
  } else if (gesture.state == UIGestureRecognizerStateEnded) {
    isScrollViewPanning = NO;
  }
}

@end
